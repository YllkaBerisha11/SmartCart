import React, { useState, useEffect } from "react";
import axios from "axios";

function Products() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/products").then((res) => {
      setProducts(res.data);
    });
  }, []);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setMessage(`✅ "${product.name}" u shtua në cart!`);
    setTimeout(() => setMessage(""), 2500);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #0f0c29, #302b63)",
        padding: "60px 40px",
        textAlign: "center",
        color: "white",
      }}>
        <h1 style={{ fontSize: "42px", fontWeight: "900", margin: "0 0 12px 0" }}>
          Our Products 🛍️
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", marginBottom: "30px" }}>
          Discover our amazing collection
        </p>
        {/* Search bar */}
        <div style={{ maxWidth: "400px", margin: "0 auto", position: "relative" }}>
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: "50px",
              border: "none",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {message && (
        <div style={{
          position: "fixed", top: "80px", right: "20px", zIndex: 999,
          background: "#1a1a2e", color: "white",
          padding: "14px 24px", borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          fontWeight: "600", fontSize: "15px",
          borderLeft: "4px solid #e94560",
        }}>
          {message}
        </div>
      )}

      {/* PRODUCTS GRID */}
      <div style={{ padding: "50px 40px", maxWidth: "1200px", margin: "0 auto" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#888" }}>
            <div style={{ fontSize: "60px" }}>🔍</div>
            <p style={{ fontSize: "18px" }}>No products found</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "28px",
          }}>
            {filtered.map((product) => (
              <div key={product.id} style={{
                background: "white",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.12)";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)";
                }}
              >
                {/* Product Image Placeholder */}
                <div style={{
                  height: "180px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "64px",
                }}>
                  🛍️
                </div>

                <div style={{ padding: "20px" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#1a1a2e", fontWeight: "700" }}>
                    {product.name}
                  </h3>
                  <p style={{ color: "#888", fontSize: "14px", margin: "0 0 16px 0", lineHeight: "1.5" }}>
                    {product.description || "No description available"}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: "24px", fontWeight: "900", color: "#e94560",
                    }}>
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <button onClick={() => addToCart(product)} style={{
                      padding: "10px 20px",
                      background: "linear-gradient(90deg, #e94560, #c0392b)",
                      color: "white",
                      border: "none",
                      borderRadius: "30px",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(233,69,96,0.3)",
                      transition: "transform 0.2s",
                    }}
                      onMouseOver={e => e.target.style.transform = "scale(1.05)"}
                      onMouseOut={e => e.target.style.transform = "scale(1)"}
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;