import { useState, useContext } from "react";
import { register } from "../../../api/auth";
import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../../../context/AuthContext";
import axiosInstance from "../../../api/axios";
import "../../../styles/register.css";
import { Link } from "react-router-dom";

function Register() {
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (form.password !== form.password_confirmation) {
      setMessage("Mật khẩu xác nhận không khớp!");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });
      setMessage(res.data.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
      setMessageType("success");
      setForm({ name: "", email: "", password: "", password_confirmation: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi máy chủ, vui lòng thử lại.";
      setMessage(msg);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký / đăng nhập bằng Google
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axiosInstance.post("/auth/google/callback", {
        token: credentialResponse.credential,
      });

      if (res.data.status) {
        setUser(res.data.user);
        localStorage.setItem("token", res.data.token);
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đăng nhập bằng Google!");
    }
  };

  const handleGoogleError = () => {
    alert("Không thể kết nối Google, vui lòng thử lại!");
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h2>Đăng ký tài khoản</h2>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-container">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Tên hiển thị"
                  value={form.name}
                  required
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-container">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  required
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-container">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  value={form.password}
                  required
                  minLength={6}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-container">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={form.password_confirmation}
                  required
                  minLength={6}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>

          {message && (
            <div className={`register-message ${messageType}`}>
              {message}
            </div>
          )}

          <div className="register-divider">
            <span>hoặc đăng ký nhanh bằng</span>
          </div>

          <div className="register-social">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          </div>

          <div className="login-link">
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;