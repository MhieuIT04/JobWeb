import os
import pandas as pd
import pickle
import numpy as np
from django.core.management.base import BaseCommand
from jobs.models import Job

"""
Generates job recommendation artifacts. Preference order:
1) Use sentence-transformers to compute multilingual embeddings and hnswlib for ANN index
2) Fallback to TF-IDF + cosine similarity if required packages are not available

Saved artifacts (in `recommendations/`):
- ANN mode: hnsw_index.bin, job_vectors.npy, indices.pkl, job_df.pkl
- TF-IDF mode (fallback): cosine_sim.pkl, indices.pkl, job_df.pkl

Run: python manage.py generate_recommendations
"""

class Command(BaseCommand):
    help = 'Generates job recommendations (ANN via sentence-transformers + hnswlib or fallback to TF-IDF cosine).'

    def add_arguments(self, parser):
        parser.add_argument('--tfidf-fallback-only', action='store_true', help='Force TF-IDF fallback even if ANN libs are available')

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting recommendation generation process...'))

        # 1. Load approved jobs
        jobs = Job.objects.filter(status='approved')
        if not jobs.exists():
            self.stdout.write(self.style.WARNING('No approved jobs found. Aborting.'))
            return

        df = pd.DataFrame(list(jobs.values('id', 'title', 'description')))
        df['content'] = df['title'].fillna('') + ' ' + df['description'].fillna('')

        # Ensure recommendations dir
        os.makedirs('recommendations', exist_ok=True)

        # Try ANN pipeline (sentence-transformers + hnswlib)
        use_tfidf = options.get('tfidf_fallback_only', False)
        if not use_tfidf:
            try:
                from sentence_transformers import SentenceTransformer  # type: ignore
                import hnswlib  # type: ignore

                self.stdout.write('>>> ANN libraries found: using sentence-transformers + hnswlib')

                # Choose a lightweight multilingual model
                model_name = 'paraphrase-multilingual-MiniLM-L12-v2'
                self.stdout.write(f'Loading embedding model: {model_name} (this may take a while)')
                model = SentenceTransformer(model_name)

                contents = df['content'].tolist()
                embeddings = model.encode(contents, show_progress_bar=True, convert_to_numpy=True)

                # Build HNSW index
                num_elements, dim = embeddings.shape
                self.stdout.write(f'Building HNSW index for {num_elements} items, dim={dim}')
                p = hnswlib.Index(space='cosine', dim=dim)
                p.init_index(max_elements=num_elements, ef_construction=200, M=16)
                p.add_items(embeddings, np.arange(num_elements))
                p.set_ef(50)

                # Save artifacts
                idx_path = 'recommendations/hnsw_index.bin'
                p.save_index(idx_path)
                np.save('recommendations/job_vectors.npy', embeddings)
                indices = pd.Series(df.index, index=df['id']).drop_duplicates()
                with open('recommendations/indices.pkl', 'wb') as f:
                    pickle.dump(indices, f)
                with open('recommendations/job_df.pkl', 'wb') as f:
                    pickle.dump(df[['id', 'title']], f)

                self.stdout.write(self.style.SUCCESS(f'Successfully saved ANN index to {idx_path} and mappings.'))
                return

            except Exception as e:
                self.stdout.write(self.style.WARNING(f'ANN pipeline unavailable or failed: {e}'))
                self.stdout.write(self.style.WARNING('Falling back to TF-IDF + cosine similarity.'))

        # TF-IDF fallback
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.metrics.pairwise import cosine_similarity

            self.stdout.write('>>> Running TF-IDF fallback pipeline')
            # Try to apply Vietnamese tokenization if underthesea is available
            try:
                from underthesea import word_tokenize
                self.stdout.write('Using Underthesea for Vietnamese tokenization in TF-IDF fallback')
                df['content_processed'] = df['content'].apply(lambda x: word_tokenize(x, format='text'))
            except Exception:
                # underthesea not available -> use raw content
                df['content_processed'] = df['content']

            tfidf = TfidfVectorizer(max_features=5000)
            tfidf_matrix = tfidf.fit_transform(df['content_processed'])
            self.stdout.write(f'Generated TF-IDF matrix with shape: {tfidf_matrix.shape}')

            # Use NearestNeighbors to compute top-k neighbors for each item (sparse-friendly)
            try:
                from sklearn.neighbors import NearestNeighbors
                self.stdout.write('Computing nearest neighbors (sparse, avoids dense N x N matrix)...')
                nn = NearestNeighbors(n_neighbors=6, metric='cosine', algorithm='brute', n_jobs=-1)
                nn.fit(tfidf_matrix)
                distances, indices_nn = nn.kneighbors(tfidf_matrix, return_distance=True)

                # Save neighbor indices and distances as numpy arrays
                np.save('recommendations/nn_indices.npy', indices_nn)
                np.save('recommendations/nn_distances.npy', distances)

                # Save mapping and job_df as before
                indices = pd.Series(df.index, index=df['id']).drop_duplicates()
                with open('recommendations/indices.pkl', 'wb') as f:
                    pickle.dump(indices, f)
                with open('recommendations/job_df.pkl', 'wb') as f:
                    pickle.dump(df[['id', 'title']], f)

                self.stdout.write(self.style.SUCCESS('Successfully saved TF-IDF nearest-neighbors artifacts to recommendations/'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error computing nearest neighbors: {e}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error in TF-IDF fallback pipeline: {e}'))