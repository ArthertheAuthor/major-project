function Register({ setScreen }) {
  return (
    <div>
      <div className="header">
        <h2>Create Account</h2>
      </div>

      <div className="card">
        <input placeholder="Email" />
        <input placeholder="Password" />

        <button onClick={() => setScreen("login")}>
          Register
        </button>
      </div>
    </div>
  );
}

export default Register;