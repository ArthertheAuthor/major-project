import { useState } from "react";
import { api } from "../api";

function Learn() {
  const [summary, setSummary] = useState("");

  const generate = async () => {
    const ch = JSON.parse(localStorage.getItem("chapter"));
    const res = await api.getSummary(ch.content);
    setSummary(res.summary);
  };

  return (
    <div>
      <div className="header">
        <h2>📘 Learn</h2>
      </div>

      <div className="card">
        <button onClick={generate}>Generate Summary</button>
        <p>{summary}</p>
      </div>
    </div>
  );
}

export default Learn;