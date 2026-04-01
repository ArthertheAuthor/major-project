const BASE_URL = "http://127.0.0.1:8000";

export const api = {
  getChapters: () =>
    fetch(`${BASE_URL}/chapters`).then(res => res.json()),

  getSummary: (text) =>
    fetch(`${BASE_URL}/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then(res => res.json()),

  getQuiz: (text) =>
    fetch(`${BASE_URL}/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then(res => res.json()),

  getMindmap: (text) =>
    fetch(`${BASE_URL}/mindmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then(res => res.json()),

  saveProgress: (user, score) =>
    fetch(`${BASE_URL}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, score }),
    }),
};