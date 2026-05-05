import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import { ShoppingCart, Search, Eye, CheckCircle, XCircle, Clock, Package } from "lucide-react";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/admin/orders?status=${statusFilter}`);
      setOrders(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleChangeStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/orders/${id}/status`, { status });
      fetchOrders();
      alert("Cập nhật trạng thái thành công");
    } catch (err) {
      alert("Cập nhật thất bại!");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const formatStatus = (status) => {
    return {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      paid: "Đã thanh toán",
      completed: "Hoàn tất",
      cancelled: "Đã hủy",
    }[status] || status;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
      processing: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" },
      paid: { bg: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" },
      completed: { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981" },
      cancelled: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
    };
    const style = styles[status] || styles.pending;
    return (
      <span className="badge-custom" style={{ background: style.bg, color: style.color }}>
        {formatStatus(status)}
      </span>
    );
  };

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
          <div className="header-icon" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <h1>Quản lý Đơn hàng</h1>
            <p>Tổng cộng {orders.length} đơn hàng</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-container">
        <select
          className="filter-select"
          value={statusFilter}
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

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <h3><ShoppingCart size={20} /> Danh sách đơn hàng</h3>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={60} />
            <h4>Chưa có đơn hàng nào</h4>
            <p>Danh sách đơn hàng sẽ hiển thị tại đây</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th style={{ width: "100px" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><span className="badge badge-secondary">#{o.id}</span></td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{o.customer_name}</span>
                        <span className="customer-phone">{o.customer_phone}</span>
                      </div>
                    </td>
                    <td><span className="price-tag">{formatPrice(o.total_price)}</span></td>
                    <td><span className="payment-method">{o.payment_method?.toUpperCase()}</span></td>
                    <td>{getStatusBadge(o.status)}</td>
                    <td><span className="date-cell">{new Date(o.created_at).toLocaleString('vi-VN')}</span></td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => setSelectedOrder(o)}
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleChangeStatus}
          formatPrice={formatPrice}
          getStatusBadge={getStatusBadge}
        />
      )}

      <style>{`
        .filter-container {
          margin-bottom: 20px;
        }

        .filter-select {
          padding: 12px 16px;
          background: var(--admin-bg-card);
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          color: var(--admin-text-primary);
          font-size: 0.9rem;
          min-width: 200px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--admin-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .customer-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .customer-name {
          font-weight: 500;
          color: var(--admin-text-primary);
        }

        .customer-phone {
          font-size: 0.85rem;
          color: var(--admin-text-secondary);
        }

        .price-tag {
          font-weight: 600;
          color: #10b981;
        }

        .payment-method {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .badge-custom {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .date-cell {
          font-size: 0.85rem;
          color: var(--admin-text-muted);
        }

        .table-responsive {
          overflow-x: auto;
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

/* Modal Chi tiết đơn hàng */
function OrderDetailModal({ order, onClose, onUpdateStatus, formatPrice, getStatusBadge }) {
  const statusOptions = ["pending", "processing", "paid", "completed", "cancelled"];
  const [selectedStatus, setSelectedStatus] = useState(order.status);

  const formatStatus = (status) => {
    return {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      paid: "Đã thanh toán",
      completed: "Hoàn tất",
      cancelled: "Đã hủy",
    }[status] || status;
  };

  const handleSaveStatus = () => {
    onUpdateStatus(order.id, selectedStatus);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <h3>Chi tiết đơn hàng #{order.order_code || order.id}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body-custom">
          {/* Thông tin khách hàng */}
          <div className="detail-section">
            <h4><Package size={18} /> Thông tin khách hàng</h4>
            <div className="info-grid">
              <div className="info-item">
                <label>Tên:</label>
                <span>{order.customer_name}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{order.user?.email || "—"}</span>
              </div>
              <div className="info-item">
                <label>Điện thoại:</label>
                <span>{order.customer_phone}</span>
              </div>
              <div className="info-item">
                <label>Địa chỉ:</label>
                <span>{order.customer_address}</span>
              </div>
            </div>
          </div>

          {/* Thanh toán */}
          <div className="detail-section">
            <h4>Thông tin thanh toán</h4>
            <div className="info-grid">
              <div className="info-item">
                <label>Phương thức:</label>
                <span className="payment-badge">{order.payment_method?.toUpperCase()}</span>
              </div>
              <div className="info-item">
                <label>Tổng tiền:</label>
                <span className="total-price">{formatPrice(order.total_price)}</span>
              </div>
            </div>
          </div>

          {/* Sản phẩm */}
          {order.items && (
            <div className="detail-section">
              <h4>Sản phẩm trong đơn</h4>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>SL</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product?.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Cập nhật trạng thái */}
          <div className="detail-section">
            <h4>Cập nhật trạng thái</h4>
            <select
              className="status-select"
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
        </div>

        <div className="modal-footer-custom">
          <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
          <button className="btn btn-primary" onClick={handleSaveStatus}>Lưu trạng thái</button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .modal-content-custom {
          background: var(--admin-bg-card);
          border-radius: 16px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header-custom {
          padding: 20px 24px;
          border-bottom: 1px solid var(--admin-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-header-custom h3 {
          margin: 0;
          font-size: 1.2rem;
          color: var(--admin-text-primary);
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--admin-text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .modal-close:hover {
          color: var(--admin-text-primary);
        }

        .modal-body-custom {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 12px 0;
          font-size: 0.95rem;
          color: var(--admin-text-primary);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-item label {
          font-size: 0.8rem;
          color: var(--admin-text-muted);
          text-transform: uppercase;
        }

        .info-item span {
          color: var(--admin-text-primary);
          font-weight: 500;
        }

        .payment-badge {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .total-price {
          font-size: 1.2rem;
          color: #10b981 !important;
          font-weight: 700 !important;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
        }

        .items-table th,
        .items-table td {
          padding: 10px;
          border-bottom: 1px solid var(--admin-border);
          text-align: left;
        }

        .items-table th {
          background: rgba(255, 255, 255, 0.03);
          color: var(--admin-text-secondary);
          font-size: 0.8rem;
          text-transform: uppercase;
        }

        .items-table td {
          color: var(--admin-text-primary);
        }

        .status-select {
          width: 100%;
          padding: 12px 16px;
          background: var(--admin-bg-dark);
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          color: var(--admin-text-primary);
          font-size: 0.9rem;
        }

        .status-select:focus {
          outline: none;
          border-color: var(--admin-primary);
        }

        .modal-footer-custom {
          padding: 16px 24px;
          border-top: 1px solid var(--admin-border);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}
