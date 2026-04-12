import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import axiosInstance from "../api/axios";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (token) {
      setToken(token);

      axiosInstance.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          const data = res.data;
          if (data.user) {
            if (data.user.avatar && !data.user.avatar.startsWith("http")) {
              const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
              data.user.avatar = `${baseUrl}/storage/${data.user.avatar}`;
            }
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        });
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};