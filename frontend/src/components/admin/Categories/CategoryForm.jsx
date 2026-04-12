import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";

export default function CategoryForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);    // ✅ Preview ảnh
  const [imageFile, setImageFile] = useState(null);          // ✅ Ảnh upload

  useEffect(() => {
    if (mode === "edit") {
      axiosInstance.get(`/admin/categories/${id}`)
        .then(res => {
          setName(res.data.name);
          setImagePreview(res.data.image_url); // ✅ Load image cũ
        })
        .catch(err => console.error(err));
    }
  }, [id, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Tên danh mục không được để trống!");
      return;
    }

    let formData = new FormData();
    formData.append("name", name);

    if (imageFile) formData.append("image", imageFile);

    try {
      if (mode === "edit") {
        formData.append("_method", "PUT");  // ✅ báo cho Laravel hiểu đây là PUT

        await axiosInstance.post(`/admin/categories/${id}`, formData);
      } else {
        await axiosInstance.post("/admin/categories", formData);
      }

      navigate("/admin/categories");
    } catch (error) {
      console.error("🔥 Lỗi khi lưu:", error.response?.data || error);
      alert("Lỗi lưu dữ liệu. Kiểm tra server!");
    }
  };


  return (
    <div className="admin-container">
      <h2>{mode === "edit" ? "✏️ Sửa Category" : "➕ Thêm Category"}</h2>

      <form onSubmit={handleSubmit} className="admin-form">

        {/* Name */}
        <label>Tên Category</label>
        <input
          type="text"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên category..."
        />

        {/* Image */}
        <label>Hình ảnh (tùy chọn)</label>
        <input
          type="file"
          className="input"
          accept="image/*"
          onChange={(e) => {
            setImageFile(e.target.files[0]);
            setImagePreview(URL.createObjectURL(e.target.files[0])); // ✅ Show preview
          }}
        />

        {/* Preview image */}
        {imagePreview && (
          <img src={imagePreview} alt="preview"
            style={{ width: "140px", borderRadius: "6px", marginTop: "10px" }}
          />
        )}

        <div style={{ marginTop: "20px" }}>
          <button type="submit" className="btn btn-primary">
            {mode === "edit" ? "Cập nhật" : "Tạo mới"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="btn btn-secondary"
            style={{ marginLeft: "8px" }}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
