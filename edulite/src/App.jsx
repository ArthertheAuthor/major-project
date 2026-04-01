import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import Quiz from "./pages/Quiz";
import Mindmap from "./pages/Mindmap";
import OfflineIndicator from "./components/offlineIndicator";

function App() {
  const [screen, setScreen] = useState("login");

  return (
    <div className="app">
      <OfflineIndicator />

      {screen === "login" && <Login setScreen={setScreen} />}
      {screen === "register" && <Register setScreen={setScreen} />}
      {screen === "onboarding" && <Onboarding setScreen={setScreen} />}
      {screen === "dashboard" && <Dashboard setScreen={setScreen} />}
      {screen === "learn" && <Learn />}
      {screen === "quiz" && <Quiz />}
      {screen === "mindmap" && <Mindmap />}
    </div>
  );
}

export default App;