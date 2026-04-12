import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../../api/axios";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import { useNavigate } from "react-router-dom";
import "../../../styles/orders.css";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [expandedOrder, setExpandedOrder] = useState(null);
    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Bạn cần đăng nhập để xem đơn hàng.");
            return navigate("/login");
        }

        try {
            setLoading(true);
            const res = await axiosInstance.get("/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setOrders(res.data);
        } catch (error) {
            console.error("❌ Lỗi tải đơn hàng:", error);
            alert("Không thể tải đơn hàng. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const viewPayment = (order) => {
        navigate("/payment", {
            state: {
                qr_url: order.qr_url,
                order_id: order.id,
                amount: order.total_price,
                order_code: order.order_code,
            }
        });
    };

    const toggleOrderDetails = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };

    const handleCancelItem = async (orderId, itemId) => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            alert("Bạn cần đăng nhập để thực hiện thao tác này.");
            return;
        }

        if (!window.confirm("Bạn có chắc chắn muốn hủy sản phẩm này?")) {
            return;
        }

        try {
            const res = await axiosInstance.put(
                `/orders/${orderId}/items/${itemId}/cancel`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert("✅ " + res.data.message);
            
            // Cập nhật lại danh sách đơn hàng
            await fetchOrders();
        } catch (error) {
            console.error("❌ Lỗi hủy sản phẩm:", error);
            const message = error.response?.data?.message || "Không thể hủy sản phẩm. Vui lòng thử lại sau.";
            alert("❌ " + message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "paid":
            case "delivered":
                return "status-success";
            case "cancelled":
                return "status-cancelled";
            case "pending":
                return "status-pending";
            case "processing":
                return "status-processing";
            case "shipped":
                return "status-shipped";
            default:
                return "status-default";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "paid":
                return "Đã thanh toán";
            case "cancelled":
                return "Đã hủy";
            case "pending":
                return "Chờ thanh toán";
            case "processing":
                return "Đang xử lý";
            case "shipped":
                return "Đang giao hàng";
            case "delivered":
                return "Đã giao hàng";
            default:
                return status.toUpperCase();
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "paid":
            case "delivered":
                return "✓";
            case "cancelled":
                return "✕";
            case "pending":
                return "⏱";
            case "processing":
                return "⚙";
            case "shipped":
                return "🚚";
            default:
                return "📦";
        }
    };

    const filterOrders = (status) => {
        if (status === "all") return orders;
        return orders.filter(order => order.status === status);
    };

    const filteredOrders = filterOrders(activeTab);

    return (
        <>
            <Header />
            <div className="orders-page">
                <div className="container">
                    <div className="orders-header">
                        <h1 className="page-title">Đơn hàng của tôi</h1>
                        <div className="order-tabs">
                            <button
                                className={`tab-item ${activeTab === "all" ? "active" : ""}`}
                                onClick={() => setActiveTab("all")}
                            >
                                Tất cả
                            </button>
                            <button
                                className={`tab-item ${activeTab === "pending" ? "active" : ""}`}
                                onClick={() => setActiveTab("pending")}
                            >
                                Chờ thanh toán
                            </button>
                            <button
                                className={`tab-item ${activeTab === "processing" ? "active" : ""}`}
                                onClick={() => setActiveTab("processing")}
                            >
                                Đang xử lý
                            </button>
                            <button
                                className={`tab-item ${activeTab === "shipped" ? "active" : ""}`}
                                onClick={() => setActiveTab("shipped")}
                            >
                                Đang vận chuyển
                            </button>
                            <button
                                className={`tab-item ${activeTab === "delivered" ? "active" : ""}`}
                                onClick={() => setActiveTab("delivered")}
                            >
                                Đã giao
                            </button>
                            <button
                                className={`tab-item ${activeTab === "cancelled" ? "active" : ""}`}
                                onClick={() => setActiveTab("cancelled")}
                            >
                                Đã hủy
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="shopee-spinner"></div>
                            <p>Đang tải đơn hàng...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="empty-orders">
                            <div className="empty-image">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 24 24' fill='none' stroke='%235D7B6F' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 2L3 7v13a2 2 0 002 2h14a2 2 0 002-2V7l-6-5z'/%3E%3Cpolyline points='3 7 12 13 21 7'/%3E%3Cpolyline points='12 22 12 13'/%3E%3C/svg%3E" alt="Empty orders" />
                            </div>
                            <h3>Chưa có đơn hàng</h3>
                            <p>Bạn chưa có đơn hàng nào trong mục này</p>
                            <button
                                className="shop-now-btn"
                                onClick={() => navigate("/")}
                            >
                                Mua sắm ngay
                            </button>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="order-card">
                                    <div className="order-header">
                                        <div className="shop-info">
                                            <div className="shop-avatar">
                                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%235D7B6F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 2L3 7v13a2 2 0 002 2h14a2 2 0 002-2V7l-6-5z'/%3E%3Cpolyline points='3 7 12 13 21 7'/%3E%3C/svg%3E" alt="Shop" />
                                            </div>
                                            <div className="shop-details">
                                                <h3 className="shop-name">Boostea</h3>
                                                <p className="order-date">{new Date(order.created_at).toLocaleDateString("vi-VN")}</p>
                                            </div>
                                        </div>
                                        <div className={`order-status ${getStatusColor(order.status)}`}>
                                            <span className="status-icon">{getStatusIcon(order.status)}</span>
                                            {getStatusText(order.status)}
                                        </div>
                                    </div>

                                    <div className="order-items">
                                        {order.items?.map((item) => (
                                            <div key={item.id} className={`order-item ${item.status === 'cancelled' ? 'cancelled-item' : ''}`}>
                                                <div className="item-image">
                                                    <img
                                                        src={item.product?.image_url || "https://via.placeholder.com/80x80"}
                                                        alt={item.product?.name}
                                                        className="product-thumb"
                                                    />
                                                    {item.status === 'cancelled' && (
                                                        <div className="cancelled-badge">Đã hủy</div>
                                                    )}
                                                </div>

                                                <div className="item-details">
                                                    <h4 className="item-name">
                                                        {item.product?.name}
                                                        {item.status === 'cancelled' && (
                                                            <span className="cancelled-label"> (Đã hủy)</span>
                                                        )}
                                                    </h4>

                                                    <div className="item-meta">
                                                        <span className="item-quantity">x{item.quantity}</span>
                                                        <span className={`item-price ${item.status === 'cancelled' ? 'cancelled-price' : ''}`}>
                                                            {item.price.toLocaleString()} ₫
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="item-total">
                                                    <strong className={item.status === 'cancelled' ? 'cancelled-price' : ''}>
                                                        {(item.price * item.quantity).toLocaleString()} ₫
                                                    </strong>
                                                </div>

                                                {/* Nút hủy sản phẩm - chỉ hiển thị nếu item chưa bị hủy và đơn hàng chưa hoàn thành */}
                                                {item.status !== 'cancelled' && 
                                                 !['completed', 'cancelled', 'delivered'].includes(order.status) && (
                                                    <div className="item-actions">
                                                        <button
                                                            className="cancel-item-btn"
                                                            onClick={() => handleCancelItem(order.id, item.id)}
                                                            title="Hủy sản phẩm này"
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-footer">
                                        <div className="order-summary">
                                            <div className="summary-row">
                                                <span>Thành tiền ({order.items?.filter(item => item.status !== 'cancelled').length || 0} sản phẩm):</span>
                                                <span className="total-amount">{order.total_price.toLocaleString()} ₫</span>
                                            </div>
                                            <div className="payment-info">
                                                <span className="payment-method">
                                                    {order.payment_method === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản ngân hàng"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="order-actions">
                                            {order.payment_method === "bank" && order.status === "pending" && (
                                                <button
                                                    className="action-btn primary"
                                                    onClick={() => viewPayment(order)}
                                                >
                                                    Thanh toán ngay
                                                </button>
                                            )}

                                            {/* Nút Xem chi tiết với thiết kế mới */}
                                            <button
                                                className={`action-btn detail-btn ${expandedOrder === order.id ? 'active' : ''}`}
                                                onClick={() => toggleOrderDetails(order.id)}
                                            >
                                                <div className="detail-icon">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10"></circle>
                                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                                    </svg>
                                                </div>
                                                <span>{expandedOrder === order.id ? 'Thu gọn' : 'Chi tiết'}</span>
                                                <div className={`detail-arrow ${expandedOrder === order.id ? 'up' : 'down'}`}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="6 9 12 15 18 9"></polyline>
                                                    </svg>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Chi tiết đơn hàng mở rộng */}
                                    {expandedOrder === order.id && (
                                        <div className="order-details-expanded">
                                            <div className="details-section">
                                                <h4 className="section-title">Thông tin giao hàng</h4>
                                                <div className="info-row">
                                                    <span className="info-label">Người nhận:</span>
                                                    <span className="info-value">{order.customer_name}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Điện thoại:</span>
                                                    <span className="info-value">{order.customer_phone}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Địa chỉ:</span>
                                                    <span className="info-value">{order.customer_address}</span>
                                                </div>
                                            </div>

                                            <div className="details-section">
                                                <h4 className="section-title">Lịch sử sử đơn hàng</h4>
                                                <div className="timeline">
                                                    <div className="timeline-item active">
                                                        <div className="timeline-dot"></div>
                                                        <div className="timeline-content">
                                                            <p className="timeline-title">Đặt hàng thành công</p>
                                                            <p className="timeline-time">{new Date(order.created_at).toLocaleString("vi-VN")}</p>
                                                        </div>
                                                    </div>

                                                    {order.status !== 'pending' && (
                                                        <div className="timeline-item active">
                                                            <div className="timeline-dot"></div>
                                                            <div className="timeline-content">
                                                                <p className="timeline-title">Đơn hàng đã được xác nhận</p>
                                                                <p className="timeline-time">{new Date(order.updated_at).toLocaleString("vi-VN")}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {order.status === 'shipped' && (
                                                        <div className="timeline-item active">
                                                            <div className="timeline-dot"></div>
                                                            <div className="timeline-content">
                                                                <p className="timeline-title">Đơn hàng đang được giao</p>
                                                                <p className="timeline-time">{new Date(order.updated_at).toLocaleString("vi-VN")}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(order.status === 'delivered' || order.status === 'paid') && (
                                                        <div className="timeline-item active">
                                                            <div className="timeline-dot"></div>
                                                            <div className="timeline-content">
                                                                <p className="timeline-title">Giao hàng thành công</p>
                                                                <p className="timeline-time">{new Date(order.updated_at).toLocaleString("vi-VN")}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {order.status === 'cancelled' && (
                                                        <div className="timeline-item cancelled">
                                                            <div className="timeline-dot"></div>
                                                            <div className="timeline-content">
                                                                <p className="timeline-title">Đơn hàng đã bị hủy</p>
                                                                <p className="timeline-time">{new Date(order.updated_at).toLocaleString("vi-VN")}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="details-section">
                                                <h4 className="section-title">Hóa đơn</h4>
                                                <div className="invoice">
                                                    <div className="invoice-row">
                                                        <span className="invoice-label">Tổng tiền hàng:</span>
                                                        <span className="invoice-value">{order.total_price.toLocaleString()} ₫</span>
                                                    </div>
                                                    <div className="invoice-row">
                                                        <span className="invoice-label">Giảm giá:</span>
                                                        <span className="invoice-value discount">-{order.discount ? order.discount.toLocaleString() : '0'} ₫</span>
                                                    </div>
                                                    <div className="invoice-row total">
                                                        <span className="invoice-label">Thành tiền:</span>
                                                        <span className="invoice-value">{order.total_price.toLocaleString()} ₫</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;