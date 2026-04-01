def get_summary(text):
    sentences = text.split(".")
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]

    return ". ".join(sentences[:2]) + "." if sentences else "No summary available."