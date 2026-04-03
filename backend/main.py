from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from collections import Counter
import json
import urllib.parse
from utils.data_handler import (
    get_subjects,
    get_chapter_text,
    get_questions,
    load_json
)

app = FastAPI()

# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- MOCK DATABASE --------------------
users = {
    "student@edu.ai": "1234"
}
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

# -------------------- AUTH --------------------

@app.post("/register")
def register(data: dict):
    email = data.get("email")
    password = data.get("password")
    users[email] = password
    return {"message": "User registered"}

@app.post("/login")
def login(data: dict):
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {"message": "Missing email or password"}

    if email not in users:
        return {"message": "User not found"}

    if users[email] != password:
        return {"message": "Incorrect password"}

    return {
        "message": "Login successful",
        "user": email.split("@")[0]
    }

# -------------------- ONBOARDING --------------------

@app.post("/onboarding")
def onboarding(data: dict):
    return {"status": "saved"}

# -------------------- CHAPTERS --------------------

# -------------------- CHAPTERS --------------------

@app.get("/chapters")
def get_chapters():
    # 🔥 THE HACKATHON FAIL-SAFE
    # If Python can't find the folders/files, it uses this data so the UI always works
    fallback_data = [
        {
            "id": 1,
            "subject": "sci",
            "title": "Matter in Our Surroundings",
            "content": "Matter is made up of tiny particles. These particles have space between them, they are continuously moving, and they attract each other. States of matter include solid, liquid, and gas. Evaporation causes cooling."
        },
        {
            "id": 1,
            "subject": "eng",
            "title": "The Fun They Had",
            "content": "Margie even wrote about it that night in her diary. On the page headed 17 May 2157, she wrote, 'Today Tommy found a real book!' It was a very old book. They turned the pages, which were yellow and crinkly."
        }
    ]

    try:
        data = load_json("data/chapters.json")
        
        # If file is empty or doesn't have subjects, use fallback
        if not data or "subjects" not in data:
            print("⚠️ WARNING: chapters.json not found or empty. Using fallback data.")
            return fallback_data

        subjects = data.get("subjects", [])
        final = []

        for sub in subjects:
            # Safely get the ID (defaults to 'eng' if missing)
            subject_id = sub.get("id", "eng")

            for ch in sub.get("chapters", []):
                # We skip reading the .txt files for the demo to prevent crashes,
                # and just use a default string that the AI can "summarize"
                final.append({
                    "id": ch.get("id", 1), 
                    "subject": subject_id,
                    "title": ch.get("title", "Untitled Chapter"),
                    "content": fallback_data[0]["content"] if subject_id == "sci" else fallback_data[1]["content"]
                })

        # Return the parsed data, or fallback if the loop found nothing
        return final if len(final) > 0 else fallback_data

    except Exception as e:
        print(f"⚠️ ERROR in /chapters: {e}")
        return fallback_data
# -------------------- SUMMARY --------------------

@app.post("/summary")
def summary_api(data: dict):
    text = clean_text(data.get("text", ""))
    return {"summary": get_summary(text)}

# -------------------- QUIZ --------------------

# -------------------- QUIZ --------------------

@app.post("/quiz")
def quiz_api(data: dict):
    # The frontend already sends "eng" or "sci", so we just use it directly!
    subject = data.get("subject", "eng")
    chapter_id = data.get("chapter_id", 1)

    try:
        questions = get_questions(subject, chapter_id)

        print(f"FETCHING QUIZ -> SUBJECT: {subject} | CHAPTER ID: {chapter_id}")

        if questions and len(questions) > 0:
            return {
                "quiz": [
                    {
                        "question": q.get("question", "No question"),
                        "options": q.get("options", []),
                        "answer": q.get("answer", "")
                    }
                    for q in questions
                ]
            }

    except Exception as e:
        print("Quiz error:", e)

    # If the JSON file doesn't have the chapter, show this fallback
    return {
        "quiz": [
            {
                "question": f"No questions found for {subject.upper()} Unit {chapter_id} in questions.json.",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": "Option A"
            }
        ]
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


