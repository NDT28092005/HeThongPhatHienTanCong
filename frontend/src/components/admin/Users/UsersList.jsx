import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import { Link } from "react-router-dom";
import { Users, Plus, Search, Edit2, Trash, Mail, UserPlus } from "lucide-react";

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadUsers = async () => {
        try {
            const res = await axiosInstance.get("/admin/users");
            const responseData = res.data;
            setUsers(Array.isArray(responseData) ? responseData : (responseData.data ?? []));
        } catch (err) {
            console.error(err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const deleteUser = async (id) => {
        if (!confirm("Bạn có chắc chắn muốn xóa user này?")) return;

        try {
            await axiosInstance.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            alert("Xóa thất bại!");
            console.error(err);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-info">
                    <div className="header-icon" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <h1>Quản lý Người dùng</h1>
                        <p>Tổng cộng {users.length} người dùng</p>
                    </div>
                </div>
                <Link to="/admin/users/create" className="btn btn-primary">
                    <UserPlus size={20} />
                    Thêm người dùng
                </Link>
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="table-container">
                <div className="table-header">
                    <h3><Users size={20} /> Danh sách người dùng</h3>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <Users size={60} />
                        <h4>Không tìm thấy người dùng</h4>
                        <p>Thử thay đổi từ khóa tìm kiếm</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: "60px" }}>ID</th>
                                <th>Tên</th>
                                <th>Email</th>
                                <th>Google ID</th>
                                <th style={{ width: "150px" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.id}>
                                    <td><span className="badge badge-secondary">#{u.id}</span></td>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar">{u.name?.charAt(0).toUpperCase()}</div>
                                            <span className="user-name">{u.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="email-cell">
                                            <Mail size={14} />
                                            {u.email}
                                        </span>
                                    </td>
                                    <td>
                                        <code className="google-id">{u.google_id || "—"}</code>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link to={`/admin/users/edit/${u.id}`} className="btn btn-sm btn-info" title="Sửa">
                                                <Edit2 size={16} />
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => deleteUser(u.id)}
                                                title="Xóa"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
                .user-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .user-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .user-name {
                    font-weight: 500;
                    color: var(--admin-text-primary);
                }

                .email-cell {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--admin-text-secondary);
                    font-size: 0.9rem;
                }

                .google-id {
                    display: inline-block;
                    padding: 4px 10px;
                    background: rgba(99, 102, 241, 0.1);
                    color: #818cf8;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-family: monospace;
                }

                .action-buttons {
                    display: flex;
                    gap: 8px;
                }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 20px;
                    color: var(--admin-text-secondary);
                }

                .loading-container .loading-spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid var(--admin-border);
                    border-top-color: var(--admin-primary);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin-bottom: 16px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
