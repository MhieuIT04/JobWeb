# JobWeb
When you open JobWeb, you turn on 2 terminal below to run website:
- terminal 01(run Backend):
    + cd BE
    + venv\Scripts\activate
    + python manage.py runserver
- terminal 02 (run Frontend):
    + cd FE
    + npm start 
<<<<<<< HEAD

## Rebuilding ML artifacts (category classifier & recommendations)

The backend uses two offline artifacts that must be (re)generated when data changes or after a fresh clone:

- Category classifier: `models/category_classifier.joblib` — created by the training management command.
- Recommendation artifacts: `recommendations/cosine_sim.pkl`, `recommendations/indices.pkl`, `recommendations/job_df.pkl` — created by the recommendation generation command.

To (re)build them from the repository root (Windows cmd):

```cmd
cd BE
venv\Scripts\activate        # activate your Python virtualenv
python manage.py train_category_classifier --fast
python manage.py generate_recommendations
```

Notes:
- The `--fast` flag skips GridSearch and runs faster for development. Remove it for full hyperparameter tuning.
- If you prefer to run training with oversampling or other options, run `python manage.py train_category_classifier --help` to see available flags.
- If the API logs errors about missing artifacts, run the two commands above and restart the Django server.

Optional dependencies for improved recommendations (ANN):

- Install sentence-transformers (for multilingual sentence embeddings) and hnswlib (ANN index):

```cmd
cd BE
venv\Scripts\activate
pip install "sentence-transformers" hnswlib numpy
```

Notes:
- If `sentence-transformers` and `hnswlib` are installed, `manage.py generate_recommendations` will build an ANN index (faster and more accurate for semantic similarity).
- If those packages are not available, the command will fall back to TF-IDF + cosine similarity and save legacy artifacts.
=======
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
