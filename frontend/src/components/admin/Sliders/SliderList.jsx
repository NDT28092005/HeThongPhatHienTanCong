import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import { Link } from "react-router-dom";

export default function SliderList() {
  const [sliders, setSliders] = useState([]);

  const loadSliders = () => {
    axiosInstance.get("/admin/sliders")
      .then(res => setSliders(res.data.data));
  };

  useEffect(() => {
    loadSliders();
  }, []);

  const deleteSlider = async (id) => {
    if (!window.confirm("Xóa slider này?")) return;
    await axiosInstance.delete(`/admin/sliders/${id}`);
    setSliders(sliders.filter(slider => slider.id !== id));
  };

  return (
    <div className="container admin-page">
      <h2>🎞 Quản Lý Slider</h2>

      <Link to="/admin/sliders/create" className="btn btn-success mb-3">+ Thêm slider</Link>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tiêu đề</th>
            <th>Link Click</th>
            <th>Thứ tự</th>
            <th width="150px">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {sliders.map((s) => (
            <tr key={s.id}>
              <td><img src={s.image_url} width="120" /></td>
              <td>{s.title}</td>
              <td>{s.redirect_url}</td>
              <td>{s.order}</td>
              <td>
                <Link to={`/admin/sliders/edit/${s.id}`} className="btn btn-primary btn-sm me-2">Sửa</Link>
                <button className="btn btn-danger btn-sm" onClick={() => deleteSlider(s.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
