import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/users/register", { name, email, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
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
      <div style={{
        background: "white", borderRadius: "24px", padding: "50px 44px",
        width: "100%", maxWidth: "420px",
        boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
      }}>
        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "70px", marginBottom: "16px" }}>🎉</div>
            <h2 style={{ color: "#1a1a2e", fontWeight: "900" }}>Account Created!</h2>
            <p style={{ color: "#888" }}>Redirecting to login...</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>🛒</div>
              <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "900", color: "#1a1a2e" }}>
                Create Account
              </h2>
              <p style={{ color: "#888", marginTop: "8px", fontSize: "15px" }}>
                Join SmartCart today — it's free!
              </p>
            </div>

            {message && (
              <div style={{
                background: "#fff0f3", border: "1px solid #ffc0cb",
                borderRadius: "10px", padding: "12px 16px",
                color: "#e94560", fontSize: "14px", marginBottom: "20px", fontWeight: "600",
              }}>
                ❌ {message}
              </div>
            )}

            {[
              { label: "FULL NAME", value: name, setter: setName, type: "text", placeholder: "John Doe" },
              { label: "EMAIL ADDRESS", value: email, setter: setEmail, type: "email", placeholder: "you@example.com" },
              { label: "PASSWORD", value: password, setter: setPassword, type: "password", placeholder: "••••••••" },
            ].map((field, i) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#555", display: "block", marginBottom: "6px" }}>
                  {field.label}
                </label>
                <input
                  type={field.type} placeholder={field.placeholder}
                  value={field.value} onChange={(e) => field.setter(e.target.value)}
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: "12px",
                    border: "2px solid #eee", fontSize: "15px", outline: "none",
                    boxSizing: "border-box", transition: "border 0.2s",
                  }}
                  onFocus={e => e.target.style.border = "2px solid #e94560"}
                  onBlur={e => e.target.style.border = "2px solid #eee"}
                />
              </div>
            ))}

            <button onClick={handleRegister} disabled={loading} style={{
              width: "100%", padding: "15px", marginTop: "8px",
              background: loading ? "#ccc" : "linear-gradient(90deg, #e94560, #c0392b)",
              color: "white", border: "none", borderRadius: "12px",
              fontSize: "16px", fontWeight: "800", cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 25px rgba(233,69,96,0.3)",
            }}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>

            <p style={{ textAlign: "center", marginTop: "24px", color: "#888", fontSize: "14px" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#e94560", fontWeight: "700", textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;