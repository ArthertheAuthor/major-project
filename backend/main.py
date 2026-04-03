from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from collections import Counter

app = FastAPI()

# -------------------- CORS (IMPORTANT) --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- MOCK DATABASE --------------------
users = {}
progress = {}

# -------------------- UTILS --------------------

def clean_text(text):
    return " ".join(text.strip().split())

def extract_keywords(text):
    words = text.lower().split()
    words = [w for w in words if len(w) > 4]
    freq = Counter(words)
    return [w for w, _ in freq.most_common(5)]

def get_summary(text):
    sentences = text.split(".")
    return ". ".join(sentences[:2]).strip() + "."

def generate_quiz(text):
    return [
        {
            "question": "What is the main topic?",
            "options": ["CPU", "Memory", "Disk", "Network"],
            "answer": "CPU"
        }
    ]

def generate_mindmap(text):
    keywords = extract_keywords(text)

    nodes = []
    edges = []

    for i, word in enumerate(keywords):
        nodes.append({
            "id": i + 1,
            "label": word
        })

    for i in range(1, len(nodes)):
        edges.append({
            "from": 1,
            "to": i + 1
        })

    return {
        "nodes": nodes,
        "edges": edges
    }

# -------------------- AUTH APIs --------------------

@app.post("/register")
def register(data: dict):
    email = data.get("email")
    password = data.get("password")

    users[email] = password

    return {"message": "User registered"}

@app.post("/login")
def login(data: dict):
    try:
        email = data.get("email")
        password = data.get("password")

        # 🔴 validation
        if not email or not password:
            return {"message": "Missing email or password"}

        # 🔴 check user exists
        if email not in users:
            return {"message": "User not found"}

        # 🔴 check password
        if users[email] != password:
            return {"message": "Incorrect password"}

        return {
            "message": "Login successful",
            "user": email.split("@")[0]
        }

    except Exception as e:
        return {"error": str(e)}

# -------------------- OPTIONAL ONBOARDING --------------------

@app.post("/onboarding")
def onboarding(data: dict):
    return {"status": "saved"}

# -------------------- CHAPTERS --------------------

from data_handler import get_subjects, get_chapter_text

@app.get("/chapters")
def get_chapters():
    subjects = get_subjects()

    final = []
    id_counter = 1

    for sub in subjects:
        subject_name = sub["name"].lower()
        subject_id = sub["id"]

        for ch in sub["chapters"]:
            content = get_chapter_text(subject_id, ch["id"])

            final.append({
                "id": id_counter,
                "subject": subject_name,
                "title": ch["title"],
                "content": content[:800]
            })

            id_counter += 1

    return final

# -------------------- SUMMARY --------------------

@app.post("/summary")
def summary_api(data: dict):
    text = clean_text(data.get("text", ""))
    return {
        "summary": get_summary(text)
    }

# -------------------- QUIZ --------------------

@app.post("/quiz")
def quiz_api(data: dict):
    text = clean_text(data.get("text", ""))
    return {
        "quiz": generate_quiz(text)
    }

# -------------------- MINDMAP --------------------

@app.post("/mindmap")
def mindmap_api(data: dict):
    text = clean_text(data.get("text", ""))
    return generate_mindmap(text)

# -------------------- PROGRESS --------------------

@app.post("/progress")
def save_progress(data: dict):
    user = data.get("user", "default")
    score = data.get("score", 0)

    if user not in progress:
        progress[user] = []

    progress[user].append(score)

    return {"status": "saved"}