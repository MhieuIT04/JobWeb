#!/usr/bin/env python3
"""
Script để kiểm tra model hiện tại mà không làm gián đoạn training
"""
import os
import sys
import django

# Setup Django
sys.path.append('BE')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
django.setup()

import joblib
from django.conf import settings

def check_current_model():
    """Kiểm tra model hiện tại"""
    print("🔍 CHECKING CURRENT MODEL STATUS")
    print("=" * 50)
    
    model_path = os.path.join(settings.BASE_DIR, 'models', 'category_classifier.joblib')
    
    if os.path.exists(model_path):
        # Get file info
        stat = os.stat(model_path)
        size_mb = stat.st_size / (1024 * 1024)
        
        print(f"✅ Model file exists: {model_path}")
        print(f"📁 File size: {size_mb:.2f} MB")
        print(f"📅 Last modified: {stat.st_mtime}")
        
        try:
            # Try to load model (quick check)
            print("🔄 Loading model...")
            model = joblib.load(model_path)
            print(f"✅ Model loaded successfully!")
            print(f"📊 Model type: {type(model)}")
            
            # Check if it's a pipeline
            if hasattr(model, 'steps'):
                print(f"🔧 Pipeline steps: {[step[0] for step in model.steps]}")
            
            # Quick test prediction
            test_text = ["Tuyển lập trình viên Python Django có kinh nghiệm"]
            try:
                prediction = model.predict(test_text)
                print(f"🎯 Test prediction: Category ID {prediction[0]}")
                print("✅ Model is working correctly!")
            except Exception as e:
                print