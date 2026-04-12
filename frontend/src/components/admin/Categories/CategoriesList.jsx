import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { Link } from "react-router-dom";
import "../../../styles/admin.css";

export default function CategoriesList() {
  const [categories, setCategories] = useState([]);

  const loadData = async () => {
    try {
      const res = await axiosInstance.get("/admin/categories");
      const sortedData = res.data.sort((a, b) => a.id - b.id);
      setCategories(sortedData);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteCategory = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    try {
      await axiosInstance.delete(`/admin/categories/${id}`);

      // 🚀 Không cần load lại trang — chỉ cập nhật state
      setCategories(categories.filter(c => c.id !== id));

    } catch (error) {
      alert("Xóa thất bại. Kiểm tra lại server!");
      console.error(error);
    }
  };

  return (
    <div className="admin-container">
      <div className="header-between">
        <h2>📦 Quản lý Danh mục</h2>
        <Link to="/admin/categories/create" className="btn btn-primary">
          + Thêm Category
        </Link>
      </div>

      <table className="table admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Hình ảnh</th>
            <th>Tên Category</th>
            <th>Slug</th>
            <th width="140px">Action</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="thumb-img" />
                ) : (
                  <span style={{ fontSize: "12px", opacity: 0.5 }}>—</span>
                )}
              </td>
              <td>{c.name}</td>
              <td>{c.slug}</td>
              <td>
                <Link
                  to={`/admin/categories/edit/${c.id}`}
                  className="btn btn-warning btn-sm"
                >
                  Sửa
                </Link>
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="btn btn-danger btn-sm"
                  style={{ marginLeft: "5px" }}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}

          {categories.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
