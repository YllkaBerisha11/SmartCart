import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

  :root {
    --gold: #C9A84C;
    --gold-light: #E8D5A3;
    --black: #0A0A0A;
    --dark: #111111;
    --dark2: #1A1A1A;
    --white: #F5F0E8;
    --gray: #888880;
  }

  .products-root {
    min-height: 100vh;
    background: var(--black);
    font-family: 'Montserrat', sans-serif;
    color: var(--white);
    padding-top: 80px;
  }

  .products-hero {
    padding: 80px 60px 60px;
    background: var(--dark);
    border-bottom: 1px solid rgba(201,168,76,0.12);
    position: relative;
    overflow: hidden;
  }

  .products-hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 80% 50%, rgba(201,168,76,0.05) 0%, transparent 60%);
  }

  .products-hero-label {
    font-size: 10px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 500;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative; z-index: 1;
  }

  .products-hero-label::before {
    content: '';
    width: 30px; height: 1px;
    background: var(--gold); opacity: 0.5;
  }

  .products-hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 300;
    color: var(--white);
    line-height: 1;
    position: relative; z-index: 1;
  }

  .products-hero-title em { font-style: italic; color: var(--gold); }

  .products-controls {
    padding: 28px 60px;
    background: var(--dark);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    border-bottom: 1px solid rgba(201,168,76,0.08);
    position: sticky;
    top: 80px;
    z-index: 10;
    backdrop-filter: blur(10px);
  }

  .search-wrap {
    position: relative;
    flex: 1;
    max-width: 360px;
  }

  .search-input {
    width: 100%;
    padding: 11px 16px 11px 40px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.18);
    border-radius: 2px;
    color: var(--white);
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    font-weight: 300;
    outline: none;
    transition: border-color 0.3s;
    box-sizing: border-box;
  }

  .search-input::placeholder { color: rgba(245,240,232,0.22); }
  .search-input:focus { border-color: rgba(201,168,76,0.5); }

  .search-icon {
    position: absolute;
    left: 13px; top: 50%;
    transform: translateY(-50%);
    color: var(--gold);
    font-size: 14px;
    opacity: 0.5;
  }

  .products-count {
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--gray);
    font-weight: 300;
    white-space: nowrap;
  }

  .products-count span { color: var(--gold); font-weight: 500; }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 28px;
    padding: 52px 60px;
    max-width: 1400px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .product-card {
    background: var(--dark);
    border-radius: 6px;
    border: 1px solid rgba(201,168,76,0.08);
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    cursor: pointer;
  }

  .product-card:hover {
    border-color: rgba(201,168,76,0.3);
    transform: translateY(-6px);
    box-shadow: 0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.1);
  }

  .product-image {
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    transition: filter 0.4s ease;
  }

  .product-initial {
    font-family: 'Cormorant Garamond', serif;
    font-size: 80px;
    font-weight: 300;
    color: rgba(255,255,255,0.08);
    line-height: 1;
    transition: transform 0.5s ease, color 0.4s ease;
    user-select: none;
  }

  .product-card:hover .product-initial {
    transform: scale(1.1);
    color: rgba(255,255,255,0.12);
  }

  .product-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.35s ease;
  }

  .product-card:hover .product-overlay { opacity: 1; }

  .overlay-btn {
    padding: 13px 32px;
    background: var(--gold);
    color: var(--black);
    border: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 2px;
    transform: translateY(12px);
    transition: all 0.35s ease;
  }

  .product-card:hover .overlay-btn { transform: translateY(0); }
  .overlay-btn:hover { background: var(--gold-light); }

  .product-info {
    padding: 24px 24px 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .product-category {
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 500;
    opacity: 0.7;
  }

  .product-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 400;
    color: var(--white);
    line-height: 1.2;
  }

  .product-desc {
    font-size: 12px;
    color: var(--gray);
    font-weight: 300;
    line-height: 1.7;
    flex: 1;
  }

  .product-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid rgba(201,168,76,0.08);
    margin-top: 8px;
  }

  .product-price {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px;
    font-weight: 300;
    color: var(--gold);
    line-height: 1;
  }

  .add-btn {
    padding: 9px 18px;
    background: transparent;
    border: 1px solid rgba(201,168,76,0.35);
    border-radius: 2px;
    color: var(--gold);
    font-family: 'Montserrat', sans-serif;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
  }

  .add-btn:hover, .add-btn.added {
    background: var(--gold);
    color: var(--black);
    border-color: var(--gold);
  }

  .loading-wrap {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  .loading-ring {
    width: 44px; height: 44px;
    border: 1px solid rgba(201,168,76,0.15);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .loading-text {
    font-size: 10px;
    letter-spacing: 5px;
    color: var(--gray);
    text-transform: uppercase;
  }

  .empty-wrap {
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .empty-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 300;
    color: var(--gray);
  }

  .toast {
    position: fixed;
    bottom: 32px; right: 32px;
    background: var(--dark2);
    border: 1px solid rgba(201,168,76,0.25);
    border-left: 3px solid var(--gold);
    padding: 14px 22px;
    font-size: 12px;
    color: var(--white);
    font-weight: 300;
    z-index: 9999;
    border-radius: 3px;
    animation: toastIn 0.3s ease;
    letter-spacing: 0.5px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 900px) {
    .products-hero { padding: 60px 24px 40px; }
    .products-controls { padding: 20px 24px; top: 80px; }
    .products-grid { padding: 32px 24px; gap: 20px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
  }
`;

const cardColors = [
  "#1C1008",
  "#081C10",
  "#08101C",
  "#1C0808",
  "#0F0C18",
  "#181208",
  "#0C1818",
  "#180C18",
  "#101810",
  "#181010",
];

const getProductCategory = (name) => {
  const n = name.toLowerCase();
  if (n.includes("headphone") || n.includes("audio") || n.includes("speaker")) return "Audio";
  if (n.includes("watch")) return "Tech";
  if (n.includes("shoe") || n.includes("sneaker") || n.includes("running")) return "Fashion";
  if (n.includes("wallet")) return "Accessories";
  if (n.includes("sunglass")) return "Eyewear";
  if (n.includes("perfume") || n.includes("fragrance")) return "Lifestyle";
  if (n.includes("backpack") || n.includes("bag")) return "Accessories";
  if (n.includes("coffee")) return "Home";
  return "Premium";
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [addedIds, setAddedIds] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then(res => { setProducts(res.data); setFiltered(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    ));
  }, [search, products]);

  const handleAddToCart = (product) => {
    addToCart({ id: product.id, name: product.name, price: parseFloat(product.price) });
    setAddedIds(prev => [...prev, product.id]);
    setToast(`${product.name} added to cart`);
    setTimeout(() => setToast(""), 2500);
    setTimeout(() => setAddedIds(prev => prev.filter(id => id !== product.id)), 2000);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="products-root">

        <div className="products-hero">
          <div className="products-hero-bg" />
          <div className="products-hero-label">SmartCart Collection</div>
          <h1 className="products-hero-title">Our <em>Premium</em><br />Products</h1>
        </div>

        <div className="products-controls">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="products-count">
            Showing <span>{filtered.length}</span> {filtered.length === 1 ? "product" : "products"}
          </div>
        </div>

        {loading ? (
          <div className="loading-wrap">
            <div className="loading-ring" />
            <div className="loading-text">Loading Collection</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-wrap">
            <div className="empty-text">No products found</div>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map((product, i) => (
              <div key={product.id} className="product-card">
                <div
                  className="product-image"
                  style={{ backgroundColor: cardColors[i % cardColors.length] }}
                >
                  <div className="product-initial">
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="product-overlay">
                    <button className="overlay-btn" onClick={() => handleAddToCart(product)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
                <div className="product-info">
                  <div className="product-category">{getProductCategory(product.name)}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">{product.description || "Premium quality product"}</p>
                  <div className="product-footer">
                    <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>
                    <button
                      className={`add-btn ${addedIds.includes(product.id) ? "added" : ""}`}
                      onClick={() => handleAddToCart(product)}
                    >
                      {addedIds.includes(product.id) ? "✓ Added" : "+ Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {toast && <div className="toast">✦ {toast}</div>}
      </div>
    </>
  );
}