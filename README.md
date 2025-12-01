# JobWeb
When you open JobWeb, you turn on 2 terminal below to run website:
- terminal 01(run Backend):
    + cd BE
    + venv\Scripts\activate
    + python manage.py runserver
- terminal 02 (run Frontend):
    + cd FE
    + npm start 




Notes:
- If `sentence-transformers` and `hnswlib` are installed, `manage.py generate_recommendations` will build an ANN index (faster and more accurate for semantic similarity).
- If those packages are not available, the command will fall back to TF-IDF + cosine similarity and save legacy artifacts.


