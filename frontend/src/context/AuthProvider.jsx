import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import axiosInstance from "../api/axios";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.role === 'admin' || parsedUser.isAdmin) {
            setUser({ ...parsedUser, isAdmin: true });
            setLoading(false);
            return;
          }
          setUser(parsedUser);
        } catch {
          localStorage.removeItem("user");
        }
      }

      if (!token) {
        setLoading(false);
        return;
      }

      setToken(token);

      try {
        const adminRes = await axiosInstance.get("/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (adminRes.data?.admin) {
          const adminUser = { ...adminRes.data.admin, isAdmin: true };
          setUser(adminUser);
          localStorage.setItem("user", JSON.stringify(adminUser));
          setLoading(false);
          return;
        }
      } catch {
        // Not admin, continue to user check
      }

      try {
        const userRes = await axiosInstance.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = userRes.data;
        if (data.user) {
          if (data.user.avatar && !data.user.avatar.startsWith("http")) {
            const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
            data.user.avatar = `${baseUrl}/storage/${data.user.avatar}`;
          }
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setToken(null);
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};