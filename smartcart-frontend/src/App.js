import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Products = React.lazy(() => import("./pages/Products"));
const Cart = React.lazy(() => import("./pages/Cart"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const ProductDetail = React.lazy(() => import("./pages/ProductDetail"));

const LoadingSpinner = () => (
  <div style={{
    minHeight: "100vh", background: "#0A0A0A",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexDirection: "column", gap: "20px"
  }}>
    <div style={{
      width: "44px", height: "44px",
      border: "1px solid rgba(201,168,76,0.15)",
      borderTop: "1px solid #C9A84C",
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <div style={{
      fontSize: "10px", letterSpacing: "5px",
      color: "#888880", textTransform: "uppercase",
      fontFamily: "Montserrat, sans-serif"
    }}>Loading...</div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Navbar />
              <ToastContainer position="top-right" autoClose={3000} />
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={
                    <PrivateRoute><Cart /></PrivateRoute>
                  }/>
                  <Route path="/admin" element={
                    <AdminRoute><AdminDashboard /></AdminRoute>
                  }/>
                </Routes>
              </Suspense>
            </Router>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;