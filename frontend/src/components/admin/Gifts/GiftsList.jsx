import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import "../../../styles/admin.css";
import { useNavigate } from "react-router-dom";

export default function GiftsList() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/gifts?per_page=100");
      setGifts(res.data.data || res.data); // support pagination or array
    } catch (e) {
      console.error(e);
      alert("Lỗi khi tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Xóa gift này?")) return;
    await axiosInstance.delete(`/admin/gifts/${id}`);
    setGifts(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="container admin-panel">
      <div className="admin-header">
        <h3>Gifts</h3>
        <div>
          <button className="btn btn-primary" onClick={() => navigate("/admin/gifts/create")}>+ Thêm</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <table className="table admin-table">
          <thead>
            <tr><th>ID</th><th>Ảnh</th><th>Tên</th><th>Giá</th><th>Featured</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {gifts.map(g => (
              <tr key={g.id}>
                <td>{g.id}</td>
                <td>
                  {g.image_url ? <img src={g.image_url} alt="" style={{height:60}}/> : <span>—</span>}
                </td>
                <td>{g.name}</td>
                <td>{g.price?.toLocaleString()}đ</td>
                <td>{g.featured ? "Yes" : "No"}</td>
                <td>
                  <button className="btn btn-warning" onClick={() => navigate(`/admin/gifts/edit/${g.id}`)}>Sửa</button>
                  &nbsp;
                  <button className="btn btn-danger" onClick={() => remove(g.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
