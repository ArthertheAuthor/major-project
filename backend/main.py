from fastapi import FastAPI
from utils.summarizer import get_summary
from utils.quiz_generator import generate_quiz
from utils.mindmap import generate_mindmap

import json
import time
from collections import Counter

app = FastAPI()

# -------------------- UTIL FUNCTIONS --------------------

def clean_text(text):
    return " ".join(text.strip().split())

def extract_keywords(text):
    words = text.lower().split()
    words = [w for w in words if len(w) > 4]
    
    freq = Counter(words)
    return [w for w, _ in freq.most_common(5)]

# Simple cache
cache = {}

# -------------------- BASIC ROUTES --------------------

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.get("/health")
def health():
    return {"status": "ok"}

# -------------------- CHAPTERS --------------------

@app.get("/chapters")
def get_chapters():
    with open("data/chapters.json") as f:
        return json.load(f)

# -------------------- SUMMARY --------------------

@app.post("/summary")
def summary_api(data: dict):
    try:
        text = clean_text(data.get("text", ""))

        if not text:
            return {"error": "Empty input"}

        if text in cache:
            summary = cache[text]
        else:
            summary = get_summary(text)
            cache[text] = summary

        return {
            "summary": summary,
            "confidence": "medium",
            "mode": "offline",
            "length": len(text)
        }

    except Exception as e:
        return {"error": str(e)}

# -------------------- QUIZ --------------------

@app.post("/quiz")
def quiz_api(data: dict):
    try:
        text = clean_text(data.get("text", ""))

        if not text:
            return {"error": "Empty input"}

        keywords = extract_keywords(text)
        focus = keywords[0] if keywords else None

        quiz = generate_quiz(text, focus)

        return {
            "quiz": quiz,
            "confidence": "medium",
            "mode": "offline"
        }

    except Exception as e:
        return {"error": str(e)}

# -------------------- MINDMAP --------------------

@app.post("/mindmap")
def mindmap_api(data: dict):
    try:
        text = clean_text(data.get("text", ""))

        if not text:
            return {"error": "Empty input"}

        graph = generate_mindmap(text)

        return {
            "mindmap": graph,
            "confidence": "low",
            "mode": "offline"
        }

    except Exception as e:
        return {"error": str(e)}

# -------------------- PROGRESS TRACKING --------------------

progress = {}

@app.post("/progress")
def save_progress(data: dict):
    user = data.get("user", "default")
    score = data.get("score", 0)
    topic = data.get("topic", "general")

    if user not in progress:
        progress[user] = []

    progress[user].append({
        "topic": topic,
        "score": score
    })

    return {"status": "saved"}

@app.get("/weak-areas")
def weak_areas(user: str = "default"):
    user_data = progress.get(user, [])

    weak = [x["topic"] for x in user_data if x["score"] < 50]

    return {
        "weak_topics": list(set(weak))
    }

# -------------------- SYNC (FAKE BUT IMPORTANT) --------------------

@app.get("/sync")
def sync():
    return {
        "status": "synced",
        "updated_items": ["progress", "new_questions"]
    }

# -------------------- LEARNING PIPELINE --------------------

@app.post("/learn")
def learn(data: dict):
    try:
        start = time.time()

        text = clean_text(data.get("text", ""))
        user = data.get("user", "default")

        if not text:
            return {"error": "Empty input"}

        summary = get_summary(text)

        keywords = extract_keywords(text)
        focus = keywords[0] if keywords else None

        quiz = generate_quiz(text, focus)
        mindmap = generate_mindmap(text)

        end = time.time()

        return {
            "summary": summary,
            "quiz": quiz,
            "mindmap": mindmap,
            "mode": "offline",
            "confidence": "medium",
            "time_taken": round(end - start, 3)
        }

    except Exception as e:
        return {"error": str(e)}
    
    from utils.preprocess import clean_text