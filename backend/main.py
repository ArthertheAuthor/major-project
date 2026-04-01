from fastapi import FastAPI
from utils.summarizer import get_summary
from utils.quiz_generator import generate_quiz

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.post("/summary")
def summary_api(data: dict):
    text = data.get("text", "")
    return {"summary": get_summary(text)}

@app.post("/quiz")
def quiz_api(data: dict):
    text = data.get("text", "")
    return {"quiz": generate_quiz(text)}

import json

@app.get("/chapters")
def get_chapters():
    with open("data/chapters.json") as f:
        return json.load(f)