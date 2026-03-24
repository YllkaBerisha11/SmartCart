import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  }, []);

  const updateQuantity = (id, delta) => {
    const updated = cart
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const payload = JSON.parse(atob(token.split(".")[1]));
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/orders", {
        user_id: payload.id,
        total_price: total.toFixed(2),
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });
      localStorage.removeItem("cart");
      setCart([]);
      setMessage("success");
    } catch (err) {
      setMessage("error");
    }
    setLoading(false);
  };

  if (message === "success") {
    return (
      <div style={{
        minHeight: "100vh", background: "#f0f2f5",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        <div style={{
          background: "white", borderRadius: "24px", padding: "60px 50px",
          textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          maxWidth: "400px",
        }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>🎉</div>
          <h2 style={{ color: "#1a1a2e", fontSize: "28px", fontWeight: "900", marginBottom: "12px" }}>
            Order Confirmed!
          </h2>
          <p style={{ color: "#888", marginBottom: "30px", fontSize: "16px" }}>
            Thank you for your purchase! Your order has been placed successfully.
          </p>
          <button onClick={() => navigate("/products")} style={{
            padding: "14px 40px",
            background: "linear-gradient(90deg, #e94560, #c0392b)",
            color: "white", border: "none", borderRadius: "30px",
            fontSize: "16px", fontWeight: "700", cursor: "pointer",
          }}>
            Continue Shopping →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #0f0c29, #302b63)",
        padding: "50px 40px", textAlign: "center", color: "white",
      }}>
        <h1 style={{ fontSize: "38px", fontWeight: "900", margin: 0 }}>Shopping Cart 🛒</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>
          {cart.length === 0 ? "Your cart is empty" : `${cart.length} item(s) in your cart`}
        </p>
      </div>

      <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px" }}>
        {cart.length === 0 ? (
          <div style={{
            background: "white", borderRadius: "20px", padding: "80px",
            textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
          }}>
            <div style={{ fontSize: "70px", marginBottom: "20px" }}>🛒</div>
            <h3 style={{ color: "#1a1a2e", fontSize: "22px", marginBottom: "12px" }}>Your cart is empty!</h3>
            <p style={{ color: "#888", marginBottom: "30px" }}>Add some products to get started</p>
            <button onClick={() => navigate("/products")} style={{
              padding: "12px 36px",
              background: "linear-gradient(90deg, #e94560, #c0392b)",
              color: "white", border: "none", borderRadius: "30px",
              fontSize: "15px", fontWeight: "700", cursor: "pointer",
            }}>
              Browse Products →
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>

            {/* ITEMS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {cart.map((item) => (
                <div key={item.id} style={{
                  background: "white", borderRadius: "16px", padding: "20px 24px",
                  display: "flex", alignItems: "center", gap: "20px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                }}>
                  <div style={{
                    width: "70px", height: "70px", borderRadius: "12px", flexShrink: 0,
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px",
                  }}>🛍️</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 4px 0", color: "#1a1a2e", fontSize: "16px", fontWeight: "700" }}>
                      {item.name}
                    </h4>
                    <p style={{ margin: 0, color: "#e94560", fontWeight: "700", fontSize: "15px" }}>
                      ${parseFloat(item.price).toFixed(2)} / copë
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button onClick={() => updateQuantity(item.id, -1)} style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      border: "2px solid #eee", background: "white",
                      fontSize: "18px", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", fontWeight: "700",
                    }}>−</button>
                    <span style={{ fontWeight: "800", fontSize: "16px", minWidth: "20px", textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      border: "2px solid #eee", background: "white",
                      fontSize: "18px", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", fontWeight: "700",
                    }}>+</button>
                  </div>
                  <div style={{ fontWeight: "900", fontSize: "17px", color: "#1a1a2e", minWidth: "70px", textAlign: "right" }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{
                    background: "#fff0f3", border: "none", borderRadius: "8px",
                    padding: "8px 10px", cursor: "pointer", fontSize: "16px",
                    color: "#e94560",
                  }}>🗑</button>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div style={{
              background: "white", borderRadius: "20px", padding: "30px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)", height: "fit-content",
            }}>
              <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "800", color: "#1a1a2e" }}>
                Order Summary
              </h3>
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
                {cart.map((item) => (
                  <div key={item.id} style={{
                    display: "flex", justifyContent: "space-between",
                    marginBottom: "10px", fontSize: "14px", color: "#666",
                  }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{
                borderTop: "2px solid #f0f0f0", marginTop: "16px", paddingTop: "16px",
                display: "flex", justifyContent: "space-between",
                fontSize: "20px", fontWeight: "900", color: "#1a1a2e",
              }}>
                <span>Total</span>
                <span style={{ color: "#e94560" }}>${total.toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout} disabled={loading} style={{
                width: "100%", marginTop: "24px",
                padding: "16px",
                background: loading ? "#ccc" : "linear-gradient(90deg, #e94560, #c0392b)",
                color: "white", border: "none", borderRadius: "14px",
                fontSize: "17px", fontWeight: "800", cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 25px rgba(233,69,96,0.3)",
              }}>
                {loading ? "Processing..." : "Checkout ✅"}
              </button>
              <button onClick={() => navigate("/products")} style={{
                width: "100%", marginTop: "12px", padding: "12px",
                background: "transparent", color: "#888",
                border: "2px solid #eee", borderRadius: "14px",
                fontSize: "15px", cursor: "pointer",
              }}>
                ← Continue Shopping
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;