import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: "🛍️", title: "Wide Selection", desc: "Thousands of products at your fingertips" },
    { icon: "🚚", title: "Fast Delivery", desc: "Quick and reliable shipping to your door" },
    { icon: "🔒", title: "Secure Payment", desc: "Your transactions are always protected" },
    { icon: "⭐", title: "Top Quality", desc: "Only the best products make it to our store" },
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "500+", label: "Products" },
    { number: "99%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", overflowX: "hidden" }}>

      {/* HERO */}
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Animated background circles */}
        <div style={{
          position: "absolute", width: "500px", height: "500px",
          borderRadius: "50%", background: "rgba(233,69,96,0.1)",
          top: "-100px", right: "-100px", animation: "pulse 4s infinite",
        }} />
        <div style={{
          position: "absolute", width: "300px", height: "300px",
          borderRadius: "50%", background: "rgba(48,43,99,0.3)",
          bottom: "-50px", left: "-50px",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-block",
            background: "rgba(233,69,96,0.2)",
            border: "1px solid rgba(233,69,96,0.5)",
            borderRadius: "30px",
            padding: "8px 20px",
            color: "#e94560",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "24px",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}>
            🔥 New Arrivals Every Week
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            color: "white",
            fontWeight: "900",
            lineHeight: "1.1",
            margin: "0 0 24px 0",
            textShadow: "0 0 40px rgba(233,69,96,0.3)",
          }}>
            Shop Smarter with<br />
            <span style={{
              background: "linear-gradient(90deg, #e94560, #f5a623)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>SmartCart</span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "18px",
            maxWidth: "550px",
            margin: "0 auto 40px auto",
            lineHeight: "1.7",
          }}>
            Discover thousands of amazing products at unbeatable prices. Fast shipping, secure payments, and top-quality items.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/products")} style={{
              padding: "16px 48px",
              background: "linear-gradient(90deg, #e94560, #c0392b)",
              color: "white",
              border: "none",
              borderRadius: "50px",
              fontSize: "17px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 8px 30px rgba(233,69,96,0.4)",
              transition: "transform 0.2s",
            }}
              onMouseOver={e => e.target.style.transform = "scale(1.05)"}
              onMouseOut={e => e.target.style.transform = "scale(1)"}
            >
              Shop Now →
            </button>
            <button onClick={() => navigate("/register")} style={{
              padding: "16px 48px",
              background: "transparent",
              color: "white",
              border: "2px solid rgba(255,255,255,0.3)",
              borderRadius: "50px",
              fontSize: "17px",
              fontWeight: "600",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              transition: "all 0.2s",
            }}
              onMouseOver={e => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.borderColor = "white"; }}
              onMouseOut={e => { e.target.style.background = "transparent"; e.target.style.borderColor = "rgba(255,255,255,0.3)"; }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: "30px",
          color: "rgba(255,255,255,0.4)", fontSize: "13px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
        }}>
          <span>Scroll down</span>
          <div style={{
            width: "1px", height: "40px",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
          }} />
        </div>
      </div>

      {/* STATS */}
      <div style={{
        background: "#e94560",
        padding: "50px 40px",
        display: "flex",
        justifyContent: "center",
        gap: "60px",
        flexWrap: "wrap",
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: "center", color: "white" }}>
            <div style={{ fontSize: "42px", fontWeight: "900", lineHeight: 1 }}>{s.number}</div>
            <div style={{ fontSize: "14px", opacity: 0.85, marginTop: "6px", fontWeight: "500" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div style={{ padding: "100px 40px", background: "#f8f9ff", textAlign: "center" }}>
        <p style={{ color: "#e94560", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
          Why Us
        </p>
        <h2 style={{ fontSize: "40px", color: "#0f0c29", marginBottom: "12px", fontWeight: "800" }}>
          Why Choose SmartCart?
        </h2>
        <p style={{ color: "#888", marginBottom: "60px", fontSize: "16px" }}>
          Everything you need for the perfect shopping experience
        </p>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "28px" }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: "white",
              borderRadius: "20px",
              padding: "48px 32px",
              width: "230px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.07)",
              transition: "transform 0.3s, box-shadow 0.3s",
              cursor: "default",
            }}
              onMouseOver={e => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(233,69,96,0.15)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.07)";
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>{f.icon}</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#0f0c29", fontSize: "18px", fontWeight: "700" }}>{f.title}</h3>
              <p style={{ color: "#888", fontSize: "14px", margin: 0, lineHeight: "1.6" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA BANNER */}
      <div style={{
        background: "linear-gradient(135deg, #0f0c29, #302b63)",
        padding: "100px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", width: "400px", height: "400px",
          borderRadius: "50%", background: "rgba(233,69,96,0.08)",
          top: "-100px", left: "50%", transform: "translateX(-50%)",
        }} />
        <h2 style={{ fontSize: "44px", color: "white", fontWeight: "900", marginBottom: "16px", position: "relative" }}>
          Ready to Shop? 🛍️
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "18px", marginBottom: "40px", position: "relative" }}>
          Join thousands of satisfied customers and start saving today!
        </p>
        <button onClick={() => navigate("/products")} style={{
          padding: "18px 60px",
          background: "linear-gradient(90deg, #e94560, #f5a623)",
          color: "white",
          border: "none",
          borderRadius: "50px",
          fontSize: "18px",
          fontWeight: "800",
          cursor: "pointer",
          boxShadow: "0 8px 30px rgba(233,69,96,0.5)",
          position: "relative",
          transition: "transform 0.2s",
        }}
          onMouseOver={e => e.target.style.transform = "scale(1.05)"}
          onMouseOut={e => e.target.style.transform = "scale(1)"}
        >
          Browse Products →
        </button>
      </div>

      {/* FOOTER */}
      <div style={{
        background: "#080612",
        color: "rgba(255,255,255,0.3)",
        textAlign: "center",
        padding: "30px",
        fontSize: "14px",
      }}>
        © 2026 <span style={{ color: "#e94560", fontWeight: "700" }}>SmartCart</span>. All rights reserved. Made with ❤️
      </div>

    </div>
  );
}

export default Home;