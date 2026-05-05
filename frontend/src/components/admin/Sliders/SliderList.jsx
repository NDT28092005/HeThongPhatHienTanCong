import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import { Link } from "react-router-dom";
import { Image, Plus, Search, Edit2, Trash, Layers } from "lucide-react";

export default function SliderList() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadSliders = () => {
    axiosInstance.get("/admin/sliders")
      .then(res => {
        const responseData = res.data;
        setSliders(Array.isArray(responseData) ? responseData : (responseData.data ?? []));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setSliders([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSliders();
  }, []);

  const deleteSlider = async (id) => {
    if (!window.confirm("Xóa slider này?")) return;
    try {
      await axiosInstance.delete(`/admin/sliders/${id}`);
      setSliders(sliders.filter(slider => slider.id !== id));
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const filteredSliders = sliders.filter(s =>
    s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.redirect_url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-info">
          <div className="header-icon" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }}>
            <Layers size={24} />
          </div>
          <div>
            <h1>Quản lý Sliders</h1>
            <p>Tổng cộng {sliders.length} slider</p>
          </div>
        </div>
        <Link to="/admin/sliders/create" className="btn btn-success">
          <Plus size={20} />
          Thêm slider
        </Link>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm slider..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <h3><Layers size={20} /> Danh sách sliders</h3>
        </div>

        {filteredSliders.length === 0 ? (
          <div className="empty-state">
            <Layers size={60} />
            <h4>Không tìm thấy slider</h4>
            <p>Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "140px" }}>Hình ảnh</th>
                <th>Tiêu đề</th>
                <th>Link</th>
                <th style={{ width: "80px" }}>Thứ tự</th>
                <th style={{ width: "150px" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredSliders.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.title} className="slider-thumb" />
                    ) : (
                      <div className="no-image"><Image size={24} /></div>
                    )}
                  </td>
                  <td><span className="slider-title">{s.title || "—"}</span></td>
                  <td>
                    <a href={s.redirect_url} target="_blank" rel="noopener noreferrer" className="slider-link">
                      {s.redirect_url || "—"}
                    </a>
                  </td>
                  <td>
                    <span className="order-badge">{s.order}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/admin/sliders/edit/${s.id}`} className="btn btn-sm btn-info" title="Sửa">
                        <Edit2 size={16} />
                      </Link>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteSlider(s.id)} title="Xóa">
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .slider-thumb {
          width: 120px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid var(--admin-border);
        }

        .slider-title {
          font-weight: 500;
          color: var(--admin-text-primary);
        }

        .slider-link {
          color: #6366f1;
          text-decoration: none;
          font-size: 0.85rem;
          word-break: break-all;
          transition: color 0.3s;
        }

        .slider-link:hover {
          color: #8b5cf6;
          text-decoration: underline;
        }

        .order-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          padding: 4px 10px;
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
          border-radius: 6px;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .no-image {
          width: 50px;
          height: 50px;
          background: var(--admin-bg-hover);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--admin-text-muted);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          color: var(--admin-text-secondary);
        }

        .loading-container .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--admin-border);
          border-top-color: var(--admin-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
