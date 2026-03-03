import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/api"; // use your API instance that attaches token

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app startup, load user from backend
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api().get("/auth/me");
        setUser(res.data); // authoritative user info
      } catch (err) {
        console.warn("Auth token expired or invalid, logging out");
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Signup
  const signup = async (name, email, password) => {
    const resp = await api().post("/auth/signup", { name, email, password });
    return resp.data;
  };

  // Login
  const login = async (email, password) => {
    const resp = await api().post("/auth/login", { email, password });
    const { access_token, user } = resp.data;

    setUser(user);
    localStorage.setItem("token", access_token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
