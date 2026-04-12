import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import "../../../styles/admin.css";
import { useParams } from "react-router-dom";
export default function UserForm({ mode }) {
    const [form, setForm] = useState({ name: "", email: "", google_id: "", password: "" });
    const { id } = useParams();

    useEffect(() => {
        if (mode === "edit") {
            axiosInstance.get(`/admin/users/${id}`)
                .then(res => {
                    setForm({
                        name: res.data.name,
                        email: res.data.email,
                        google_id: res.data.google_id,
                        password: ""
                    });
                });
        }
    }, []);

    const submit = async (e) => {
        e.preventDefault();

        try {
            if (mode === "edit") {
                await axiosInstance.put(`/admin/users/${id}`, form);
            } else {
                await axiosInstance.post(`/admin/users`, form);
            }

            alert("Lưu thành công!");
            window.location.href = "/admin/users";

        } catch (err) {
            console.error("❌ ERROR", err.response?.data || err);
            alert("Lỗi khi lưu user!");
        }
    };

    return (
        <div className="container">
            <h2>{mode === "edit" ? "✏️ Sửa User" : "➕ Thêm User"}</h2>

            <form onSubmit={submit}>
                <input className="input" placeholder="Tên" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />

                <input className="input" placeholder="Email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} />

                <input className="input" placeholder="Google ID (nếu có)" value={form.google_id ?? ""}
                    onChange={e => setForm({ ...form, google_id: e.target.value })} />

                {mode === "create" && (
                    <input className="input" type="password" placeholder="Mật khẩu"
                        onChange={e => setForm({ ...form, password: e.target.value })} />
                )}

                <button className="btn btn-success">Lưu</button>
            </form>
        </div>
    );
}
