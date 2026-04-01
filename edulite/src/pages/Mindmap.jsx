import { useEffect, useState } from "react";
import { api } from "../api";

function Mindmap() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const ch = JSON.parse(localStorage.getItem("chapter"));
    api.getMindmap(ch.content).then(setData);
  }, []);

  return (
    <div>
      <div className="header">
        <h2>🗺️ Mindmap</h2>
      </div>

      <div className="card">
        {data ? (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        ) : (
          "Loading..."
        )}
      </div>
    </div>
  );
}

export default Mindmap;