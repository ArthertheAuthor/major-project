function Login({ setScreen }) {
  return (
    <div>
      <div className="header">
        <h2>Welcome Back</h2>
      </div>

      <div className="card">
        <input placeholder="Email" />
        <input placeholder="Password" type="password" />

        <button onClick={() => setScreen("onboarding")}>
          Login
        </button>

        <p onClick={() => setScreen("register")}>
          Create Account
        </p>
      </div>
    </div>
  );
}

export default Login;