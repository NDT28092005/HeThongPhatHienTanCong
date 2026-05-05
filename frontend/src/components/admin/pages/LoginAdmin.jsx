import { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { Shield, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function LoginAdmin() {
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/admin/login", formData);
      const data = res.data;

      if (res.status === 200 || res.status === 201) {
        const adminData = { ...data.admin, isAdmin: true };
        setUser(adminData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.admin));
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Lỗi kết nối máy chủ!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-admin-page">
      <div className="login-admin-container">
        {/* Left Side - Branding */}
        <div className="login-admin-brand">
          <div className="brand-content">
            <div className="brand-icon">
              <Shield size={80} />
            </div>
            <h1>AdminShield</h1>
            <p>Hệ thống quản trị & bảo mật</p>
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-check">&#10003;</span>
                <span>Quản lý đơn hàng</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">&#10003;</span>
                <span>Quản lý sản phẩm</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">&#10003;</span>
                <span>Theo dõi tấn công</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">&#10003;</span>
                <span>Bảo mật nâng cao</span>
              </div>
            </div>
          </div>
          <div className="brand-decoration">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-admin-form">
          <div className="form-container">
            <div className="form-header">
              <h2>Đăng nhập Admin</h2>
              <p>Vui lòng nhập thông tin để tiếp tục</p>
            </div>

            {error && (
              <div className="error-alert">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">
                  <Mail size={18} />
                  Email
                </label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={18} />
                  Mật khẩu
                </label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    <LogIn size={20} />
                    Đăng nhập
                  </>
                )}
              </button>
            </form>

            <div className="form-footer">
              <a href="/" className="back-home">
                &larr; Quay lại trang chủ
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-admin-page {
          min-height: 100vh;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-admin-container {
          display: flex;
          max-width: 1000px;
          width: 100%;
          background: #1e293b;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        /* Brand Side */
        .login-admin-brand {
          flex: 1;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .brand-content {
          position: relative;
          z-index: 1;
          text-align: center;
          color: white;
        }

        .brand-icon {
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .login-admin-brand h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .login-admin-brand > .brand-content > p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 40px;
        }

        .brand-features {
          text-align: left;
          display: inline-block;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 1rem;
        }

        .feature-check {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .brand-decoration {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
        }

        .circle-1 {
          width: 300px;
          height: 300px;
          top: -100px;
          right: -100px;
        }

        .circle-2 {
          width: 200px;
          height: 200px;
          bottom: -50px;
          left: -50px;
        }

        .circle-3 {
          width: 150px;
          height: 150px;
          bottom: 100px;
          right: 50px;
        }

        /* Form Side */
        .login-admin-form {
          flex: 1;
          padding: 60px 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-container {
          width: 100%;
          max-width: 360px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .form-header h2 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 8px;
        }

        .form-header p {
          color: #94a3b8;
          font-size: 0.95rem;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 24px;
          font-size: 0.9rem;
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
          color: #f8fafc;
          font-size: 0.9rem;
        }

        .input-wrapper {
          position: relative;
        }

        .form-control {
          width: 100%;
          padding: 14px 16px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 10px;
          color: #f8fafc;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .form-control:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .form-control::placeholder {
          color: #64748b;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          transition: color 0.3s;
        }

        .toggle-password:hover {
          color: #94a3b8;
        }

        .btn-login {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
          margin-top: 8px;
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }

        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .form-footer {
          text-align: center;
          margin-top: 24px;
        }

        .back-home {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s;
        }

        .back-home:hover {
          color: #6366f1;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .login-admin-container {
            flex-direction: column;
          }

          .login-admin-brand {
            padding: 40px 30px;
          }

          .login-admin-brand h1 {
            font-size: 2rem;
          }

          .login-admin-form {
            padding: 40px 30px;
          }
        }
      `}</style>
    </div>
  );
}
