import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import { useNavigate, useParams } from "react-router-dom";

export default function SliderForm() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState({
        title: "",
        redirect_url: "",
        order: 0,
        image: null,
        imagePreview: "",
    });

    useEffect(() => {
        if (id) {
            axiosInstance.get(`/admin/sliders/${id}`)
                .then(res => {
                    const s = res.data.data; // ← lấy đúng data

                    setForm(prev => ({
                        ...prev,
                        title: s.title ?? "",
                        redirect_url: s.redirect_url ?? "",
                        order: s.order ?? 0,
                        imagePreview: s.image_url ?? "",
                    }));
                })
                .catch(err => console.log(err));
        }
    }, [id]);

    const submit = async (e) => {
        e.preventDefault();
        const f = new FormData();

        f.append("title", form.title);
        f.append("redirect_url", form.redirect_url);
        f.append("order", form.order);
        if (form.image) f.append("image", form.image);

        const url = id
            ? `/admin/sliders/${id}`
            : `/admin/sliders`;

        // Nếu là update => dùng PUT
        if (id) {
            f.append("_method", "PUT");
        }

        await axiosInstance.post(url, f);

        alert("Lưu thành công!");
        navigate("/admin/sliders");
    };


    return (
        <div className="container admin-page">
            <h2>{id ? "✏️ Sửa Slider" : "➕ Thêm Slider"}</h2>

            <form onSubmit={submit}>
                <input className="input" placeholder="Tiêu đề"
                    value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

                <input className="input" placeholder="Link khi click"
                    value={form.redirect_url} onChange={(e) => setForm({ ...form, redirect_url: e.target.value })} />

                <input type="number" className="input" placeholder="Thứ tự hiển thị"
                    value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />

                <input type="file" className="input"
                    onChange={(e) => setForm({ ...form, image: e.target.files[0], imagePreview: URL.createObjectURL(e.target.files[0]) })} />

                {form.imagePreview && (
                    <img src={form.imagePreview} alt="preview" width="300" className="mt-3" />
                )}

                <button className="btn btn-success mt-3">Lưu Slider</button>
            </form>
        </div>
    );
}
