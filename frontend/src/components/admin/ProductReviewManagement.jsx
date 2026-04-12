import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import { useParams } from "react-router-dom";

export default function ProductReviewManagement() {
  const { productId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [newReview, setNewReview] = useState({
    user_id: "",
    rating: 5,
    comment: "",
  });

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await axiosInstance.get(`/products/${productId}/reviews?all=true`);
    setReviews(data); // lấy tất cả, kể cả chưa duyệt
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await axiosInstance.get(`/admin/users`);
    setUsers(data);
  };

  const approveReview = async (id) => {
    await axiosInstance.post(`/reviews/${id}/approve`);
    fetchReviews();
  };

  const rejectReview = async (id) => {
    await axiosInstance.post(`/reviews/${id}/reject`);
    fetchReviews();
  };

  const deleteReview = async (id) => {
    if (!confirm("Bạn chắc chắn muốn xoá?")) return;
    await axiosInstance.delete(`/reviews/${id}`);
    fetchReviews();
  };

  const submitReview = async (e) => {
    e.preventDefault();
    await axiosInstance.post(`/admin/reviews`, {
      product_id: Number(productId),
      user_id: newReview.user_id,
      rating: newReview.rating,
      comment: newReview.comment,
    });
    setNewReview({ user_id: "", rating: 5, comment: "" });
    setShowForm(false);
    fetchReviews();
  };

  useEffect(() => {
    fetchReviews();
    fetchUsers();
  }, [productId]);

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Quản lý Review — SP #{productId}</h2>

      <button
        className="btn btn-primary mb-3"
        onClick={() => setShowForm(true)}
      >
        ➕ Thêm review
      </button>

      {/* ========== FORM POPUP ========== */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>Thêm review mới</h4>
            <form onSubmit={submitReview}>
              <label>Người dùng</label>
              <select
                required
                className="form-select mb-2"
                value={newReview.user_id}
                onChange={(e) => setNewReview({ ...newReview, user_id: e.target.value })}
              >
                <option value="">-- chọn user --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>

              <label>Số sao</label>
              <select
                className="form-select mb-2"
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((v) => (
                  <option key={v} value={v}>{v} ★</option>
                ))}
              </select>

              <label>Bình luận</label>
              <textarea
                required
                className="form-control mb-3"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              />

              <button className="btn btn-success" type="submit">✅ Lưu</button>
              <button className="btn btn-secondary ms-2" type="button" onClick={() => setShowForm(false)}>Đóng</button>
            </form>
          </div>
        </div>
      )}

      {/* ========== LIST REVIEW ========== */}
      {!loading ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Sao</th>
              <th>Bình luận</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length ? (
              reviews.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.user?.name || "(đã xoá)"}</td>
                  <td>{r.rating} ★</td>
                  <td>{r.comment}</td>
                  <td>
                    {r.is_approved ? (
                      <span className="badge bg-success">Duyệt</span>
                    ) : (
                      <span className="badge bg-warning">Chờ duyệt</span>
                    )}
                  </td>
                  <td>
                    {!r.is_approved ? (
                      <button className="btn btn-success btn-sm me-2" onClick={() => approveReview(r.id)}>✅</button>
                    ) : (
                      <button className="btn btn-warning btn-sm me-2" onClick={() => rejectReview(r.id)}>🚫</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => deleteReview(r.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="text-center py-3">Không có review nào.</td></tr>
            )}
          </tbody>
        </table>
      ) : (
        <p>⏳ Đang tải...</p>
      )}
    </div>
  );
}
