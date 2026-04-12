import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";

export default function OrderManagement() {

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    const { data } = await axiosInstance.get(`/admin/orders?status=${statusFilter}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleChangeStatus = async (id, status) => {
    const token = localStorage.getItem("token");

    await axiosInstance.put(
      `/admin/orders/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchOrders();
    alert("✅ Cập nhật trạng thái thành công");
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">📦 Quản lý đơn hàng</h2>

      {/* Filter trạng thái */}
      <div className="mb-3 d-flex gap-2">
        <select
          className="form-select"
          value={statusFilter}
          style={{ width: "220px" }}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="paid">Đã thanh toán</option>
          <option value="completed">Hoàn tất</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* LIST TABLE */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#ID</th>
            <th>Khách hàng</th>
            <th>Tổng tiền</th>
            <th>Phương thức</th> {/* ✅ thêm cột */}
            <th>Trạng thái</th>
            <th>Ngày đặt</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>
                {o.customer_name}
                <br />
                <span style={{ fontSize: "13px" }}>{o.customer_phone}</span>
              </td>
              <td>{o.total_price.toLocaleString()} đ</td>

              {/* ✅ Hiển thị phương thức thanh toán */}
              <td>{o.payment_method.toUpperCase()}</td>

              <td>
                <span className={`badge bg-${getStatusColor(o.status)}`}>
                  {formatStatus(o.status)}
                </span>
              </td>

              <td>{new Date(o.created_at).toLocaleString()}</td>

              <td>
                <button
                  className="btn btn-info btn-sm me-2"
                  onClick={() => setSelectedOrder(o)}
                >
                  🔍 Xem
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DETAIL POPUP */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleChangeStatus}
        />
      )}
    </div>
  );
}

/* ==============================================
          MODAL CHI TIẾT ĐƠN HÀNG
================================================= */
function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  const statusOptions = ["pending", "processing", "paid", "completed", "cancelled"];

  const [selectedStatus, setSelectedStatus] = useState(order.status);

  const handleSaveStatus = () => {
    onUpdateStatus(order.id, selectedStatus);
    onClose();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: "#00000060" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">🧾 Chi tiết đơn hàng #{order.order_code}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* ✅ Thông tin người đặt */}
            <h6>👤 Người đặt hàng</h6>
            <p>
              <b>{order.customer_name}</b> ({order.user?.email})
              <br />
              📞 {order.customer_phone}
              <br />
              🏠 {order.customer_address}
            </p>

            <h6>💳 Phương thức thanh toán</h6>
            <p style={{ textTransform: "uppercase" }}>
              <b>{order.payment_method}</b>
            </p>

            {/* ✅ Danh sách sản phẩm */}
            <h6>🛒 Sản phẩm trong đơn</h6>
            <table className="table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>SL</th>
                  <th>Giá</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product?.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price.toLocaleString()} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h5 className="text-end">
              Tổng tiền: <b>{order.total_price.toLocaleString()} đ</b>
            </h5>

            <hr />

            {/* ✅ Chọn trạng thái thủ công */}
            <label className="fw-bold">🔄 Cập nhật trạng thái</label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {formatStatus(s)}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Đóng
            </button>
            <button className="btn btn-primary" onClick={handleSaveStatus}>
              ✅ Lưu trạng thái
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ==============================================
                      HELPER
================================================= */
function formatStatus(status) {
  return {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    paid: "Đã thanh toán",
    completed: "Hoàn tất",
    cancelled: "Đã hủy",
  }[status] || status;
}

function getStatusColor(status) {
  return {
    pending: "warning",
    processing: "primary",
    paid: "info",
    completed: "success",
    cancelled: "danger",
  }[status] || "secondary";
}
