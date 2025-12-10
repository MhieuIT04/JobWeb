#!/usr/bin/env python3
"""
Create a test PDF file for CV analysis
"""
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os

def create_test_pdf():
    """Create a test PDF CV"""
    filename = "test_cv_real.pdf"
    
    # Create PDF
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Add content
    y_position = height - 50
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y_position, "NGUYỄN VĂN A")
    y_position -= 30
    
    c.setFont("Helvetica", 12)
    c.drawString(50, y_position, "Software Developer")
    y_position -= 40
    
    # Experience section
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_position, "KINH NGHIỆM:")
    y_position -= 20
    
    c.setFont("Helvetica", 10)
    experiences = [
        "• 3 năm kinh nghiệm phát triển web với Python, Django",
        "• Thành thạo JavaScript, React, HTML, CSS",
        "• Có kinh nghiệm với SQL, PostgreSQL",
        "• Sử dụng Git, Docker trong dự án",
        "• Kỹ năng teamwork, communication tốt",
        "• Project management và problem solving"
    ]
    
    for exp in experiences:
        c.drawString(70, y_position, exp)
        y_position -= 15
    
    y_position -= 20
    
    # Skills section
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_position, "KỸ NĂNG:")
    y_position -= 20
    
    c.setFont("Helvetica", 10)
    skills = [
        "• Ngôn ngữ lập trình: Python, JavaScript, Java",
        "• Framework: Django, React, NodeJS",
        "• Database: SQL, PostgreSQL, MongoDB",
        "• Tools: Git, Docker, Kubernetes",
        "• Cloud: AWS, Azure",
        "• Soft skills: Leadership, teamwork, analytical thinking"
    ]
    
    for skill in skills:
        c.drawString(70, y_position, skill)
        y_position -= 15
    
    # Save PDF
    c.save()
    print(f"✅ Created test PDF: {filename}")
    return filename

if __name__ == "__main__":
    try:
        create_test_pdf()
    except ImportError:
        print("❌ reportlab not installed. Installing...")
        os.system("pip install reportlab")
        create_test_pdf()