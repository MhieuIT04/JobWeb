import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
import django
django.setup()
import pandas as pd
from jobs.models import Category

csv_path = os.path.join(os.path.dirname(__file__), '..', 'Data', 'VNjob', 'train.csv')
csv_path = os.path.abspath(csv_path)
print('Reading', csv_path)
try:
    df = pd.read_csv(csv_path, encoding='utf-8')
except Exception:
    df = pd.read_csv(csv_path, encoding='latin1')

vals = df['mapped_industry'].dropna().unique().tolist()
print('Unique mapped_industry count:', len(vals))
created = 0
for v in vals:
    if not isinstance(v, str):
        continue
    first = v.split('/')[0].split(',')[0].strip()
    if not first:
        continue
    cat, c = Category.objects.get_or_create(name=first)
    if c:
        created += 1
print('Categories created (new):', created)
print('Total categories now:', Category.objects.count())
