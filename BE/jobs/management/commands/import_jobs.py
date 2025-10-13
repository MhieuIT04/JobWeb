import pandas as pd
import re
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jobs.models import Job, Category


class Command(BaseCommand):
    help = 'Import jobs from CSV dataset (flexible columns: title/description/category_id or industry/mapped_industry)'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to CSV file (train.csv, val.csv, or test.csv)')
        parser.add_argument('--append', action='store_true', help='Append to existing data instead of overwriting')
        parser.add_argument('--dry-run', action='store_true', help='Preview rows without inserting')
        parser.add_argument('--delimiter', type=str, default=',', help='CSV delimiter')
        parser.add_argument('--employer-email', type=str, default=None, help='Email of employer to assign imported jobs to (will create user if missing)')

    def _pick_title(self, row, df_columns):
        for col in ('title', 'job_title', 'position', 'name'):
            if col in df_columns and pd.notna(row.get(col, None)):
                return str(row[col]).strip()
        if 'description' in df_columns and pd.notna(row.get('description', None)):
            return str(row['description']).strip()[:80]
        return 'No title'

    def _pick_description(self, row, df_columns):
        for col in ('description', 'requirements', 'reqs', 'requirement'):
            if col in df_columns and pd.notna(row.get(col, None)):
                return str(row[col]).strip()
        for col in ('title', 'job_title'):
            if col in df_columns and pd.notna(row.get(col, None)):
                return str(row[col]).strip()
        return ''

    def _extract_category_id_from_cell(self, cell):
        if pd.isna(cell):
            return None
        if isinstance(cell, (int, float)) and not pd.isna(cell):
            try:
                return int(cell)
            except Exception:
                return None
        s = str(cell)
        m = re.search(r"(\d+)", s)
        if m:
            return int(m.group(1))
        return None

    def _find_or_create_category_by_name(self, name):
        name = str(name).strip()
        if not name:
            return None
        first = name.split(',')[0].strip()
        cat, created = Category.objects.get_or_create(name=first)
        return cat

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']
        append = kwargs['append']
        dry_run = kwargs['dry_run']
        delimiter = kwargs['delimiter']
        employer_email = kwargs.get('employer_email')

        if not append:
            Job.objects.all().delete()

        # resolve employer user
        User = get_user_model()
        employer_user = None
        if employer_email:
            employer_user, created = User.objects.get_or_create(email=employer_email, defaults={'username': employer_email.split('@')[0] or 'importer'})
            if created:
                # set unusable password
                employer_user.set_unusable_password()
                # if User has 'role' field, try to set to 'employer'
                try:
                    setattr(employer_user, 'role', 'employer')
                except Exception:
                    pass
                employer_user.save()
        else:
            # try to find an existing employer user
            try:
                employer_user = User.objects.filter(role='employer').first()
            except Exception:
                employer_user = User.objects.first()
        if not employer_user:
            self.stdout.write(self.style.WARNING('No employer user found or created; import will be aborted. Provide --employer-email to create one.'))
            return

        try:
            df = pd.read_csv(csv_file, delimiter=delimiter, encoding='utf-8')
        except Exception:
            df = pd.read_csv(csv_file, delimiter=delimiter, encoding='latin1')

        cols = [c.strip() for c in df.columns.tolist()]
        df.columns = cols

        self.stdout.write(self.style.SUCCESS(f'Loaded CSV with columns: {cols}'))

        imported_count = 0
        skipped_count = 0
        preview_rows = []

        for idx, row in df.iterrows():
            title = self._pick_title(row, cols)
            description = self._pick_description(row, cols)

            cat_obj = None

            if 'category_id' in cols:
                cid = self._extract_category_id_from_cell(row.get('category_id'))
                if cid:
                    cat_obj = Category.objects.filter(id=cid).first()
                    if not cat_obj:
                        try:
                            cat_obj = Category.objects.create(id=cid, name=f'Category {cid}')
                        except Exception:
                            cat_obj = None

            if not cat_obj and 'industry' in cols:
                cid = self._extract_category_id_from_cell(row.get('industry'))
                if cid:
                    cat_obj = Category.objects.filter(id=cid).first()
                    if not cat_obj:
                        try:
                            cat_obj = Category.objects.create(id=cid, name=f'Category {cid}')
                        except Exception:
                            cat_obj = None

            if not cat_obj and 'mapped_industry' in cols:
                mapped = row.get('mapped_industry')
                if pd.notna(mapped):
                    names = str(mapped).split(',')
                    if names:
                        cat_obj = self._find_or_create_category_by_name(names[0])

            if not cat_obj and 'category_name' in cols:
                cat_obj = self._find_or_create_category_by_name(row.get('category_name'))

            if not cat_obj:
                skipped_count += 1
                self.stdout.write(self.style.WARNING(f'Skipped row {idx}: no category found (title={title})'))
                continue

            preview_rows.append({'idx': idx, 'title': title, 'category': cat_obj.name, 'category_id': cat_obj.id})

            if dry_run:
                continue

            Job.objects.create(
                employer=employer_user,
                title=title,
                description=description,
                category=cat_obj,
                status='approved'
            )
            imported_count += 1

        self.stdout.write(self.style.SUCCESS(f'Imported {imported_count} jobs. Skipped {skipped_count} rows. Total jobs now: {Job.objects.count()}'))
        self.stdout.write('Sample imported rows:')
        for r in preview_rows[:10]:
            self.stdout.write(str(r))
