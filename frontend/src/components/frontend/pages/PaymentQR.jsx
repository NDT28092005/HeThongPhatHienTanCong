import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import {
    Smartphone,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Copy,
    Clock,
    Shield,
    CreditCard,
    Info
} from "lucide-react";
import "../../../styles/payment-qr.css";

const GOOGLE_API_URL =
    "https://script.google.com/macros/s/AKfycbyjHTm8gtq_qPG_GUEV970kCuAFuhGd3dlEqqPjK-zsvUssBzdeOuc0si8BjVx31nj9/exec";

const PaymentQR = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(180); // 3 phút
    const [paymentStatus, setPaymentStatus] = useState("pending");
    const [isChecking, setIsChecking] = useState(false);
    const [copied, setCopied] = useState(false);
    const pollRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadQR = async () => {
        setIsDownloading(true);

        try {
            const link = document.createElement('a');
            link.href = qr_url;
            link.download = `QR-Order${order_id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Giả lại trạng thái sau khi tải về xong
            setTimeout(() => setIsDownloading(false), 500);
        } catch (err) {
            console.error('Không thể tải về QR:', err);
            setIsDownloading(false);
        }
    };
    const { qr_url, order_id, amount, order_code: codeFromState } = location.state || {};
    const order_code_final = codeFromState || sessionStorage.getItem("order_code") || "Không tìm thấy";

    const checkPaymentFromGoogleAPI = async () => {
        try {
            setIsChecking(true);
            const response = await fetch(GOOGLE_API_URL);
            const data = await response.json();

            if (!data?.data?.length) return;

            const latestTx = data.data[data.data.length - 1];
            const description = latestTx["Mô tả"] || "";
            const amountFromAPI = Number(latestTx["Giá trị"]) || 0;

            console.log("🔍 Mô tả giao dịch:", description);
            console.log("💰 Số tiền từ API:", amountFromAPI);

            if (description.includes(order_code_final) && amountFromAPI >= amount) {
                setPaymentStatus("paid");

                // Cập nhật trạng thái đơn hàng
                const currentToken = localStorage.getItem("token") || sessionStorage.getItem("token");
                await axiosInstance.put(
                    `/orders/${order_id}/status`,
                    { status: "paid" },
                    {
                        headers: {
                            Authorization: `Bearer ${currentToken}`,
                        },
                    }
                );

                // Xóa giỏ hàng
                await axiosInstance.delete("/cart/clear", {
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                    },
                });

                clearInterval(pollRef.current);
                pollRef.current = null;

                // ✅ Chỉ alert 1 lần trước khi navigate
                alert("🎉 Thanh toán thành công!");
                navigate("/orders");
            }
        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra thanh toán:", error);
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        if (!qr_url) {
            navigate("/cart");
            return;
        }

        if (paymentStatus === "pending") {
            pollRef.current = setInterval(() => {
                checkPaymentFromGoogleAPI();
            }, 5000);
        }

        return () => clearInterval(pollRef.current);
    }, [paymentStatus, qr_url, order_code_final, amount]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    alert("⏰ Hết thời gian thanh toán, đơn hàng sẽ bị hủy!");
                    navigate("/cart");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [qr_url]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(order_code_final)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(err => console.error('Không thể sao chép:', err));
    };

    return (
        <>
            <Header />
            <div className="payment-qr-page">
                <div className="container">
                    <div className="payment-header">
                        <button className="back-btn" onClick={() => navigate("/cart")}>
                            <ArrowLeft size={20} />
                            Quay lại giỏ hàng
                        </button>
                        <h1>Thanh toán đơn hàng</h1>
                    </div>

                    <div className="payment-layout">
                        {/* QR Code Section */}
                        <div className="qr-section">
                            <div className="section-header">
                                <Smartphone size={24} />
                                <h2>Quét mã QR để thanh toán</h2>
                            </div>

                            <div className="qr-container">
                                <div className="qr-image-wrapper">
                                    <img src={qr_url} alt="Payment QR Code" />
                                    <div className={`status-indicator ${paymentStatus}`}>
                                        {paymentStatus === "paid" ? (
                                            <CheckCircle size={32} />
                                        ) : (
                                            <AlertCircle size={32} />
                                        )}
                                    </div>
                                </div>

                                <div className="qr-actions">
                                    <button
                                        className={`download-btn ${isDownloading ? 'downloading' : ''}`}
                                        onClick={downloadQR}
                                        disabled={isDownloading}
                                    >
                                        {isDownloading ? (
                                            <>
                                                <div className="spinner-small"></div>
                                                Đang tải...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw size={20} />
                                                Tải về
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="payment-status">
                                <div className={`status-badge ${paymentStatus}`}>
                                    {paymentStatus === "paid" ? (
                                        <>
                                            <CheckCircle size={16} />
                                            <span>Đã thanh toán</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock size={16} />
                                            <span>Chờ thanh toán</span>
                                        </>
                                    )}
                                </div>

                                {paymentStatus === "pending" && (
                                    <div className="countdown-container">
                                        <div className="countdown-timer">
                                            <div className="countdown-time">{formatTime(countdown)}</div>
                                        </div>
                                        <div className="countdown-bar">
                                            <div
                                                className="countdown-fill"
                                                style={{ width: `${((180 - countdown) / 180) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="qr-instructions">
                                <h3>Hướng dẫn thanh toán</h3>
                                <div className="instruction-list">
                                    <div className="instruction-item">
                                        <span className="step-number">1</span>
                                        <p style={{ color: "black" }}>Mở ứng dụng ngân hàng và chọn "Quét mã QR"</p>
                                    </div>
                                    <div className="instruction-item">
                                        <span className="step-number">2</span>
                                        <p style={{ color: "black" }}>Quét mã QR bên cạnh để hiển thị thông tin thanh toán</p>
                                    </div>
                                    <div className="instruction-item">
                                        <span className="step-number">3</span>
                                        <p style={{ color: "black" }}>Xác nhận thông tin và hoàn tất thanh toán</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Details Section */}
                        <div className="order-details">
                            <div className="section-header">
                                <CreditCard size={24} />
                                <h2>Chi tiết đơn hàng</h2>
                            </div>

                            <div className="order-info">
                                <div className="info-row">
                                    <span className="info-label">Mã đơn hàng:</span>
                                    <span className="info-value code">{order_code_final}</span>
                                    <button
                                        className={`copy-btn ${copied ? 'copied' : ''}`}
                                        onClick={copyToClipboard}
                                    >
                                        <Copy size={16} />
                                        {copied ? "Đã sao chép!" : "Sao chép"}
                                    </button>
                                </div>

                                <div className="info-row">
                                    <span className="info-label">Số tiền thanh toán:</span>
                                    <span className="info-value amount">{amount.toLocaleString()} VNĐ</span>
                                </div>

                                <div className="info-row">
                                    <span className="info-label">Trạng thái:</span>
                                    <span className={`info-value status ${paymentStatus}`}>
                                        {paymentStatus === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
                                    </span>
                                </div>
                            </div>

                            <div className="payment-methods">
                                <h3>Phương thức thanh toán hỗ trợ</h3>
                                <div className="payment-method-list">
                                    <div className="payment-method">
                                        <div className="method-icon">
                                            <Smartphone size={20} />
                                        </div>
                                        <div className="method-details">
                                            <h4>Ngân hàng di động</h4>
                                            <p>Internet Banking, Mobile Banking</p>
                                        </div>
                                    </div>
                                    <div className="payment-method">
                                        <div className="method-icon">
                                            <CreditCard size={20} />
                                        </div>
                                        <div className="method-details">
                                            <h4>Ví điện tử</h4>
                                            <p>Momo, ZaloPay, ViettelPay</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="support-section">
                                <div className="section-header">
                                    <Info size={24} />
                                    <h3 style={{ color: "black" }}>Hỗ trợ</h3>
                                </div>
                                <div className="support-info">
                                    <p>Nếu gặp vấn đề trong quá trình thanh toán, vui lòng liên hệ:</p>
                                    <div className="contact-info">
                                        <p>Hotline: 1900 1234</p>
                                        <p>Email: support@boostea.vn</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PaymentQR;