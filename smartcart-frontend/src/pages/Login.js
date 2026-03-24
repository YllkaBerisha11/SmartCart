import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });
      setMessage("Login successful! Token: " + res.data.token);
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      setMessage("Login failed: " + err.response.data.message);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", margin: "10px auto", padding: "8px", width: "300px" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", margin: "10px auto", padding: "8px", width: "300px" }}
      />
      <button
        onClick={handleLogin}
        style={{ padding: "10px 30px", background: "#333", color: "white", border: "none", cursor: "pointer" }}
      >
        Login
      </button>
      {message && <p style={{ marginTop: "20px", color: "green" }}>{message}</p>}
    </div>
  );
}

export default Login;