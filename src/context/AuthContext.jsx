import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext({
  isLogin: false,
  role: "",
  loading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  setIslogin: () => {},
  setRole: () => {},
});

export function AuthProvider({ children }) {
  const [isLogin, setIsLogin] = useState(false);
  const [role, setRole] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const data = await api.checkAuth();
      if (data.success && data.user) {
        setIsLogin(true);
        setRole(data.user.role || "");
        setUser(data.user);
      } else {
        setIsLogin(false);
        setRole("");
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsLogin(false);
      setRole("");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleAuthError = () => {
      setIsLogin(false);
      setRole("");
      setUser(null);
    };
    window.addEventListener("auth-error", handleAuthError);
    return () => window.removeEventListener("auth-error", handleAuthError);
  }, []);

  const login = async (type, creds) => {
    setLoading(true);
    let data;
    try {
      if (type === "admin") {
        data = await api.adminLogin(creds);
      } else if (type === "staff") {
        data = await api.staffLogin(creds);
      } else {
        data = await api.login(creds);
      }
      
      if (data.success) {
        await checkAuth();
      }
      return data;
    } catch (err) {
      console.error("Login request failed:", err);
      return { success: false, message: "Server connection failed." };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setIsLogin(false);
      setRole("");
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLogin,
        role,
        loading,
        user,
        login,
        logout,
        checkAuth,
        setIslogin: setIsLogin,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
