import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ background: "#333", padding: "10px 20px", display: "flex", gap: "20px" }}>
      <Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
      <Link to="/products" style={{ color: "white", textDecoration: "none" }}>Products</Link>
      <Link to="/cart" style={{ color: "white", textDecoration: "none" }}>Cart</Link>
      <Link to="/login" style={{ color: "white", textDecoration: "none" }}>Login</Link>
      <Link to="/register" style={{ color: "white", textDecoration: "none" }}>Register</Link>
    </nav>
  );
}

export default Navbar;