#!/usr/bin/env python3
"""
Kiểm tra kết quả training AI model
"""
import os
import sys
import django

# Setup Django
sys.path.append('BE')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
django.setup()

import joblib
import pandas as pd
from django.conf import settings
from jobs.models import Job, Category
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

def check_training_results():
    """Kiểm tra kết quả training"""
    print("🎯 KIỂM TRA KẾT QUẢ TRAINING AI MODEL")
    print("=" * 60)
    
    # 1. Kiểm tra model file
    model_path = os.path.join(settings.BASE_DIR, 'models', 'category_classifier.joblib')
    
    if os.path.exists(model_path):
        stat = os.stat(model_path)
        size_mb = stat.st_size / (1024 * 1024)
        
        print(f"✅ Model file: {model_path}")
        print(f"📁 File size: {size_mb:.2f} MB")
        print(f"📅 Last modified: {stat.st_mtime}")
        
        # 2. Load model
        try:
            model = joblib.load(model_path)
            print(f"✅ Model loaded successfully!")
            print(f"📊 Model type: {type(model)}")
            
            if hasattr(model, 'steps'):
                print(f"🔧 Pipeline steps: {[step[0] for step in model.steps]}")
                
                # Kiểm tra TF-IDF parameters
                if 'tfidf' in dict(model.steps):
                    tfidf = model.named_steps['tfidf']
                    print(f"📝 TF-IDF parameters:")
                    print(f"   - ngram_range: {tfidf.ngram_range}")
                    print(f"   - max_features: {tfidf.max_features}")
                    print(f"   - max_df: {tfidf.max_df}")
                    print(f"   - min_df: {tfidf.min_df}")
                
                # Kiểm tra classifier
                if 'clf' in dict(model.steps):
                    clf = model.named_steps['clf']
                    print(f"🤖 Classifier: {type(clf).__name__}")
                    if hasattr(clf, 'C'):
                        print(f"   - C parameter: {clf.C}")
                    if hasattr(clf, 'class_weight'):
                        print(f"   - Class weight: {clf.class_weight}")
            
            # 3. Test với dữ liệu thực
            print("\n🧪 TESTING MODEL ACCURACY")
            print("-" * 40)
            
            # Load data
            jobs = Job.objects.filter(status='approved', description__isnull=False, category__isnull=False)
            if jobs.count() > 0:
                df = pd.DataFrame(list(jobs.values('title', 'description', 'category_id')))
                df['content'] = df['title'].fillna('') + ' ' + df['description'].fillna('')
                
                print(f"📊 Total jobs: {len(df)}")
                print(f"📊 Categories: {df['category_id'].nunique()}")
                
                # Split data
                X = df['content']
                y = df['category_id']
                
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42, stratify=y
                )
                
                # Predict
                y_pred = model.predict(X_test)
                accuracy = accuracy_score(y_test, y_pred)
                
                print(f"🎯 Test Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
                
                # Classification report
                print("\n📋 CLASSIFICATION REPORT:")
                print(classification_report(y_test, y_pred))
                
                # Category mapping
                categories = Category.objects.all()
                cat_map = {cat.id: cat.name for cat in categories}
                
                print("\n📂 CATEGORY MAPPING:")
                for cat_id, cat_name in cat_map.items():
                    count = (y == cat_id).sum()
                    print(f"   {cat_id}: {cat_name} ({count} jobs)")
            
            # 4. Test predictions
            print("\n🔮 SAMPLE PREDICTIONS:")
            print("-" * 40)
            
            test_samples = [
                "Tuyển lập trình viên Python Django có kinh nghiệm 2 năm",
                "Cần tuyển nhân viên marketing digital, social media",
                "Tuyển kế toán tổng hợp, có kinh nghiệm Excel",
                "Frontend Developer React, JavaScript, HTML CSS",
                "Nhân viên bán hàng, chăm sóc khách hàng"
            ]
            
            for i, sample in enumerate(test_samples, 1):
                pred = model.predict([sample])
                cat_name = cat_map.get(pred[0], f"Unknown ({pred[0]})")
                print(f"{i}. '{sample[:50]}...'")
                print(f"   → Predicted: {cat_name}")
                print()
                
        except Exception as e:
            print(f"❌ Error loading model: {e}")
    else:
        print("❌ Model file not found!")

if __name__ == "__main__":
    check_training_results()