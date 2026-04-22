import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const cardColors = [
  "#1C1008", "#081C10", "#08101C", "#1C0808",
  "#0F0C18", "#181208", "#0C1818", "#180C18",
];

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const bg = isDark ? "#0A0A0A" : "#F5F5F0";
  const heroBg = isDark ? "#111111" : "#EBEBEB";
  const cardBg = isDark ? "#111111" : "#FFFFFF";
  const textColor = isDark ? "#F5F0E8" : "#1A1A1A";
  const grayColor = isDark ? "#888880" : "#555550";
  const borderColor = isDark ? "rgba(201,168,76,0.12)" : "rgba(201,168,76,0.25)";

  const handleCheckout = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/v1/orders",
        {
          total_price: cartTotal.toFixed(2),
          items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      clearCart();
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
    setLoading(false);
  };

  if (status === "success") {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", textAlign: "center", padding: "60px", transition: "all 0.3s" }}>
        <div style={{ width: "100px", height: "100px", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", color: "#C9A84C" }}>✦</div>
        <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "48px", fontWeight: "300", color: textColor }}>
          {t.orderConfirmed} <em style={{ fontStyle: "italic", color: "#C9A84C" }}>{t.orderConfirmedEm}</em>
        </h2>
        <p style={{ fontSize: "13px", color: grayColor, fontWeight: "300", maxWidth: "400px", lineHeight: "1.8" }}>
          {t.orderConfirmedSub}
        </p>
        <button onClick={() => navigate("/products")} style={{ padding: "14px 40px", background: "#C9A84C", color: "#0A0A0A", border: "none", fontFamily: "Montserrat, sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", cursor: "pointer", marginTop: "8px" }}>
          {t.continueShoppingBtn}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Montserrat, sans-serif", color: textColor, paddingTop: "80px", transition: "all 0.3s" }}>

      {/* HERO */}
      <div style={{ padding: "60px 60px 40px", background: heroBg, borderBottom: `1px solid ${borderColor}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.05) 0%, transparent 60%)" }} />
        <div style={{ fontSize: "10px", letterSpacing: "5px", textTransform: "uppercase", color: "#C9A84C", fontWeight: "500", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", position: "relative", zIndex: 1 }}>
          <span style={{ width: "30px", height: "1px", background: "#C9A84C", opacity: 0.5, display: "inline-block" }} />
          {t.yourSelection}
        </div>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: "300", color: textColor, lineHeight: "1", position: "relative", zIndex: 1, margin: 0 }}>
          {t.shoppingCart}
        </h1>
        <p style={{ fontSize: "12px", color: grayColor, marginTop: "12px", fontWeight: "300", letterSpacing: "1px", position: "relative", zIndex: 1 }}>
          {cart.length === 0 ? t.cartEmpty : `${cart.length} ${cart.length > 1 ? t.items : t.item} ${t.selected}`}
        </p>
      </div>

      {/* EMPTY */}
      {cart.length === 0 ? (
        <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px", padding: "60px" }}>
          <div style={{ fontSize: "48px", color: "#C9A84C", opacity: 0.2, fontFamily: "Cormorant Garamond, serif" }}>◇</div>
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: "300", color: textColor }}>{t.cartEmpty}</h2>
          <p style={{ fontSize: "13px", color: grayColor, fontWeight: "300" }}>{t.cartEmptySub}</p>
          <button onClick={() => navigate("/products")} style={{ padding: "14px 40px", background: "#C9A84C", color: "#0A0A0A", border: "none", fontFamily: "Montserrat, sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", cursor: "pointer", marginTop: "8px" }}>
            {t.exploreCollection2}
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 60px", display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px", alignItems: "start" }}>

          {/* ITEMS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {cart.map((item, i) => (
              <div key={item.id}
                style={{ background: cardBg, padding: "24px 28px", display: "flex", alignItems: "center", gap: "20px", transition: "background 0.3s", borderLeft: "2px solid transparent" }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? "#1A1A1A" : "#F0F0EB"; e.currentTarget.style.borderLeftColor = "rgba(201,168,76,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = cardBg; e.currentTarget.style.borderLeftColor = "transparent"; }}
              >
                <div style={{ width: "72px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: "4px", border: `1px solid ${borderColor}`, backgroundColor: cardColors[i % cardColors.length] }}>
                  <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", fontWeight: "300", color: "rgba(255,255,255,0.2)", userSelect: "none" }}>
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", fontWeight: "400", color: textColor, marginBottom: "6px" }}>{item.name}</div>
                  <div style={{ fontSize: "12px", color: grayColor, fontWeight: "300" }}>${parseFloat(item.price).toFixed(2)} {t.each}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <button onClick={() => updateQuantity(item.id, -1)} style={{ width: "36px", height: "36px", background: "transparent", border: "none", color: "#C9A84C", fontSize: "18px", cursor: "pointer" }}>−</button>
                  <div style={{ width: "40px", textAlign: "center", fontSize: "14px", fontWeight: "500", color: textColor, borderLeft: "1px solid rgba(201,168,76,0.2)", borderRight: "1px solid rgba(201,168,76,0.2)", lineHeight: "36px" }}>{item.quantity}</div>
                  <button onClick={() => updateQuantity(item.id, 1)} style={{ width: "36px", height: "36px", background: "transparent", border: "none", color: "#C9A84C", fontSize: "18px", cursor: "pointer" }}>+</button>
                </div>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "24px", fontWeight: "300", color: "#C9A84C", minWidth: "90px", textAlign: "right" }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{ background: "transparent", border: "none", color: isDark ? "rgba(245,240,232,0.2)" : "rgba(0,0,0,0.2)", fontSize: "16px", cursor: "pointer", padding: "8px" }}>✕</button>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, position: "sticky", top: "100px" }}>
            <div style={{ padding: "28px 32px", borderBottom: `1px solid ${borderColor}` }}>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "24px", fontWeight: "300", color: textColor }}>{t.orderSummary}</div>
            </div>
            <div style={{ padding: "24px 32px" }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", fontSize: "12px", color: grayColor, fontWeight: "300" }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span style={{ color: textColor }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ height: "1px", background: borderColor, margin: "20px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: grayColor, fontWeight: "500" }}>{t.total}</div>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: "300", color: "#C9A84C" }}>${cartTotal.toFixed(2)}</div>
              </div>
            </div>
            <div style={{ padding: "0 32px 32px" }}>
              {status === "error" && (
                <div style={{ padding: "12px 16px", background: "rgba(201,68,68,0.08)", borderLeft: "2px solid #C94444", color: "#E88080", fontSize: "12px", marginBottom: "16px", fontWeight: "300" }}>
                  {t.checkoutFailed}
                </div>
              )}
              <button onClick={handleCheckout} disabled={loading} style={{ width: "100%", padding: "18px", background: "#C9A84C", color: "#0A0A0A", border: "none", fontFamily: "Montserrat, sans-serif", fontSize: "10px", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, marginBottom: "12px" }}>
                {loading ? t.processing : t.proceedCheckout}
              </button>
              <button onClick={() => navigate("/products")} style={{ width: "100%", padding: "14px", background: "transparent", color: grayColor, border: `1px solid ${isDark ? "rgba(245,240,232,0.1)" : "rgba(0,0,0,0.1)"}`, fontFamily: "Montserrat, sans-serif", fontSize: "10px", fontWeight: "500", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
                {t.continueShopping}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}