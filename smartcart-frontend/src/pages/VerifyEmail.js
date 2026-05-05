import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams, Link } from "react-router-dom";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const called = useRef(false);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
    .ve-root { min-height:100vh; background:#0A0A0A; display:flex; align-items:center; justify-content:center; font-family:'Montserrat',sans-serif; padding:20px; }
  `;

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    if (!token) {
      setStatus("error");
      setMessage("Token mungon!");
      return;
    }

    axios.get(`http://localhost:5000/api/v1/users/verify-email?token=${token}`)
      .then(() => {
        setStatus("success");
        setMessage("Llogaria u aktivizua me sukses!");
      })
      .catch(err => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Token i pavlefshëm!");
      });
  }, [token]);

  return (
    <>
      <style>{styles}</style>
      <div className="ve-root">
        <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
          <Link to="/" style={{ fontFamily: "Cormorant Garamond,serif", fontSize: "28px", fontWeight: "300", color: "#C9A84C", letterSpacing: "6px", textTransform: "uppercase", textDecoration: "none", display: "block", marginBottom: "40px" }}>
            SmartCart
          </Link>

          {status === "loading" && (
            <>
              <div style={{ fontSize: "48px", marginBottom: "24px" }}>⏳</div>
              <h2 style={{ fontFamily: "Cormorant Garamond,serif", fontSize: "32px", fontWeight: "300", color: "#F5F0E8" }}>
                Duke <em style={{ color: "#C9A84C", fontStyle: "italic" }}>verifikuar...</em>
              </h2>
            </>
          )}

          {status === "success" && (
            <>
              <div style={{ fontSize: "60px", marginBottom: "24px" }}>✅</div>
              <h2 style={{ fontFamily: "Cormorant Garamond,serif", fontSize: "32px", fontWeight: "300", color: "#F5F0E8", marginBottom: "12px" }}>
                Llogaria u <em style={{ color: "#C9A84C", fontStyle: "italic" }}>aktivizua!</em>
              </h2>
              <p style={{ fontSize: "13px", color: "#888880", marginBottom: "32px" }}>{message}</p>
              <Link to="/login" style={{ display: "inline-block", padding: "14px 36px", background: "#C9A84C", color: "#0A0A0A", textDecoration: "none", fontSize: "10px", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase" }}>
                Kyçu Tani →
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ fontSize: "60px", marginBottom: "24px" }}>❌</div>
              <h2 style={{ fontFamily: "Cormorant Garamond,serif", fontSize: "32px", fontWeight: "300", color: "#F5F0E8", marginBottom: "12px" }}>
                <em style={{ color: "#E57373", fontStyle: "italic" }}>Gabim!</em>
              </h2>
              <p style={{ fontSize: "13px", color: "#888880", marginBottom: "32px" }}>{message}</p>
              <Link to="/register" style={{ color: "#C9A84C", textDecoration: "none", fontSize: "12px", letterSpacing: "2px" }}>
                ← Regjistrohu Përsëri
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}