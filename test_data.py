from utils.data_handler import *

print("Subjects:", get_subject_list())
print("Chapters:", get_chapter_list("eng"))
print("Text:", get_chapter_text("eng", 1)[:100])

update_score("eng", 1, 5)
print("Score:", get_score("eng", 1))