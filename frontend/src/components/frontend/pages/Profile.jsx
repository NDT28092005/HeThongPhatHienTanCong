import React, { useContext, useState } from "react";
import axiosInstance from "../../../api/axios";
import { AuthContext } from "../../../context/AuthContext";
import { Camera, User, Save, CheckCircle } from "lucide-react";
import "../../../styles/profile.css";

export default function Profile() {
  const { user, setUser, token } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    name: user?.name || "",
    avatarPreview: user?.avatar || "",
  });

  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const f = new FormData();
      f.append("name", form.name);
      if (file) f.append("avatar", file);

      const res = await axiosInstance.post(
        "/user/update-profile",
        f,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage({ 
        type: 'success', 
        text: '✅ Cập nhật profile thành công!' 
      });
      
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: '❌ Đã có lỗi xảy ra, vui lòng thử lại!' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>Chỉnh sửa hồ sơ</h2>

      {message.text && (
        <div className={`${message.type}-message`}>
          {message.text}
        </div>
      )}

      <form className="profile-form" onSubmit={handleSubmit}>
        {/* Avatar */}
        <div className="profile-avatar">
          <img
            src={form.avatarPreview || "/default-avatar.png"}
            alt="Avatar"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setFile(file);
                setForm({ 
                  ...form, 
                  avatarPreview: URL.createObjectURL(file) 
                });
              }
            }}
          />
        </div>

        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">Họ và tên</label>
          <input
            id="name"
            className="profile-input"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nhập họ và tên của bạn"
            maxLength={50}
          />
          <div className="char-counter">
            {form.name.length}/50
          </div>
        </div>

        <button 
          type="submit" 
          className={`profile-btn ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? '' : (
            <>
              <Save size={18} style={{ marginRight: '8px' }} />
              Lưu thay đổi
            </>
          )}
        </button>
      </form>
    </div>
  );
}