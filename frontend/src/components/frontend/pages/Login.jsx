import { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axiosInstance from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Leaf, Sparkles } from 'lucide-react';
import "../../../styles/login.css"
export default function Login() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axiosInstance.post('/login', formData);
      const data = res.data;

      if (data.user) {
        // Format avatar URL if needed
        const userData = { ...data.user };
        if (userData.avatar && !userData.avatar.startsWith("http")) {
          const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
          userData.avatar = `${baseUrl}/storage/${userData.avatar}`;
        }

        // 🟢 LƯU USER + TOKEN VÀO LOCAL STORAGE
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set user trong context
        setUser(userData);
        
        // Dispatch custom event để Header sync
        window.dispatchEvent(new Event('userUpdated'));

        alert('Đăng nhập thành công!');
        navigate('/');
      } else {
        alert('Sai thông tin đăng nhập');
      }
    } catch (err) {
      alert('Đã xảy ra lỗi khi đăng nhập', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/auth/google/callback', {
        token: credentialResponse.credential,
      });

      const { user, token } = res.data;
      
      // Format avatar URL if needed
      const userData = { ...user };
      if (userData.avatar && !userData.avatar.startsWith("http")) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
        userData.avatar = `${baseUrl}/storage/${userData.avatar}`;
      }

      // 🟢 LƯU USER + TOKEN VÀO LOCAL STORAGE
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set user trong context
      setUser(userData);
      
      // Dispatch custom event để Header sync
      window.dispatchEvent(new Event('userUpdated'));

      alert(`Đăng nhập Google thành công!`);
      navigate('/');
    } catch (err) {
      alert('Đăng nhập Google thất bại', err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* === THAY ĐỔI: TÁCH LOGO VÀ TIÊU ĐỀ === */}
          <div className="login-header">
            <div className="logo-container">
              <Leaf size={40} />
              <span>Boostea</span>
            </div>
            <h2>Chào mừng trở lại</h2>
          </div>

          <p className="login-subtitle">Đăng nhập để tiếp tục trải nghiệm</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <div className="input-container">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="Email của bạn" style={{ paddingLeft: "50px" }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-container">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{ paddingLeft: "50px" }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="/forgot-password" className="forgot-password">
                Quên mật khẩu?
              </a>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <div className="divider">
            <span>Hoặc</span>
          </div>

          <div className="social-login">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert('Đăng nhập Google thất bại')}
              text="continue_with"
              shape="rectangular"
              theme="filled_blue"
              size="large"
            />
          </div>

          <div className="register-link">
            <p>
              Bạn chưa có tài khoản?{' '}
              <a href="/register">
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>

        <div className="decoration">
          <Sparkles className="sparkle sparkle-1" size={20} />
          <Sparkles className="sparkle sparkle-2" size={16} />
          <Sparkles className="sparkle sparkle-3" size={24} />
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      </div>
    </div>
  );
}