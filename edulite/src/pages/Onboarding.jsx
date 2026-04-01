function Onboarding({ setScreen }) {
  return (
    <div>
      <div className="header">
        <h2>Setup Profile</h2>
      </div>

      <div className="card">
        <input placeholder="Name" />
        <input placeholder="Age" />

        <select>
          <option>Select Class</option>
          <option>6</option>
          <option>7</option>
          <option>8</option>
        </select>

        <button onClick={() => setScreen("dashboard")}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default Onboarding;