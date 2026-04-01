import { useEffect, useState } from "react";

function OfflineIndicator() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    window.addEventListener("online", () => setOnline(true));
    window.addEventListener("offline", () => setOnline(false));
  }, []);

  return (
    <div className="status">
      {online ? "🟢 Syncing..." : "🔴 Offline Mode"}
    </div>
  );
}

export default OfflineIndicator;