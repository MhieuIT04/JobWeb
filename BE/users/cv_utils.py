import re
from typing import Dict, List, Optional
from django.db.models import QuerySet

from django.contrib.auth import get_user_model
from .models import Skill

try:
    import PyPDF2  # type: ignore
except Exception:
    PyPDF2 = None  # type: ignore

try:
    import docx  # python-docx
except Exception:
    docx = None  # type: ignore
import io
import zipfile

User = get_user_model()


def _read_txt(file_obj) -> str:
    try:
        return file_obj.read().decode('utf-8', errors='ignore')
    except Exception:
        try:
            file_obj.seek(0)
            return file_obj.read().decode('latin-1', errors='ignore')
        except Exception:
            return ""


def _read_pdf(file_obj) -> str:
    if PyPDF2 is None:
        # Naive fallback when library missing
        try:
            file_obj.seek(0)
            data = file_obj.read()
            try:
                text = data.decode('latin-1', errors='ignore')
            except Exception:
                text = str(data)
            # Keep only printable chars and whitespace
            cleaned = ''.join(ch if (31 < ord(ch) < 127 or ch in "\n\r\t ") else ' ' for ch in text)
            return cleaned
        except Exception:
            return ""
    try:
        file_obj.seek(0)
        reader = PyPDF2.PdfReader(file_obj)
        text_parts: List[str] = []
        for page in getattr(reader, 'pages', []):
            try:
                text_parts.append(page.extract_text() or "")
            except Exception:
                continue
        raw = "\n".join(text_parts)
        # Remove common PDF artifacts from some extractors
        try:
            cleaned = re.sub(r"/[A-Za-z]+\s*\[[^\]]*\]\s*R", " ", raw)
            cleaned = re.sub(r"\s{2,}", " ", cleaned)
            return cleaned
        except Exception:
            return raw
    except Exception:
        return ""


def _read_docx(file_obj) -> str:
    if docx is None:
        # Fallback: read from zip and strip XML tags
        try:
            file_obj.seek(0)
            data = file_obj.read()
            zf = zipfile.ZipFile(io.BytesIO(data))
            xml_bytes = zf.read('word/document.xml')
            xml_text = xml_bytes.decode('utf-8', errors='ignore')
            # Replace tags with spaces then collapse
            xml_text = re.sub(r'<[^>]+>', ' ', xml_text)
            xml_text = re.sub(r'\s+', ' ', xml_text)
            return xml_text
        except Exception:
            return ""
    try:
        file_obj.seek(0)
        document = docx.Document(file_obj)
        return "\n".join(p.text for p in document.paragraphs)
    except Exception:
        return ""


def extract_text_from_file(uploaded_file) -> str:
    name = (uploaded_file.name or "").lower()
    if name.endswith('.txt'):
        return _read_txt(uploaded_file)
    if name.endswith('.pdf'):
        return _read_pdf(uploaded_file)
    if name.endswith('.docx'):
        return _read_docx(uploaded_file)
    # Fallback: try generic read as text
    try:
        uploaded_file.seek(0)
        return uploaded_file.read().decode('utf-8', errors='ignore')
    except Exception:
        return ""


EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
# Vietnamese mobile numbers: start with 0 or +84, then one of 3/5/7/8/9, total 9-10 digits; allow separators
PHONE_REGEX = re.compile(r"(?:\+?84|0)(?:3|5|7|8|9)(?:[\s\.\-]?\d){7,9}")
PHONE_LOOSE_REGEX = re.compile(r"(?:\+?84|0)[\s\.\-]?\d(?:[\s\.\-]?\d){7,10}")
NAME_REGEX = re.compile(r"^\s*([A-ZĐÁÀẠẢÃÂẦẤẬẨẪĂẮẰẶẲẴÊẾỀỆỂỄÔỐỒỔỖỘƠỚỜỞỠỢƯỨỪỬỮỰ][\w\-']+(?:\s+[A-ZĐÁÀẠẢÃÂẦẤẬẨẪĂẮẰẶẲẴÊẾỀỆỂỄÔỐỒỔỖỘƠỚỜỞỠỢƯỨỪỬỮỰ][\w\-']+)*)\s*$")


def extract_email(text: str) -> Optional[str]:
    m = EMAIL_REGEX.search(text or "")
    return m.group(0) if m else None


def _normalize_phone(num: str) -> str:
    digits = re.sub(r"\D", "", num or "")
    if digits.startswith('84') and not digits.startswith('840'):
        digits = '0' + digits[2:]
    return digits


def extract_phone(text: str) -> Optional[str]:
    if not text:
        return None
    text_low = text.lower()
    candidates = [m for m in PHONE_REGEX.finditer(text)]
    if not candidates:
        candidates = [m for m in PHONE_LOOSE_REGEX.finditer(text)]
    best = None
    best_score = -1
    for m in candidates:
        cand = m.group(0)
        norm = _normalize_phone(cand)
        if len(norm) < 9:
            continue
        score = 0
        if norm.startswith(('03', '05', '07', '08', '09')):
            score += 2
        if len(norm) == 10:
            score += 2
        # Proximity bonus to phone keywords
        start = m.start()
        window = text_low[max(0, start-80):start+80]
        if any(k in window for k in ['phone', 'contact', 'tel', 'sdt', 'điện thoại']):
            score += 3
        if score > best_score:
            best_score = score
            best = norm
    return best


def _token_is_nameish(token: str) -> bool:
    if not token or any(ch in token for ch in "/[](){}0123456789@#._-"):
        return False
    return bool(re.search(r"[A-Za-zÀ-ỹ]", token)) and len(token) >= 2


def guess_name(lines: List[str]) -> Optional[str]:
    # Heuristic: first non-empty uppercase-ish line
    for line in lines[:50]:
        lx = line.strip()
        if 2 <= lx.count(' ') <= 5 and len(lx) <= 60:
            parts = [p for p in lx.split() if _token_is_nameish(p)]
            if len(parts) >= 2:
                if NAME_REGEX.match(lx.upper()):
                    return lx
        # fallback: if line is all caps and short
        if lx and lx.isupper() and 2 <= lx.count(' ') <= 5 and len(lx) <= 60:
            parts = [p for p in lx.split() if _token_is_nameish(p)]
            if len(parts) >= 2:
                return " ".join(p.title() for p in parts)
    return None


def _normalize_token(s: str) -> str:
    return (s or '').lower().strip()


def _split_skill_like(text: str) -> List[str]:
    # Split lines near skill sections
    items: List[str] = []
    lines = [ln.strip() for ln in (text or '').splitlines()]
    headers = ['skills', 'kỹ năng', 'ky nang']
    for i, ln in enumerate(lines):
        ln_low = ln.lower()
        if any(h in ln_low for h in headers):
            window = '\n'.join(lines[i:i+12])
            parts = re.split(r",|/|\\||;|\n|•|\-|\u2022|\t|\r|\.|:\s", window)
            for p in parts:
                t = p.strip()
                if not t:
                    continue
                # filter out headers and single letters
                if len(t) < 2 or t.lower() in ('skills', 'kỹ năng', 'ky nang'):
                    continue
                if len(t) == 1 and not t.isalpha():
                    continue
                items.append(t)
    return items


def extract_skills(text: str) -> List[str]:
    # Build searchable haystack
    text_lower = (text or '').lower()
    haystack = ' ' + re.sub(r"\s+", ' ', text_lower) + ' '
    # Candidate phrases from CV near skill headers
    candidates = [_normalize_token(c) for c in _split_skill_like(text)]
    # Skills from DB
    skill_names = list(Skill.objects.values_list('name', flat=True))
    found: List[str] = []
    for sk in skill_names:
        sk_norm = (sk or '').strip()
        if not sk_norm:
            continue
        sk_low = sk_norm.lower()
        # Word boundary match (support + and #)
        pattern = r"\\b" + re.escape(sk_low).replace(r"\+", r"\\+") + r"\\b"
        try:
            if re.search(pattern, haystack):
                found.append(sk_norm)
                continue
        except re.error:
            pass
        # Fallback: substring for acronyms like SQL, CSS
        if f" {sk_low} " in haystack:
            found.append(sk_norm)
            continue
        # Weak fuzzy: compare to candidate tokens from skill sections
        if any(sk_low == _normalize_token(c) or sk_low in _normalize_token(c) for c in candidates):
            found.append(sk_norm)
    # Deduplicate preserve order
    seen = set()
    unique: List[str] = []
    for s in found:
        if s not in seen:
            seen.add(s)
            unique.append(s)
    if unique:
        return unique[:30]
    # Fallback: if DB match is empty, return parsed candidate phrases as display skills
    cleaned = []
    seen2 = set()
    for c in candidates:
        name = re.sub(r"\s+", ' ', c).strip()
        if not name:
            continue
        # Keep alphanumeric/#+ words, drop stray symbols
        words = [w for w in re.findall(r"[A-Za-zÀ-ỹ0-9+#\.\-]{2,}", name) if w.lower() not in ('skills', 'ky', 'nang')]
        if not words:
            continue
        title = ' '.join(p.capitalize() if p.isalpha() else p for p in words)
        key = title.lower()
        if key and key not in seen2:
            seen2.add(key)
            cleaned.append(title)
    return cleaned[:20]


def parse_cv(uploaded_file) -> Dict:
    text = extract_text_from_file(uploaded_file)
    lines = [ln for ln in (text or "").splitlines() if ln.strip()]
    email = extract_email(text) if text else None
    phone = extract_phone(text) if text else None
    name = guess_name(lines) if lines else None
    if not name and email:
        # Derive name from email local part
        local = email.split('@')[0]
        parts = re.split(r"[._-]+", local)
        if len(parts) >= 2:
            name = ' '.join(p.capitalize() for p in parts if p)
    skills = extract_skills(text) if text else []
    return {
        'raw_text': text[:50000] if text else "",
        'name': name,
        'email': email,
        'phone': phone,
        'skills': skills,
    }


def score_job_against_skills(job_desc: str, skills: List[str]) -> float:
    if not job_desc or not skills:
        return 0.0
    jd = job_desc.lower()
    if not jd.strip():
        return 0.0
    hits = 0
    for sk in skills:
        sk_l = sk.lower().strip()
        if not sk_l:
            continue
        # Prefer word-boundary match; fallback to substring
        try:
            if re.search(r"\\b" + re.escape(sk_l) + r"\\b", jd):
                hits += 1
                continue
        except re.error:
            pass
        if sk_l in jd:
            hits += 1
    if hits == 0:
        return 0.0
    # Normalize by skills length
    return round(hits / max(len(skills), 1) * 100.0, 2)


def _normalize_skill_name(name: str) -> str:
    return (name or "").strip().lower()


def score_job_combined(job_obj, skills: List[str]) -> float:
    """
    Combine two signals for better recall:
    - Text overlap between candidate skills and job title/description
    - Explicit JobSkill tag overlap
    Weighted blend: 0.6 (tags) + 0.4 (text)
    """
    if not skills:
        return 0.0
    # Text score
    desc = ((getattr(job_obj, 'description', '') or '') + '\n' + (getattr(job_obj, 'title', '') or ''))
    text_score = score_job_against_skills(desc, skills)

    # Tag overlap score using JobSkill if available
    overlap_score = 0.0
    job_skills_qs = getattr(job_obj, 'jobskill_set', None)
    job_skill_names: List[str] = []
    if isinstance(job_skills_qs, QuerySet) or hasattr(job_skills_qs, 'all'):
        try:
            job_skill_names = [
                _normalize_skill_name(js.skill.name)
                for js in job_skills_qs.all()
                if getattr(js, 'skill', None) and getattr(js.skill, 'name', None)
            ]
        except Exception:
            job_skill_names = []
    if job_skill_names:
        cand_norm = {_normalize_skill_name(s) for s in skills if _normalize_skill_name(s)}
        job_norm = set(job_skill_names)
        overlap = len(cand_norm & job_norm)
        if overlap > 0:
            overlap_score = round(overlap / max(len(cand_norm), 1) * 100.0, 2)

    # Blend with emphasis on explicit tags if present
    if overlap_score > 0:
        return round(0.6 * overlap_score + 0.4 * text_score, 2)
    return text_score


_STOPWORDS = set([
    'and','or','the','a','an','of','for','to','in','on','with','by','at','from','as','is','are','be','this','that','it','we','you','they','he','she',
    # Vietnamese basics
    'và','hoặc','các','những','một','cho','trong','trên','với','bởi','tại','từ','là','của','đến','khi','được','đã','sẽ','này','kia','đó','ở','về'
])


def _tokenize(text: str) -> List[str]:
    text = (text or '').lower()
    parts = re.findall(r"[a-zA-ZÀ-ỹ0-9+#\.\-]{2,}", text)
    tokens = [p.strip('.-') for p in parts]
    return [t for t in tokens if t and t not in _STOPWORDS]


def score_job_by_text_overlap(cv_text: str, job_text: str) -> float:
    if not cv_text or not job_text:
        return 0.0
    cv_tokens = set(_tokenize(cv_text))
    job_tokens = set(_tokenize(job_text))
    if not cv_tokens or not job_tokens:
        return 0.0
    overlap = len(cv_tokens & job_tokens)
    if overlap == 0:
        return 0.0
    # Normalize by CV tokens size to approximate recall
    return round(min(100.0, overlap / max(len(cv_tokens), 1) * 100.0), 2)
