import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateNav = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    updateNav();
    window.addEventListener("storage", updateNav);
    const interval = setInterval(updateNav, 500);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("storage", updateNav);
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    color: isActive(path) ? "#e94560" : "rgba(255,255,255,0.8)",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: isActive(path) ? "700" : "500",
    padding: "6px 4px",
    borderBottom: isActive(path) ? "2px solid #e94560" : "2px solid transparent",
    transition: "all 0.2s",
  });

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled
        ? "rgba(15, 12, 41, 0.97)"
        : "linear-gradient(135deg, #0f0c29, #302b63)",
      backdropFilter: "blur(10px)",
      padding: "0 40px",
      height: "64px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
      transition: "all 0.3s",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* LOGO */}
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "24px" }}>🛒</span>
        <span style={{ color: "white", fontWeight: "900", fontSize: "20px", letterSpacing: "-0.5px" }}>
          Smart<span style={{ color: "#e94560" }}>Cart</span>
        </span>
      </Link>

      {/* LINKS */}
      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        <Link to="/" style={linkStyle("/")}>Home</Link>
        <Link to="/products" style={linkStyle("/products")}>Products</Link>

        {/* Cart with badge */}
        <Link to="/cart" style={{ ...linkStyle("/cart"), position: "relative" }}>
          Cart
          {cartCount > 0 && (
            <span style={{
              position: "absolute", top: "-8px", right: "-14px",
              background: "#e94560", color: "white",
              borderRadius: "50%", width: "18px", height: "18px",
              fontSize: "11px", fontWeight: "800",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {cartCount}
            </span>
          )}
        </Link>

        {/* Auth */}
        {isLoggedIn ? (
          <button onClick={handleLogout} style={{
            padding: "8px 20px",
            background: "linear-gradient(90deg, #e94560, #c0392b)",
            color: "white", border: "none", borderRadius: "20px",
            fontSize: "14px", fontWeight: "700", cursor: "pointer",
            boxShadow: "0 4px 15px rgba(233,69,96,0.3)",
          }}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" style={linkStyle("/login")}>Login</Link>
            <Link to="/register" style={{
              padding: "8px 20px",
              background: "linear-gradient(90deg, #e94560, #c0392b)",
              color: "white", borderRadius: "20px",
              fontSize: "14px", fontWeight: "700", textDecoration: "none",
              boxShadow: "0 4px 15px rgba(233,69,96,0.3)",
            }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;