import pandas as pd
import re
import os
from joblib import dump
from django.core.management.base import BaseCommand
from sklearn.svm import LinearSVC
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from underthesea import word_tokenize
from jobs.models import Job

# Danh sách stop words mở rộng cho tiếng Việt
vietnamese_stop_words = [
    "và", "là", "của", "có", "được", "cho", "khi", "tại", "với", "như", "đã", "này", 
    "một", "trong", "để", "không", "các", "đến", "cũng", "ra", "về", "những", "làm", 
    "rất", "thì", "công ty", "việc làm", "yêu cầu", "kinh nghiệm", "ứng viên"
]

class Command(BaseCommand):
    help = 'Trains and saves a job category classification model with Underthesea preprocessing.'

    def add_arguments(self, parser):
        parser.add_argument('--min-samples-per-class', dest='min_samples_per_class', type=int, default=5,
                            help='Minimum number of samples per class to include in training (default=5)')
        parser.add_argument('--oversample', action='store_true', dest='oversample',
                            help='Apply RandomOverSampler to balance classes during training')
        parser.add_argument('--classifier', dest='classifier', type=str, default='linear_svc',
                            choices=['linear_svc', 'logistic'], help='Classifier to use: linear_svc (default) or logistic')
        parser.add_argument('--max-iter', dest='max_iter', type=int, default=10000,
                            help='Maximum iterations for LinearSVC (or LogisticRegression solver)')
        parser.add_argument('--fast', action='store_true', dest='fast',
                    help='Skip GridSearchCV and use default parameters for a faster run')
        parser.add_argument('--max-features', dest='max_features', type=int, default=None,
                    help='Limit TF-IDF max_features (vocabulary size). Use to speed up training.')
        parser.add_argument('--oversample-ratio', dest='oversample_ratio', type=float, default=0.5,
                    help='When oversampling, target ratio of minority class size to majority class (float in (0,1], default 0.5)')
        parser.add_argument('--verbose', action='store_true', dest='verbose',
                help='Show more detailed progress information during training')

    def preprocess_text(self, text):
        """Preprocess Vietnamese text with Underthesea tokenization."""
        if pd.isna(text):
            return ""
        # Lowercase and remove punctuation
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        # Tokenize using Underthesea
        tokens = word_tokenize(text, format="text")
        # Remove stop words
        tokens = ' '.join([t for t in tokens.split() if t not in vietnamese_stop_words])
        return tokens

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('>>> Starting model training process...'))

        # 1. Load and prepare data
        jobs = Job.objects.filter(status='approved', description__isnull=False, category__isnull=False)
        if jobs.count() < 100:  # Increase minimum samples for better training
            self.stdout.write(self.style.WARNING('Not enough job samples to train the model. Need at least 100.'))
            return

        df = pd.DataFrame(list(jobs.values('title', 'description', 'category_id')))
        df['content'] = df['title'].fillna('') + ' ' + df['description'].fillna('')

        # Apply preprocessing with Underthesea
        self.stdout.write('>>> Preprocessing text with Underthesea...')
        df['content'] = df['content'].apply(self.preprocess_text)

        # Filter classes with too few samples (to allow stratified CV)
        min_samples = kwargs.get('min_samples_per_class', 5)
        counts = df['category_id'].value_counts()
        self.stdout.write(f'---> Loaded {len(df)} job samples for training (before filtering).')
        self.stdout.write('>>> Class distribution (before):')
        self.stdout.write(str(counts))

        valid_classes = counts[counts >= min_samples].index
        removed_classes = counts[counts < min_samples]
        if len(removed_classes) > 0:
            self.stdout.write(self.style.WARNING(f'---> Removing {len(removed_classes)} classes with fewer than {min_samples} samples.'))
        df = df[df['category_id'].isin(valid_classes)]

        X = df['content']  # Text data
        y = df['category_id']  # Labels

        self.stdout.write(f'---> Using {len(df)} job samples for training (after filtering).')
        self.stdout.write('>>> Class distribution (after):')
        self.stdout.write(str(df['category_id'].value_counts()))

        # 2. Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        self.stdout.write(f'---> Split data into {len(X_train)} training samples and {len(X_test)} testing samples.')

        # 3. Build Pipeline
        oversample = kwargs.get('oversample', False)
        classifier_choice = kwargs.get('classifier', 'linear_svc')
        max_iter = kwargs.get('max_iter', 10000)

        # create classifier instance
        verbosity = kwargs.get('verbose', False)
        if classifier_choice == 'logistic':
            # use saga solver which supports l1/l2 and is suitable for large sparse data
            clf_instance = LogisticRegression(C=1.0, max_iter=max_iter, class_weight='balanced', solver='saga', n_jobs=-1, verbose=1 if verbosity else 0)
        else:
            # LinearSVC supports a verbose parameter
            clf_instance = LinearSVC(class_weight='balanced', max_iter=max_iter, verbose=1 if verbosity else 0)

        # Build Tfidf params
        tfidf_kwargs = {'ngram_range': (1, 2), 'max_df': 0.95, 'min_df': 2}
        if kwargs.get('max_features'):
            tfidf_kwargs['max_features'] = kwargs.get('max_features')

        # If oversampling requested, use imbalanced-learn's Pipeline with RandomOverSampler
        if oversample:
            try:
                from imblearn.over_sampling import RandomOverSampler
                from imblearn.pipeline import Pipeline as ImbPipeline
            except Exception:
                self.stdout.write(self.style.ERROR('!!! imbalanced-learn is required for oversampling. Please install it in the project venv (pip install imbalanced-learn)'))
                return

            oversample_ratio = kwargs.get('oversample_ratio', 0.5)
            # Build a valid sampling_strategy for multi-class when a float is provided
            sampling_strategy = oversample_ratio
            if isinstance(oversample_ratio, float):
                if oversample_ratio >= 1.0:
                    # resample all minority classes to majority size
                    sampling_strategy = 'not majority'
                else:
                    # compute per-class target = int(majority_count * oversample_ratio)
                    counts_train = None
                    try:
                        # y_train is available in outer scope; use it
                        counts_train = pd.Series(y_train).value_counts()
                    except Exception:
                        counts_train = None
                    if counts_train is not None:
                        majority = int(counts_train.max())
                        target = max(1, int(majority * oversample_ratio))
                        sampling_strategy = {int(cls): target for cls, cnt in counts_train.items() if cnt < target}
                        if not sampling_strategy:
                            sampling_strategy = 'not majority'

            text_clf = ImbPipeline([
                ('tfidf', TfidfVectorizer(**tfidf_kwargs)),
                ('sampler', RandomOverSampler(random_state=42, sampling_strategy=sampling_strategy)),
                ('clf', clf_instance),
            ])
        else:
            text_clf = Pipeline([
                ('tfidf', TfidfVectorizer(**tfidf_kwargs)),
                ('clf', clf_instance),
            ])

        # 4. Hyperparameter tuning with GridSearchCV
        self.stdout.write(self.style.SUCCESS('>>> Step 2: Tuning and training the model...'))
        fast = kwargs.get('fast', False)
        param_grid = {
            'tfidf__max_df': [0.8, 0.9],
            'tfidf__ngram_range': [(1, 1), (1, 2)],
            'clf__C': [0.1, 1, 10]
        }
        if fast:
            # skip grid search for faster iteration
            self.stdout.write(self.style.WARNING('---> Fast mode enabled: skipping GridSearchCV. Using default pipeline parameters.'))
            # do a straight fit
            text_clf.fit(X_train, y_train)
        else:
            # limit parallelism to avoid heavy CPU/memory usage
            grid = GridSearchCV(text_clf, param_grid, cv=5, n_jobs=1, verbose=2 if verbosity else 0)
            grid.fit(X_train, y_train)
            text_clf = grid.best_estimator_
            self.stdout.write(f'---> Best parameters: {grid.best_params_}')
            self.stdout.write('---> Model training completed.')

        # 5. Evaluate model
        self.stdout.write(self.style.SUCCESS('>>> Step 3: Evaluating the model...'))
        y_pred = text_clf.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        self.stdout.write(self.style.SUCCESS(f'---> Model Accuracy: {accuracy:.2f}'))

        # Cross-validation score
        if verbosity:
            # manual cross-validation with per-fold progress prints
            from sklearn.model_selection import StratifiedKFold
            from sklearn.base import clone
            cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
            fold_scores = []
            self.stdout.write('---> Running manual cross-validation (5 folds):')
            for i, (tr_idx, te_idx) in enumerate(cv.split(X, y), start=1):
                self.stdout.write(f'     Fold {i}/5: fitting...')
                est = clone(text_clf)
                est.fit(X.iloc[tr_idx], y.iloc[tr_idx])
                preds = est.predict(X.iloc[te_idx])
                sc = accuracy_score(y.iloc[te_idx], preds)
                fold_scores.append(sc)
                self.stdout.write(f'     Fold {i} accuracy: {sc:.4f}')
            import numpy as _np
            self.stdout.write(f'---> Cross-validation Accuracy: {_np.mean(fold_scores):.2f} (+/- {_np.std(fold_scores) * 2:.2f})')
        else:
            cv_scores = cross_val_score(text_clf, X, y, cv=5)
            self.stdout.write(f'---> Cross-validation Accuracy: {cv_scores.mean():.2f} (+/- {cv_scores.std() * 2:.2f})')

        # Detailed classification report
        self.stdout.write('>>> Classification Report:')
        self.stdout.write(classification_report(y_test, y_pred))

        # Confusion matrix
        self.stdout.write('>>> Confusion Matrix:')
        self.stdout.write(str(confusion_matrix(y_test, y_pred)))

        # 6. Save the trained model
        self.stdout.write(self.style.SUCCESS('>>> Step 4: Saving the trained model...'))
        if not os.path.exists('models'):
            os.makedirs('models')
        
        try:
            dump(text_clf, 'models/category_classifier.joblib')
            self.stdout.write(self.style.SUCCESS('>>> Model saved successfully to models/category_classifier.joblib'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'!!! Error saving model: {e}'))

        # 7. Test prediction on a sample
        self.stdout.write(self.style.SUCCESS('>>> Step 5: Testing sample prediction...'))
        sample = ["Tuyển lập trình viên Python, yêu cầu 2 năm kinh nghiệm tại Hà Nội."]
        sample_processed = [self.preprocess_text(s) for s in sample]
        pred = text_clf.predict(sample_processed)
        self.stdout.write(f'---> Sample prediction: Category ID {pred[0]}')