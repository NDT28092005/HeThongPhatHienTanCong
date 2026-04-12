import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import "../../../styles/admin.css";

export default function GiftForm({ mode="create" }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", slug: "", price: 0, original_price: 0, featured: false, category_id: null
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && id) {
      axiosInstance.get(`/admin/gifts/${id}`).then(res => {
        const data = res.data;
        setForm({
          name: data.name || "",
          slug: data.slug || "",
          price: data.price || 0,
          original_price: data.original_price || 0,
          featured: !!data.featured,
          category_id: data.category_id || null
        });
        setPreview(data.image_url || null);
      }).catch(e => {
        console.error(e);
        alert("Không thể tải gift");
      });
    }
  }, [id, mode]);

  useEffect(() => {
    if (!imageFile) return setPreview(prev => prev);
    const objectUrl = URL.createObjectURL(imageFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) setImageFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('slug', form.slug);
      fd.append('price', form.price);
      fd.append('original_price', form.original_price);
      fd.append('featured', form.featured ? 1 : 0);
      if (form.category_id) fd.append('category_id', form.category_id);
      if (imageFile) fd.append('image', imageFile);

      if (mode === "edit") {
        await axiosInstance.post(`/admin/gifts/${id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          // Laravel expects PUT/PATCH - send _method for compatibility:
          params: { _method: 'PUT' }
        });
        alert("Cập nhật thành công");
      } else {
        await axiosInstance.post('/admin/gifts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert("Tạo thành công");
      }
      navigate('/admin/gifts');
    } catch (err) {
      console.error(err.response || err);
      const msg = err.response?.data?.message || 'Lỗi khi lưu';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container admin-panel">
      <h3>{mode === "edit" ? "Sửa Gift" : "Thêm Gift"}</h3>
      <form onSubmit={submit} className="admin-form">
        <label>Tên</label>
        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <label>Slug</label>
        <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
        <label>Giá</label>
        <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} required />
        <label>Giá gốc</label>
        <input type="number" value={form.original_price} onChange={e => setForm({...form, original_price: Number(e.target.value)})} />
        <label>
          <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} />
          &nbsp;Featured
        </label>

        <label>Ảnh (jpg/png, max 2MB)</label>
        <input type="file" accept="image/*" onChange={handleFile} />

        {preview && (
          <div style={{marginTop:10}}>
            <img src={preview} alt="preview" style={{height:120, borderRadius:8}} />
          </div>
        )}

        <div style={{marginTop:16}}>
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Đang xử lý...' : 'Lưu'}</button>
          &nbsp;
          <button type="button" className="btn btn-default" onClick={() => navigate('/admin/gifts')}>Hủy</button>
        </div>
      </form>
    </div>
  );
}
