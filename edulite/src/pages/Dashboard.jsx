import { useEffect, useState } from "react";
import { api } from "../api";

function Dashboard({ setScreen }) {
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    api.getChapters().then(setChapters);
  }, []);

  const selectChapter = (ch) => {
    localStorage.setItem("chapter", JSON.stringify(ch));
  };

  return (
    <div>
      <div className="header">
        <h2>Hi Student 👋</h2>
        <p>Continue your learning</p>
      </div>

      <div className="card">
        <h3>📚 Chapters</h3>

        {chapters.map((ch, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <b>{ch.title}</b>
            <button onClick={() => selectChapter(ch)}>Select</button>
          </div>
        ))}
      </div>

      <div className="nav">
        <button onClick={() => setScreen("learn")}>Learn</button>
        <button onClick={() => setScreen("quiz")}>Quiz</button>
        <button onClick={() => setScreen("mindmap")}>Map</button>
      </div>
    </div>
  );
}

export default Dashboard;