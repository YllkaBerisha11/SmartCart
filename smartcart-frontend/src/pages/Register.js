import React, { useState } from "react";
import axios from "axios";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/users/register", {
        name,
        email,
        password,
      });
      setMessage("Registration successful! Please login.");
    } catch (err) {
      setMessage("Error: " + err.response.data.message);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: "block", margin: "10px auto", padding: "8px", width: "300px" }}
      />
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
        onClick={handleRegister}
        style={{ padding: "10px 30px", background: "#333", color: "white", border: "none", cursor: "pointer" }}
      >
        Register
      </button>
      {message && <p style={{ marginTop: "20px", color: "green" }}>{message}</p>}
    </div>
  );
}

export default Register;