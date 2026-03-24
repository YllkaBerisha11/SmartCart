import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/products");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif", padding: "20px",
    }}>
      {/* Card */}
      <div style={{
        background: "white", borderRadius: "24px", padding: "50px 44px",
        width: "100%", maxWidth: "420px",
        boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🛒</div>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "900", color: "#1a1a2e" }}>
            Welcome Back
          </h2>
          <p style={{ color: "#888", marginTop: "8px", fontSize: "15px" }}>
            Sign in to your SmartCart account
          </p>
        </div>

        {/* Error */}
        {message && (
          <div style={{
            background: "#fff0f3", border: "1px solid #ffc0cb",
            borderRadius: "10px", padding: "12px 16px",
            color: "#e94560", fontSize: "14px", marginBottom: "20px",
            fontWeight: "600",
          }}>
            ❌ {message}
          </div>
        )}

        {/* Inputs */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: "700", color: "#555", display: "block", marginBottom: "6px" }}>
            EMAIL ADDRESS
          </label>
          <input
            type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%", padding: "14px 16px", borderRadius: "12px",
              border: "2px solid #eee", fontSize: "15px", outline: "none",
              boxSizing: "border-box", transition: "border 0.2s",
            }}
            onFocus={e => e.target.style.border = "2px solid #e94560"}
            onBlur={e => e.target.style.border = "2px solid #eee"}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontSize: "13px", fontWeight: "700", color: "#555", display: "block", marginBottom: "6px" }}>
            PASSWORD
          </label>
          <input
            type="password" placeholder="••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%", padding: "14px 16px", borderRadius: "12px",
              border: "2px solid #eee", fontSize: "15px", outline: "none",
              boxSizing: "border-box", transition: "border 0.2s",
            }}
            onFocus={e => e.target.style.border = "2px solid #e94560"}
            onBlur={e => e.target.style.border = "2px solid #eee"}
          />
        </div>

        <button onClick={handleLogin} disabled={loading} style={{
          width: "100%", padding: "15px",
          background: loading ? "#ccc" : "linear-gradient(90deg, #e94560, #c0392b)",
          color: "white", border: "none", borderRadius: "12px",
          fontSize: "16px", fontWeight: "800", cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 8px 25px rgba(233,69,96,0.3)",
          transition: "transform 0.2s",
        }}
          onMouseOver={e => !loading && (e.target.style.transform = "scale(1.02)")}
          onMouseOut={e => e.target.style.transform = "scale(1)"}
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <p style={{ textAlign: "center", marginTop: "24px", color: "#888", fontSize: "14px" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#e94560", fontWeight: "700", textDecoration: "none" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;