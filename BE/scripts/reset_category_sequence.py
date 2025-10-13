import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
import django
django.setup()
from django.db import connection
from jobs.models import Category

table = Category._meta.db_table
seq = f"{table}_id_seq"
print('Table:', table)
print('Sequence name assumed:', seq)
with connection.cursor() as c:
    c.execute(f"SELECT COALESCE(MAX(id), 1) FROM {table}")
    max_id = c.fetchone()[0]
    print('Max id in table =', max_id)
    # set sequence to max_id (so next val will be max_id+1)
    try:
        c.execute(f"SELECT setval('{seq}', %s)", [max_id])
        print('Sequence set to', max_id)
    except Exception as e:
        print('Failed to set sequence:', e)
