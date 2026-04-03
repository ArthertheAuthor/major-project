import json

# ---------- LOAD / SAVE ----------

def load_json(path):
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print("Error loading JSON:", e)
        return {}

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=4)


# ---------- SUBJECTS ----------

def get_subjects():
    data = load_json("data/chapters.json")
    return data.get("subjects", [])


# ✅ ADDED: Clean subject list for UI
def get_subject_list():
    subjects = get_subjects()
    return [
        {"id": sub["id"], "name": sub["name"]}
        for sub in subjects
    ]


def get_chapters_by_subject(subject_id):
    for sub in get_subjects():
        if sub["id"] == subject_id:
            return sub.get("chapters", [])
    return []


#  ADDED: Clean chapter list for UI
def get_chapter_list(subject_id):
    chapters = get_chapters_by_subject(subject_id)
    return [
        {"id": ch["id"], "title": ch["title"]}
        for ch in chapters
    ]


def get_chapter(subject_id, chapter_id):
    for ch in get_chapters_by_subject(subject_id):
        if ch["id"] == chapter_id:
            return ch
    return None


# ---------- CONTENT ----------

def get_chapter_text(subject_id, chapter_id):
    chapter = get_chapter(subject_id, chapter_id)

    if not chapter:
        return ""

    try:
        with open(chapter["content_file"], "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print("Error reading file:", e)
        return ""


# ---------- SCORES ----------

def update_score(subject_id, chapter_id, score):
    data = load_json("data/scores.json")

    if "user" not in data:
        data["user"] = {}

    if subject_id not in data["user"]:
        data["user"][subject_id] = {}

    if str(chapter_id) not in data["user"][subject_id]:
        data["user"][subject_id][str(chapter_id)] = {
            "attempts": 0,
            "best_score": 0,
            "last_score": 0
        }

    record = data["user"][subject_id][str(chapter_id)]

    record["attempts"] += 1
    record["last_score"] = score
    record["best_score"] = max(record["best_score"], score)

    save_json("data/scores.json", data)


def get_score(subject_id, chapter_id):
    data = load_json("data/scores.json")

    return data.get("user", {}).get(subject_id, {}).get(str(chapter_id), {
        "attempts": 0,
        "best_score": 0,
        "last_score": 0
    })

# ---------- QUESTIONS (QUIZ CACHE) ----------

def get_questions(subject_id, chapter_id):
    data = load_json("data/questions.json")
    return data.get(subject_id, {}).get(str(chapter_id), [])


def save_questions(subject_id, chapter_id, questions):
    data = load_json("data/questions.json")

    if subject_id not in data:
        data[subject_id] = {}

    data[subject_id][str(chapter_id)] = questions

    save_json("data/questions.json", data)
    
