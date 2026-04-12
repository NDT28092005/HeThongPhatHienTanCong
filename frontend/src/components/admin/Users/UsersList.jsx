import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import "../../../styles/admin.css";

export default function UsersList() {
    const [users, setUsers] = useState([]);

    const loadUsers = async () => {
        const res = await axiosInstance.get("/admin/users");

        // ✅ Sắp xếp theo ID tăng dần trước khi set vào state
        setUsers(res.data.sort((a, b) => a.id - b.id));
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const deleteUser = async (id) => {
        if (!confirm("Bạn có chắc chắn muốn xóa user này?")) return;

        await axiosInstance.delete(`/admin/users/${id}`);
        loadUsers();
    };

    return (
        <div className="admin-page">
            <h2>👤 Quản lý User</h2>

            <a href="/admin/users/create" className="btn btn-primary">+ Thêm User</a>

            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th><th>Tên</th><th>Email</th><th>Google ID</th><th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.google_id || "—"}</td>
                            <td>
                                <a href={`/admin/users/edit/${u.id}`} className="btn btn-warning">Sửa</a>
                                &nbsp;
                                <button className="btn btn-danger" onClick={() => deleteUser(u.id)}>
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
