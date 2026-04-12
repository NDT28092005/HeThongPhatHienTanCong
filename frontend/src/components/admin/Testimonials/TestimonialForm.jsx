import React, { useState } from "react";
import axiosInstance from "../../../api/axios";

const TestimonialForm = ({ data, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    name: data?.name || "",
    rating: data?.rating || 5,
    content: data?.content || "",
    avatar: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("rating", form.rating);
    formData.append("content", form.content);
    if (form.avatar) formData.append("avatar", form.avatar);

    if (data?.id) {
      await axiosInstance.post(`/admin/testimonials/${data.id}?_method=PUT`, formData);
    } else {
      await axiosInstance.post("/admin/testimonials", formData);
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 mb-3">
      <label>Họ tên</label>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-control" required />

      <label>Rating</label>
      <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="form-control">
        {[1, 2, 3, 4, 5].map((r) => (
          <option key={r} value={r}>{r} ⭐</option>
        ))}
      </select>

      <label>Nội dung</label>
      <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="form-control"></textarea>

      <label>Avatar</label>
      <input type="file" className="form-control" onChange={(e) => setForm({ ...form, avatar: e.target.files[0] })} />

      <div className="mt-3">
        <button className="btn btn-success">Lưu</button>
        <button className="btn btn-secondary ms-2" onClick={onCancel}>Huỷ</button>
      </div>
    </form>
  );
};

export default TestimonialForm;
