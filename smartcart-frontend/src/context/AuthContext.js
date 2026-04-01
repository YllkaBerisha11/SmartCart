import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ngarko token-in nga localStorage kur hapet app-i
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        // Kontrollo nëse token-i ka skaduar
        if (payload.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser({ id: payload.id, email: payload.email, name: payload.name });
        } else {
          // Token skadoi, pastro
          localStorage.removeItem("token");
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (tokenFromServer) => {
    localStorage.setItem("token", tokenFromServer);
    const payload = JSON.parse(atob(tokenFromServer.split(".")[1]));
    setToken(tokenFromServer);
    setUser({ id: payload.id, email: payload.email, name: payload.name });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook për përdorim të lehtë
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth duhet të përdoret brenda AuthProvider");
  return context;
}