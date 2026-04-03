def generate_quiz(text, focus=None):
    words = list(set(text.split()))
    words = [w for w in words if len(w) > 4]

    keyword = focus if focus else (words[0] if words else "Concept")

    

    return [
        {
            "question": f"What is {keyword}?",
            "options": [keyword, "Definition", "Example", "Process"],
            "answer": keyword
        },
        {
            "question": f"{keyword} is related to which concept?",
            "options": ["Technology", "Biology", "History", "Geography"],
            "answer": "Technology"
        }
    ]