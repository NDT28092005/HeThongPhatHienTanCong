import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import TestimonialForm from "./TestimonialForm";
import { MessageSquare, Plus, Star, Edit2, Trash, User } from "lucide-react";

const TestimonialsList = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("/admin/testimonials");
      const responseData = res.data;
      setTestimonials(Array.isArray(responseData) ? responseData : (responseData.data ?? []));
    } catch (err) {
      console.error(err);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa?")) return;
    try {
      await axiosInstance.delete(`/admin/testimonials/${id}`);
      setTestimonials(testimonials.filter((item) => item.id !== id));
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < rating ? "#f59e0b" : "transparent"}
        color={i < rating ? "#f59e0b" : "#64748b"}
      />
    ));
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
          <div className="header-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <h1>Quản lý Đánh giá</h1>
            <p>Tổng cộng {testimonials.length} đánh giá</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setEditingTestimonial({})}>
          <Plus size={20} />
          Thêm đánh giá
        </button>
      </div>

      {/* Form Modal */}
      {editingTestimonial && (
        <div className="form-modal-overlay">
          <div className="form-modal">
            <TestimonialForm
              data={editingTestimonial}
              onSuccess={() => {
                fetchData();
                setEditingTestimonial(null);
              }}
              onCancel={() => setEditingTestimonial(null)}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <h3><MessageSquare size={20} /> Danh sách đánh giá</h3>
        </div>

        {testimonials.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={60} />
            <h4>Chưa có đánh giá nào</h4>
            <p>Thêm đánh giá mới để hiển thị tại đây</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "70px" }}>ID</th>
                <th style={{ width: "80px" }}>Avatar</th>
                <th>Tên</th>
                <th style={{ width: "120px" }}>Rating</th>
                <th>Nội dung</th>
                <th style={{ width: "150px" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t.id}>
                  <td><span className="badge badge-secondary">#{t.id}</span></td>
                  <td>
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt={t.name} className="avatar-thumb" />
                    ) : (
                      <div className="avatar-placeholder">
                        <User size={20} />
                      </div>
                    )}
                  </td>
                  <td><span className="testimonial-name">{t.name}</span></td>
                  <td>
                    <div className="rating-stars">
                      {renderStars(t.rating)}
                    </div>
                  </td>
                  <td>
                    <span className="testimonial-content">{t.content}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-info" onClick={() => setEditingTestimonial(t)} title="Sửa">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)} title="Xóa">
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
        .testimonial-name {
          font-weight: 500;
          color: var(--admin-text-primary);
        }

        .rating-stars {
          display: flex;
          gap: 2px;
        }

        .testimonial-content {
          max-width: 300px;
          display: inline-block;
          color: var(--admin-text-secondary);
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .avatar-thumb {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--admin-border);
        }

        .avatar-placeholder {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--admin-bg-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--admin-text-muted);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .form-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .form-modal {
          background: var(--admin-bg-card);
          border-radius: 16px;
          padding: 32px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
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
};

export default TestimonialsList;
