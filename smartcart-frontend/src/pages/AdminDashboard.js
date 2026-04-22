import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ✅ THEME COLORS
  const bg = isDark ? "#0A0A0A" : "#F5F5F0";
  const cardBg = isDark ? "#111111" : "#FFFFFF";
  const textColor = isDark ? "#F5F0E8" : "#1A1A1A";
  const grayColor = isDark ? "#888880" : "#555550";
  const borderColor = isDark ? "rgba(201,168,76,0.12)" : "rgba(201,168,76,0.25)";
  const rowEven = isDark ? "#111111" : "#FAFAFA";
  const rowOdd = isDark ? "#0A0A0A" : "#FFFFFF";
  const modalBg = isDark ? "#111111" : "#FFFFFF";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, productsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/v1/stats/overview", { headers }),
        axios.get("http://localhost:5000/api/v1/users", { headers }),
        axios.get("http://localhost:5000/api/v1/products", { headers }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProducts(productsRes.data.data || productsRes.data);
      toast.success(t.dataLoaded);
    } catch (err) {
      toast.error(t.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/users/${id}`, { headers });
      setUsers(users.filter((u) => u.id !== id));
      toast.success(t.userDeleted);
    } catch (err) {
      toast.error(t.errorDeleting);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/products/${id}`, { headers });
      setProducts(products.filter((p) => p.id !== id));
      toast.success(t.productDeleted);
    } catch (err) {
      toast.error(t.errorDeleting);
    }
  };

  const openEditProduct = (product) => {
    setSelectedItem(product);
    setFormData({
      name: product.name || product.NAME,
      price: product.price,
      description: product.description || "",
      category: product.category || "",
      stock: product.stock,
    });
    setModalType("editProduct");
    setShowModal(true);
  };

  const openAddProduct = () => {
    setFormData({ name: "", price: "", description: "", category: "", stock: 0 });
    setModalType("addProduct");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({});
    setModalType(null);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || formData.name.length < 2) {
      toast.error("❌ " + t.nameLabel + " " + t.required + "!");
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error("❌ " + t.priceLabel + " " + t.required + "!");
      return;
    }
    try {
      if (modalType === "editProduct") {
        await axios.put(`http://localhost:5000/api/v1/products/${selectedItem.id}`, formData, { headers });
        setProducts(products.map((p) => p.id === selectedItem.id ? { ...p, ...formData } : p));
        toast.success(t.productUpdated);
      } else if (modalType === "addProduct") {
        const res = await axios.post("http://localhost:5000/api/v1/products", formData, { headers });
        setProducts([...products, res.data.data]);
        toast.success(t.productAdded);
      }
      closeModal();
    } catch (err) {
      toast.error(t.errorSaving);
    }
  };

  const thStyle = {
    padding: "12px 16px", textAlign: "left",
    fontSize: "10px", letterSpacing: "2px",
    color: grayColor, textTransform: "uppercase",
    borderBottom: `1px solid ${borderColor}`,
  };

  const tdStyle = {
    padding: "12px 16px",
    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}`,
    fontSize: "13px", color: textColor,
  };

  const tableStyle = {
    width: "100%", borderCollapse: "collapse",
    border: `1px solid ${borderColor}`,
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
      <div style={{ color: "#C9A84C", fontSize: "14px", letterSpacing: "4px", textTransform: "uppercase" }}>{t.loadingData}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textColor, fontFamily: "Montserrat, sans-serif", paddingTop: "100px", transition: "all 0.3s" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px 40px" }}>

        {/* HEADER */}
        <div style={{ marginBottom: "40px", borderBottom: `1px solid ${borderColor}`, paddingBottom: "24px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#C9A84C", marginBottom: "8px", textTransform: "uppercase" }}>
            {t.smartcartAdmin}
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: "300", color: textColor, margin: 0, fontFamily: "Cormorant Garamond, serif" }}>
            {t.adminDashboard}
          </h1>
          <p style={{ color: grayColor, fontSize: "12px", marginTop: "8px" }}>
            {t.welcomeAdmin} <strong style={{ color: "#C9A84C" }}>{user?.name}</strong> — {t.role}: <strong style={{ color: "#C9A84C" }}>{user?.role}</strong>
          </p>
        </div>

        {/* STATS CARDS */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "40px" }}>
            {[
              { label: t.users, value: stats.totalUsers, color: "#4CAF50", icon: "👥" },
              { label: t.productsLabel, value: stats.totalProducts, color: "#C9A84C", icon: "📦" },
              { label: t.orders, value: stats.totalOrders, color: "#FF9800", icon: "🛒" },
              { label: t.revenue, value: `€${Number(stats.totalRevenue).toFixed(2)}`, color: "#9C27B0", icon: "💰" },
            ].map((card, i) => (
              <div key={i} style={{
                background: cardBg, border: `1px solid ${borderColor}`,
                borderTop: `2px solid ${card.color}`, borderRadius: "4px",
                padding: "24px", textAlign: "center",
              }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>{card.icon}</div>
                <div style={{ fontSize: "10px", letterSpacing: "3px", color: grayColor, textTransform: "uppercase", marginBottom: "8px" }}>{card.label}</div>
                <div style={{ fontSize: "32px", fontWeight: "300", color: card.color, fontFamily: "Cormorant Garamond, serif" }}>{card.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* TABS */}
        <div style={{ display: "flex", gap: "2px", marginBottom: "30px", borderBottom: `1px solid ${borderColor}` }}>
          {["overview", "users", "products"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "12px 24px",
              background: activeTab === tab ? "rgba(201,168,76,0.1)" : "transparent",
              color: activeTab === tab ? "#C9A84C" : grayColor,
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #C9A84C" : "2px solid transparent",
              cursor: "pointer", fontSize: "10px", letterSpacing: "2px",
              textTransform: "uppercase", fontFamily: "Montserrat, sans-serif", transition: "all 0.3s",
            }}>
              {tab === "overview" ? `📊 ${t.overview}` : tab === "users" ? `👥 ${t.users}` : `📦 ${t.productsLabel}`}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && stats && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "300", color: textColor, marginBottom: "20px", fontFamily: "Cormorant Garamond, serif" }}>
              {t.ordersByStatus}
            </h2>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: cardBg }}>
                  <th style={thStyle}>{t.status}</th>
                  <th style={thStyle}>{t.count}</th>
                </tr>
              </thead>
              <tbody>
                {stats.ordersByStatus.length === 0 ? (
                  <tr><td colSpan="2" style={{ ...tdStyle, textAlign: "center", color: grayColor }}>{t.noOrders}</td></tr>
                ) : stats.ordersByStatus.map((s, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? rowEven : rowOdd }}>
                    <td style={tdStyle}>{s.status}</td>
                    <td style={tdStyle}>{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 style={{ fontSize: "18px", fontWeight: "300", color: textColor, margin: "30px 0 20px", fontFamily: "Cormorant Garamond, serif" }}>
              🏆 {t.top5}
            </h2>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: cardBg }}>
                  <th style={thStyle}>{t.productLabel}</th>
                  <th style={thStyle}>{t.totalSold}</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.length === 0 ? (
                  <tr><td colSpan="2" style={{ ...tdStyle, textAlign: "center", color: grayColor }}>{t.noData}</td></tr>
                ) : stats.topProducts.map((p, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? rowEven : rowOdd }}>
                    <td style={tdStyle}>{p.name}</td>
                    <td style={tdStyle}>{p.total_sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "300", color: textColor, marginBottom: "20px", fontFamily: "Cormorant Garamond, serif" }}>
              {t.manageUsers}
            </h2>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: cardBg }}>
                  <th style={thStyle}>{t.id}</th>
                  <th style={thStyle}>{t.name}</th>
                  <th style={thStyle}>{t.email}</th>
                  <th style={thStyle}>{t.roleLabel}</th>
                  <th style={thStyle}>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ background: i % 2 === 0 ? rowEven : rowOdd }}>
                    <td style={tdStyle}>{u.id}</td>
                    <td style={tdStyle}>{u.name || u.NAME}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "3px 10px", borderRadius: "2px",
                        background: u.role === "admin" ? "rgba(201,168,76,0.15)" : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                        color: u.role === "admin" ? "#C9A84C" : grayColor,
                        fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase",
                        border: `1px solid ${u.role === "admin" ? "rgba(201,168,76,0.3)" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {u.id !== user?.id && (
                        <button onClick={() => deleteUser(u.id)} style={{
                          padding: "6px 16px", background: "transparent",
                          color: "#E57373", border: "1px solid rgba(229,115,115,0.3)",
                          borderRadius: "2px", cursor: "pointer", fontSize: "10px",
                          letterSpacing: "1px", textTransform: "uppercase",
                          fontFamily: "Montserrat, sans-serif",
                        }}>
                          {t.delete}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "300", color: textColor, fontFamily: "Cormorant Garamond, serif", margin: 0 }}>
                {t.manageProducts}
              </h2>
              <button onClick={openAddProduct} style={{
                padding: "10px 24px", background: "rgba(201,168,76,0.1)",
                color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: "2px", cursor: "pointer", fontSize: "10px",
                letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Montserrat, sans-serif",
              }}>
                {t.addProduct}
              </button>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: cardBg }}>
                  <th style={thStyle}>{t.id}</th>
                  <th style={thStyle}>{t.nameLabel}</th>
                  <th style={thStyle}>{t.priceLabel}</th>
                  <th style={thStyle}>{t.stockLabel}</th>
                  <th style={thStyle}>{t.categoryLabel}</th>
                  <th style={thStyle}>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? rowEven : rowOdd }}>
                    <td style={tdStyle}>{p.id}</td>
                    <td style={tdStyle}>{p.name || p.NAME}</td>
                    <td style={{ ...tdStyle, color: "#C9A84C" }}>€{p.price}</td>
                    <td style={tdStyle}>{p.stock}</td>
                    <td style={tdStyle}>{p.category || "—"}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => openEditProduct(p)} style={{
                          padding: "6px 16px", background: "transparent",
                          color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)",
                          borderRadius: "2px", cursor: "pointer", fontSize: "10px",
                          letterSpacing: "1px", textTransform: "uppercase", fontFamily: "Montserrat, sans-serif",
                        }}>
                          {t.edit}
                        </button>
                        <button onClick={() => deleteProduct(p.id)} style={{
                          padding: "6px 16px", background: "transparent",
                          color: "#E57373", border: "1px solid rgba(229,115,115,0.3)",
                          borderRadius: "2px", cursor: "pointer", fontSize: "10px",
                          letterSpacing: "1px", textTransform: "uppercase", fontFamily: "Montserrat, sans-serif",
                        }}>
                          {t.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: modalBg, border: `1px solid ${borderColor}`, borderRadius: "4px", padding: "40px", width: "480px", maxWidth: "90vw" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "300", color: textColor, marginBottom: "24px", fontFamily: "Cormorant Garamond, serif", borderBottom: `1px solid ${borderColor}`, paddingBottom: "16px" }}>
              {modalType === "editProduct" ? t.editProduct : t.addNewProduct}
            </h2>

            {[
              { label: t.nameLabel, key: "name", type: "text", required: true },
              { label: t.priceLabel, key: "price", type: "number", required: true },
              { label: t.categoryLabel, key: "category", type: "text" },
              { label: t.stockLabel, key: "stock", type: "number" },
              { label: t.descriptionLabel, key: "description", type: "text" },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "10px", letterSpacing: "2px", color: grayColor, textTransform: "uppercase", marginBottom: "6px" }}>
                  {field.label} {field.required && <span style={{ color: "#C9A84C" }}>*</span>}
                </label>
                <input
                  type={field.type}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: inputBg,
                    border: !formData[field.key] && field.required ? "1px solid rgba(229,115,115,0.5)" : `1px solid ${borderColor}`,
                    borderRadius: "2px", color: textColor,
                    fontFamily: "Montserrat, sans-serif", fontSize: "13px",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
                {!formData[field.key] && field.required && (
                  <div style={{ color: "#E57373", fontSize: "11px", marginTop: "4px" }}>
                    {field.label} {t.required}!
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleSaveProduct} style={{
                flex: 1, padding: "14px", background: "rgba(201,168,76,0.15)",
                color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: "2px", cursor: "pointer", fontSize: "10px",
                letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Montserrat, sans-serif",
              }}>
                {t.save}
              </button>
              <button onClick={closeModal} style={{
                flex: 1, padding: "14px", background: "transparent",
                color: grayColor, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                borderRadius: "2px", cursor: "pointer", fontSize: "10px",
                letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Montserrat, sans-serif",
              }}>
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;