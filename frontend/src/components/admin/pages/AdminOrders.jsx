import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { class: 'bg-warning', text: 'Chờ xử lý', icon: Clock },
            'confirmed': { class: 'bg-info', text: 'Đã xác nhận', icon: CheckCircle },
            'processing': { class: 'bg-primary', text: 'Đang xử lý', icon: Clock },
            'shipped': { class: 'bg-success', text: 'Đã giao hàng', icon: CheckCircle },
            'delivered': { class: 'bg-success', text: 'Đã nhận hàng', icon: CheckCircle },
            'cancelled': { class: 'bg-danger', text: 'Đã hủy', icon: XCircle }
        };
        
        const statusInfo = statusMap[status] || statusMap['pending'];
        const Icon = statusInfo.icon;
        
        return (
            <span className={`badge ${statusInfo.class}`}>
                <Icon size={12} className="me-1" />
                {statusInfo.text}
            </span>
        );
    };

    const getPaymentStatusBadge = (status) => {
        const statusMap = {
            'pending': { class: 'bg-warning', text: 'Chờ thanh toán' },
            'paid': { class: 'bg-success', text: 'Đã thanh toán' },
            'failed': { class: 'bg-danger', text: 'Thanh toán thất bại' },
            'refunded': { class: 'bg-info', text: 'Đã hoàn tiền' }
        };
        
        const statusInfo = statusMap[status] || statusMap['pending'];
        
        return (
            <span className={`badge ${statusInfo.class}`}>
                {statusInfo.text}
            </span>
        );
    };

    if (loading) {
        return <div className="d-flex justify-content-center p-5"><div className="spinner-border" role="status"></div></div>;
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Quản Lý Đơn Hàng</h2>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Mã Đơn Hàng</th>
                                    <th>Khách Hàng</th>
                                    <th>Sản Phẩm</th>
                                    <th>Tổng Tiền</th>
                                    <th>Trạng Thái</th>
                                    <th>Thanh Toán</th>
                                    <th>Ngày Tạo</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <code>{order.order_code}</code>
                                        </td>
                                        <td>
                                            <div>
                                                <strong>{order.user?.name || 'N/A'}</strong>
                                                <br />
                                                <small className="text-muted">{order.user?.email || 'N/A'}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                {order.order_items?.map((item, index) => (
                                                    <div key={index} className="mb-1">
                                                        <small>
                                                            {item.gift_package?.name} x{item.quantity}
                                                        </small>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <strong className="text-primary">
                                                    {new Intl.NumberFormat('vi-VN').format(order.final_amount)}đ
                                                </strong>
                                                {order.discount_amount > 0 && (
                                                    <div>
                                                        <small className="text-success">
                                                            -{new Intl.NumberFormat('vi-VN').format(order.discount_amount)}đ
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(order.status)}</td>
                                        <td>{getPaymentStatusBadge(order.payment_status)}</td>
                                        <td>
                                            <small>
                                                {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                            </small>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-outline-primary"
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
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
