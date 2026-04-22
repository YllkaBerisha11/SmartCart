import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // ✅ MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // "editUser" | "editProduct" | "addProduct"
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

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
      toast.success("✅ Të dhënat u ngarkuan!");
    } catch (err) {
      toast.error("❌ Gabim gjatë ngarkimit!");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("A jeni i sigurt?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/users/${id}`, { headers });
      setUsers(users.filter((u) => u.id !== id));
      toast.success("✅ Përdoruesi u fshi!");
    } catch (err) {
      toast.error("❌ Gabim gjatë fshirjes!");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("A jeni i sigurt?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/products/${id}`, { headers });
      setProducts(products.filter((p) => p.id !== id));
      toast.success("✅ Produkti u fshi!");
    } catch (err) {
      toast.error("❌ Gabim gjatë fshirjes!");
    }
  };

  // ✅ MODAL FUNCTIONS
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
    // ✅ DYNAMIC FORM VALIDATION
    if (!formData.name || formData.name.length < 2) {
      toast.error("❌ Emri duhet të ketë të paktën 2 karaktere!");
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error("❌ Çmimi duhet të jetë pozitiv!");
      return;
    }

    try {
      if (modalType === "editProduct") {
        await axios.put(
          `http://localhost:5000/api/v1/products/${selectedItem.id}`,
          formData,
          { headers }
        );
        setProducts(products.map((p) =>
          p.id === selectedItem.id ? { ...p, ...formData } : p
        ));
        toast.success("✅ Produkti u përditësua!");
      } else if (modalType === "addProduct") {
        const res = await axios.post(
          "http://localhost:5000/api/v1/products",
          formData,
          { headers }
        );
        setProducts([...products, res.data.data]);
        toast.success("✅ Produkti u shtua!");
      }
      closeModal();
    } catch (err) {
      toast.error("❌ Gabim gjatë ruajtjes!");
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A84C", fontSize: "14px", letterSpacing: "4px", textTransform: "uppercase" }}>Duke ngarkuar...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#F5F0E8", fontFamily: "Montserrat, sans-serif", paddingTop: "100px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px 40px" }}>

        <div style={{ marginBottom: "40px", borderBottom: "1px solid rgba(201,168,76,0.15)", paddingBottom: "24px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#C9A84C", marginBottom: "8px", textTransform: "uppercase" }}>SmartCart Admin</div>
          <h1 style={{ fontSize: "36px", fontWeight: "300", color: "#F5F0E8", margin: 0, fontFamily: "Cormorant Garamond, serif" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "#888880", fontSize: "12px", marginTop: "8px" }}>
            Mirë se vini, <strong style={{ color: "#C9A84C" }}>{user?.name}</strong> — Role: <strong style={{ color: "#C9A84C" }}>{user?.role}</strong>
          </p>
        </div>

        {/* STATS CARDS */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "40px" }}>
            {[
              { label: "Përdorues", value: stats.totalUsers, color: "#4CAF50", icon: "👥" },
              { label: "Produkte", value: stats.totalProducts, color: "#C9A84C", icon: "📦" },
              { label: "Orders", value: stats.totalOrders, color: "#FF9800", icon: "🛒" },
              { label: "Revenue", value: `€${Number(stats.totalRevenue).toFixed(2)}`, color: "#9C27B0", icon: "💰" },
            ].map((card, i) => (
              <div key={i} style={{
                background: "#111111",
                border: "1px solid rgba(201,168,76,0.12)",
                borderTop: `2px solid ${card.color}`,
                borderRadius: "4px",
                padding: "24px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>{card.icon}</div>
                <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#888880", textTransform: "uppercase", marginBottom: "8px" }}>{card.label}</div>
                <div style={{ fontSize: "32px", fontWeight: "300", color: card.color, fontFamily: "Cormorant Garamond, serif" }}>{card.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* TABS */}
        <div style={{ display: "flex", gap: "2px", marginBottom: "30px", borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
          {["overview", "users", "products"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "12px 24px",
              background: activeTab === tab ? "rgba(201,168,76,0.1)" : "transparent",
              color: activeTab === tab ? "#C9A84C" : "#888880",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #C9A84C" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "10px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontFamily: "Montserrat, sans-serif",
              transition: "all 0.3s",
            }}>
              {tab === "overview" ? "📊 Overview" : tab === "users" ? "👥 Users" : "📦 Products"}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && stats && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "300", color: "#F5F0E8", marginBottom: "20px", fontFamily: "Cormorant Garamond, serif" }}>Orders sipas statusit</h2>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: "#111" }}>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Numri</th>
                </tr>
              </thead>
              <tbody>
                {stats.ordersByStatus.map((s, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#111" : "#0A0A0A" }}>
                    <td style={tdStyle}>{s.status}</td>
                    <td style={tdStyle}>{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 style={{ fontSize: "18px", fontWeight: "300", color: "#F5F0E8", margin: "30px 0 20px", fontFamily: "Cormorant Garamond, serif" }}>🏆 Top 5 Produktet</h2>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: "#111" }}>
                  <th style={thStyle}>Produkti</th>
                  <th style={thStyle}>Total Shitur</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#111" : "#0A0A0A" }}>
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
            <h2 style={{ fontSize: "18px", fontWeight: "300", color: "#F5F0E8", marginBottom: "20px", fontFamily: "Cormorant Garamond, serif" }}>Menaxhimi i Përdoruesve</h2>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: "#111" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Emri</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Roli</th>
                  <th style={thStyle}>Veprime</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ background: i % 2 === 0 ? "#111" : "#0A0A0A" }}>
                    <td style={tdStyle}>{u.id}</td>
                    <td style={tdStyle}>{u.name || u.NAME}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "3px 10px", borderRadius: "2px",
                        background: u.role === "admin" ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)",
                        color: u.role === "admin" ? "#C9A84C" : "#888880",
                        fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase",
                        border: `1px solid ${u.role === "admin" ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.1)"}`,
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
                          Fshi
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
              <h2 style={{ fontSize: "18px", fontWeight: "300", color: "#F5F0E8", fontFamily: "Cormorant Garamond, serif", margin: 0 }}>Menaxhimi i Produkteve</h2>
              {/* ✅ SHTO PRODUKT BUTON */}
              <button onClick={openAddProduct} style={{
                padding: "10px 24px", background: "rgba(201,168,76,0.1)",
                color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: "2px", cursor: "pointer", fontSize: "10px",
                letterSpacing: "2px", textTransform: "uppercase",
                fontFamily: "Montserrat, sans-serif",
              }}>
                + Shto Produkt
              </button>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: "#111" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Emri</th>
                  <th style={thStyle}>Çmimi</th>
                  <th style={thStyle}>Stock</th>
                  <th style={thStyle}>Kategoria</th>
                  <th style={thStyle}>Veprime</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? "#111" : "#0A0A0A" }}>
                    <td style={tdStyle}>{p.id}</td>
                    <td style={tdStyle}>{p.name || p.NAME}</td>
                    <td style={{ ...tdStyle, color: "#C9A84C" }}>€{p.price}</td>
                    <td style={tdStyle}>{p.stock}</td>
                    <td style={tdStyle}>{p.category || "—"}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {/* ✅ EDIT BUTON — hap modal */}
                        <button onClick={() => openEditProduct(p)} style={{
                          padding: "6px 16px", background: "transparent",
                          color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)",
                          borderRadius: "2px", cursor: "pointer", fontSize: "10px",
                          letterSpacing: "1px", textTransform: "uppercase",
                          fontFamily: "Montserrat, sans-serif",
                        }}>
                          Edit
                        </button>
                        <button onClick={() => deleteProduct(p.id)} style={{
                          padding: "6px 16px", background: "transparent",
                          color: "#E57373", border: "1px solid rgba(229,115,115,0.3)",
                          borderRadius: "2px", cursor: "pointer", fontSize: "10px",
                          letterSpacing: "1px", textTransform: "uppercase",
                          fontFamily: "Montserrat, sans-serif",
                        }}>
                          Fshi
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

      {/* ✅ MODAL */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#111",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "4px",
            padding: "40px",
            width: "480px",
            maxWidth: "90vw",
          }}>
            <h2 style={{
              fontSize: "20px", fontWeight: "300",
              color: "#F5F0E8", marginBottom: "24px",
              fontFamily: "Cormorant Garamond, serif",
              borderBottom: "1px solid rgba(201,168,76,0.15)",
              paddingBottom: "16px"
            }}>
              {modalType === "editProduct" ? "✏️ Modifiko Produktin" : "➕ Shto Produkt të Ri"}
            </h2>

            {/* ✅ DYNAMIC FORM VALIDATION */}
            {[
              { label: "Emri", key: "name", type: "text", required: true },
              { label: "Çmimi (€)", key: "price", type: "number", required: true },
              { label: "Kategoria", key: "category", type: "text" },
              { label: "Stock", key: "stock", type: "number" },
              { label: "Përshkrimi", key: "description", type: "text" },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block", fontSize: "10px", letterSpacing: "2px",
                  color: "#888880", textTransform: "uppercase", marginBottom: "6px"
                }}>
                  {field.label} {field.required && <span style={{ color: "#C9A84C" }}>*</span>}
                </label>
                <input
                  type={field.type}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: "rgba(255,255,255,0.04)",
                    border: !formData[field.key] && field.required
                      ? "1px solid rgba(229,115,115,0.5)"
                      : "1px solid rgba(201,168,76,0.18)",
                    borderRadius: "2px", color: "#F5F0E8",
                    fontFamily: "Montserrat, sans-serif", fontSize: "13px",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
                {/* ✅ VALIDATION MESSAGE */}
                {!formData[field.key] && field.required && (
                  <div style={{ color: "#E57373", fontSize: "11px", marginTop: "4px" }}>
                    {field.label} është i detyrueshëm!
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleSaveProduct} style={{
                flex: 1, padding: "14px",
                background: "rgba(201,168,76,0.15)",
                color: "#C9A84C",
                border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: "2px", cursor: "pointer",
                fontSize: "10px", letterSpacing: "2px",
                textTransform: "uppercase",
                fontFamily: "Montserrat, sans-serif",
              }}>
                Ruaj
              </button>
              <button onClick={closeModal} style={{
                flex: 1, padding: "14px",
                background: "transparent",
                color: "#888880",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "2px", cursor: "pointer",
                fontSize: "10px", letterSpacing: "2px",
                textTransform: "uppercase",
                fontFamily: "Montserrat, sans-serif",
              }}>
                Anulo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  border: "1px solid rgba(201,168,76,0.1)",
};

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "10px",
  letterSpacing: "2px",
  color: "#888880",
  textTransform: "uppercase",
  borderBottom: "1px solid rgba(201,168,76,0.15)",
};

const tdStyle = {
  padding: "12px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  fontSize: "13px",
  color: "#F5F0E8",
};

export default AdminDashboard;