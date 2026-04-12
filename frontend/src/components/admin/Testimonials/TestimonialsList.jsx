import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import TestimonialForm from "./TestimonialForm";

const TestimonialsList = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  const fetchData = async () => {
    const res = await axiosInstance.get("/admin/testimonials");
    setTestimonials(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá?")) return;
    await axiosInstance.delete(`/admin/testimonials/${id}`);
    setTestimonials(testimonials.filter((item) => item.id !== id)); // không reload trang
  };

  return (
    <div className="container mt-4">
      <h3>Quản lý đánh giá khách hàng</h3>
      <button
        className="btn btn-primary mb-3"
        onClick={() => setEditingTestimonial({})}
      >
        ➕ Thêm testimonial
      </button>

      {editingTestimonial && (
        <TestimonialForm
          data={editingTestimonial}
          onSuccess={() => {
            fetchData();
            setEditingTestimonial(null);
          }}
          onCancel={() => setEditingTestimonial(null)}
        />
      )}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Avatar</th>
            <th>Tên</th>
            <th>Rating</th>
            <th>Nội dung</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {testimonials.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td><img src={t.avatar_url} width="60" className="rounded" /></td>
              <td>{t.name}</td>
              <td>{t.rating} ⭐</td>
              <td>{t.content}</td>
              <td>
                <button className="btn btn-warning btn-sm" onClick={() => setEditingTestimonial(t)}>Sửa</button>
                <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDelete(t.id)}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestimonialsList;
