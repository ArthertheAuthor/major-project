from utils.data_handler import *

# Test questions
print("Questions BEFORE:", get_questions("eng", 1))

sample_questions = [
    {
        "question": "Sample Q?",
        "options": ["A", "B", "C", "D"],
        "answer": "A"
    }
]

save_questions("eng", 1, sample_questions)

print("Questions AFTER:", get_questions("eng", 1))