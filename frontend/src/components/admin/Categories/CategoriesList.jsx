import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, FolderTree, Search, Edit2, Trash, Image } from "lucide-react";

export default function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      const res = await axiosInstance.get("/admin/categories");
      const responseData = res.data;
      const categoriesData = Array.isArray(responseData) ? responseData : (responseData.data ?? []);
      const sortedData = [...categoriesData].sort((a, b) => b.id - a.id);
      setCategories(sortedData);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteCategory = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    try {
      await axiosInstance.delete(`/admin/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      alert("Xóa thất bại. Kiểm tra lại server!");
      console.error(error);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="header-icon success">
            <FolderTree size={24} />
          </div>
          <div>
            <h1>Quản lý Danh mục</h1>
            <p>Tổng cộng {categories.length} danh mục</p>
          </div>
        </div>
        <Link to="/admin/categories/create" className="btn btn-success">
          <Plus size={20} />
          Thêm danh mục
        </Link>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm danh mục..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>
            <FolderTree size={20} />
            Danh sách danh mục
          </h3>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="empty-state">
            <FolderTree size={60} />
            <h4>Không tìm thấy danh mục</h4>
            <p>Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Hình ảnh</th>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Slug</th>
                <th style={{ width: "150px" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="thumb-img"
                      />
                    ) : (
                      <div className="no-image">
                        <Image size={24} />
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-secondary">#{cat.id}</span>
                  </td>
                  <td>
                    <span className="category-name">{cat.name}</span>
                  </td>
                  <td>
                    <code className="slug-code">{cat.slug}</code>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/admin/categories/edit/${cat.id}`}
                        className="btn btn-sm btn-info"
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteCategory(cat.id)}
                        title="Xóa"
                      >
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
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding: 24px;
          background: var(--admin-bg-card);
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius);
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-icon.success {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .header-icon.info {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .header-info h1 {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--admin-text-primary);
          margin: 0 0 4px 0;
        }

        .header-info p {
          font-size: 0.9rem;
          color: var(--admin-text-secondary);
          margin: 0;
        }

        .search-container {
          position: relative;
          margin-bottom: 20px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--admin-text-muted);
        }

        .search-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          background: var(--admin-bg-card);
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          color: var(--admin-text-primary);
          font-size: 0.95rem;
          transition: all 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--admin-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .search-input::placeholder {
          color: var(--admin-text-muted);
        }

        .category-name {
          font-weight: 500;
          color: var(--admin-text-primary);
        }

        .slug-code {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(99, 102, 241, 0.1);
          color: #818cf8;
          border-radius: 6px;
          font-size: 0.8rem;
          font-family: monospace;
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

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .header-info {
            flex-direction: column;
          }

          .action-buttons {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
