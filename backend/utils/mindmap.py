from collections import Counter

def extract_keywords(text):
    words = text.lower().split()
    words = [w for w in words if len(w) > 4]

    freq = Counter(words)
    return [w for w, _ in freq.most_common(5)]

def generate_mindmap(text):
    keywords = extract_keywords(text)

    if not keywords:
        return {"nodes": [], "edges": []}

    nodes = [{"id": keywords[0]}]
    edges = []

    for i, word in enumerate(keywords[1:]):
        nodes.append({"id": word})
        edges.append({
            "source": keywords[0],
            "target": word
        })

    return {
        "nodes": nodes,
        "edges": edges
    }