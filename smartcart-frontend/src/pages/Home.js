import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --gold: #C9A84C;
    --gold-light: #E8D5A3;
    --gold-dark: #8B6914;
    --black: #0A0A0A;
    --dark: #111111;
    --dark2: #1A1A1A;
    --white: #F5F0E8;
    --gray: #888880;
  }

  .home-root {
    background: var(--black);
    min-height: 100vh;
    font-family: 'Montserrat', sans-serif;
    color: var(--white);
    overflow-x: hidden;
  }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: var(--black);
    overflow: hidden;
  }

  .hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 60% 50%, rgba(201,168,76,0.08) 0%, transparent 70%),
                radial-gradient(ellipse at 10% 80%, rgba(201,168,76,0.05) 0%, transparent 50%);
  }

  .hero-lines {
    position: absolute; inset: 0;
    background-image: 
      linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px);
    background-size: 80px 80px;
  }

  .hero-content {
    text-align: center;
    z-index: 2;
    padding: 40px 20px;
    animation: fadeUp 1.2s ease forwards;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hero-eyebrow {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 6px;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .hero-eyebrow::before, .hero-eyebrow::after {
    content: '';
    width: 40px;
    height: 1px;
    background: var(--gold);
    opacity: 0.6;
  }

  .hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(56px, 10vw, 120px);
    font-weight: 300;
    line-height: 0.9;
    color: var(--white);
    margin-bottom: 12px;
    letter-spacing: -2px;
  }

  .hero-title em {
    font-style: italic;
    color: var(--gold);
  }

  .hero-subtitle {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(18px, 3vw, 28px);
    font-weight: 300;
    font-style: italic;
    color: var(--gray);
    margin-bottom: 60px;
    letter-spacing: 1px;
  }

  .hero-actions {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn-primary {
    padding: 16px 48px;
    background: var(--gold);
    color: var(--black);
    border: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.1);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .btn-primary:hover::after { opacity: 1; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(201,168,76,0.3); }

  .btn-secondary {
    padding: 16px 48px;
    background: transparent;
    color: var(--white);
    border: 1px solid rgba(245,240,232,0.3);
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-secondary:hover {
    border-color: var(--gold);
    color: var(--gold);
    transform: translateY(-2px);
  }

  /* MARQUEE */
  .marquee-wrap {
    border-top: 1px solid rgba(201,168,76,0.2);
    border-bottom: 1px solid rgba(201,168,76,0.2);
    padding: 18px 0;
    overflow: hidden;
    background: var(--dark);
  }

  .marquee-track {
    display: flex;
    gap: 60px;
    animation: marquee 20s linear infinite;
    white-space: nowrap;
  }

  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  .marquee-item {
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .marquee-dot {
    width: 4px; height: 4px;
    background: var(--gold);
    border-radius: 50%;
    opacity: 0.5;
  }

  /* FEATURES */
  .features {
    padding: 120px 60px;
    background: var(--dark);
  }

  .section-header {
    text-align: center;
    margin-bottom: 80px;
  }

  .section-label {
    font-size: 10px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 500;
    margin-bottom: 20px;
    display: block;
  }

  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(36px, 5vw, 60px);
    font-weight: 300;
    color: var(--white);
    line-height: 1.1;
  }

  .section-title em {
    font-style: italic;
    color: var(--gold);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    background: var(--dark2);
    padding: 50px 40px;
    position: relative;
    overflow: hidden;
    transition: all 0.4s ease;
    cursor: default;
  }

  .feature-card::before {
    content: '';
    position: absolute;
    bottom: 0; left: 0;
    width: 100%; height: 2px;
    background: var(--gold);
    transform: scaleX(0);
    transition: transform 0.4s ease;
    transform-origin: left;
  }

  .feature-card:hover::before { transform: scaleX(1); }
  .feature-card:hover { background: #1E1E1E; }

  .feature-icon {
    font-size: 32px;
    margin-bottom: 28px;
    display: block;
  }

  .feature-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 400;
    color: var(--white);
    margin-bottom: 16px;
  }

  .feature-desc {
    font-size: 13px;
    line-height: 1.8;
    color: var(--gray);
    font-weight: 300;
  }

  /* STATS */
  .stats {
    padding: 100px 60px;
    background: var(--black);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .stat-item {
    text-align: center;
    padding: 60px 40px;
    border: 1px solid rgba(201,168,76,0.1);
    transition: border-color 0.3s;
  }

  .stat-item:hover { border-color: rgba(201,168,76,0.4); }

  .stat-number {
    font-family: 'Cormorant Garamond', serif;
    font-size: 72px;
    font-weight: 300;
    color: var(--gold);
    line-height: 1;
    margin-bottom: 12px;
  }

  .stat-label {
    font-size: 10px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--gray);
    font-weight: 500;
  }

  /* CTA */
  .cta {
    padding: 120px 60px;
    background: var(--dark);
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .cta-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%);
  }

  .cta-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(40px, 6vw, 80px);
    font-weight: 300;
    color: var(--white);
    margin-bottom: 24px;
    position: relative;
    z-index: 1;
  }

  .cta-title em { font-style: italic; color: var(--gold); }

  .cta-sub {
    font-size: 14px;
    color: var(--gray);
    margin-bottom: 50px;
    font-weight: 300;
    letter-spacing: 1px;
    position: relative;
    z-index: 1;
  }

  .cta-actions { position: relative; z-index: 1; display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }

  /* FOOTER */
  .footer {
    padding: 60px;
    background: var(--black);
    border-top: 1px solid rgba(201,168,76,0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: gap;
    gap: 20px;
  }

  .footer-brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 300;
    color: var(--gold);
    letter-spacing: 4px;
    text-transform: uppercase;
  }

  .footer-copy {
    font-size: 11px;
    color: var(--gray);
    letter-spacing: 2px;
  }

  @media (max-width: 768px) {
    .features, .cta { padding: 80px 24px; }
    .stats { padding: 60px 24px; }
    .footer { padding: 40px 24px; flex-direction: column; text-align: center; }
  }
`;

export default function Home() {
  const navigate = useNavigate();
  const [count, setCount] = useState({ products: 0, customers: 0, orders: 0 });

  useEffect(() => {
    const targets = { products: 500, customers: 12000, orders: 48000 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({
        products: Math.floor(targets.products * ease),
        customers: Math.floor(targets.customers * ease),
        orders: Math.floor(targets.orders * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const marqueeItems = ["Free Shipping", "Premium Quality", "Secure Payment", "24/7 Support", "Exclusive Collection", "Luxury Experience"];

  return (
    <>
      <style>{styles}</style>
      <div className="home-root">

        {/* HERO */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-lines" />
          <div className="hero-content">
            <div className="hero-eyebrow">Est. 2024 — SmartCart</div>
            <h1 className="hero-title">
              Shop <em>Beyond</em><br />Ordinary
            </h1>
            <p className="hero-subtitle">Where luxury meets convenience</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate("/products")}>
                Explore Collection
              </button>
              <button className="btn-secondary" onClick={() => navigate("/register")}>
                Join Now
              </button>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="marquee-item">
                {item} <span className="marquee-dot" />
              </span>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <section className="features">
          <div className="section-header">
            <span className="section-label">Why Choose Us</span>
            <h2 className="section-title">The <em>SmartCart</em><br />Difference</h2>
          </div>
          <div className="features-grid">
            {[
              { icon: "✦", title: "Curated Selection", desc: "Every product handpicked for quality, craftsmanship, and lasting value." },
              { icon: "◈", title: "Secure Checkout", desc: "Bank-grade encryption protects every transaction you make with us." },
              { icon: "⟡", title: "Swift Delivery", desc: "Express shipping ensures your orders arrive pristine and on time." },
              { icon: "◇", title: "Dedicated Support", desc: "Our concierge team is available around the clock for your needs." },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <span className="feature-icon" style={{ color: "var(--gold)" }}>{f.icon}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <div style={{ background: "var(--black)", padding: "0 60px" }}>
          <div className="stats">
            <div className="stat-item">
              <div className="stat-number">{count.products.toLocaleString()}+</div>
              <div className="stat-label">Premium Products</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{(count.customers / 1000).toFixed(0)}K+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{(count.orders / 1000).toFixed(0)}K+</div>
              <div className="stat-label">Orders Fulfilled</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <section className="cta">
          <div className="cta-bg" />
          <h2 className="cta-title">Ready to <em>Elevate</em><br />Your Shopping?</h2>
          <p className="cta-sub">Join thousands of discerning customers who trust SmartCart</p>
          <div className="cta-actions">
            <button className="btn-primary" onClick={() => navigate("/products")}>
              Shop Now
            </button>
            <button className="btn-secondary" onClick={() => navigate("/register")}>
              Create Account
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-brand">SmartCart</div>
          <div className="footer-copy">© 2024 SmartCart. All rights reserved.</div>
        </footer>

      </div>
    </>
  );
}