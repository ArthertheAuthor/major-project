def generate_mindmap(text):
    words = list(set(text.split()))
    words = [w for w in words if len(w) > 4][:6]  # limit nodes

    root = words[0] if words else "Topic"

    nodes = [{"id": root}]
    edges = []

    for w in words[1:]:
        nodes.append({"id": w})
        edges.append({"source": root, "target": w})

    return {
        "nodes": nodes,
        "edges": edges
    }