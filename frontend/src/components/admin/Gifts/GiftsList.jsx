import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import { Gift, Plus, Search, Edit2, Trash, Star, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GiftsList() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/gifts?per_page=100");
      const responseData = res.data;
      setGifts(Array.isArray(responseData) ? responseData : (responseData.data || []));
    } catch (e) {
      console.error(e);
      setGifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Xóa gift này?")) return;
    try {
      await axiosInstance.delete(`/admin/gifts/${id}`);
      setGifts(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const filteredGifts = gifts.filter(gift =>
    gift.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

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
          <div className="header-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
            <Gift size={24} />
          </div>
          <div>
            <h1>Quản lý Quà tặng</h1>
            <p>Tổng cộng {gifts.length} quà tặng</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/admin/gifts/create")}>
          <Plus size={20} />
          Thêm quà tặng
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm quà tặng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <h3><Gift size={20} /> Danh sách quà tặng</h3>
        </div>

        {filteredGifts.length === 0 ? (
          <div className="empty-state">
            <Gift size={60} />
            <h4>Không tìm thấy quà tặng</h4>
            <p>Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>ID</th>
                <th style={{ width: "70px" }}>Ảnh</th>
                <th>Tên quà tặng</th>
                <th>Giá</th>
                <th>Nổi bật</th>
                <th style={{ width: "150px" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredGifts.map(g => (
                <tr key={g.id}>
                  <td><span className="badge badge-secondary">#{g.id}</span></td>
                  <td>
                    {g.image_url ? (
                      <img src={g.image_url} alt={g.name} className="thumb-img" />
                    ) : (
                      <div className="no-image"><Image size={24} /></div>
                    )}
                  </td>
                  <td><span className="gift-name">{g.name}</span></td>
                  <td><span className="price-tag">{formatPrice(g.price)}</span></td>
                  <td>
                    {g.featured ? (
                      <span className="badge badge-warning"><Star size={12} /> Featured</span>
                    ) : (
                      <span className="badge badge-secondary">—</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-info" onClick={() => navigate(`/admin/gifts/edit/${g.id}`)} title="Sửa">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(g.id)} title="Xóa">
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
        .gift-name {
          font-weight: 500;
          color: var(--admin-text-primary);
        }

        .price-tag {
          font-weight: 600;
          color: #f59e0b;
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
