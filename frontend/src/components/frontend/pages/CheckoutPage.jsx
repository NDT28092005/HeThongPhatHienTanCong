import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MapPin,
  CreditCard,
  Truck,
  Shield,
  Package,
  ArrowRight,
  User,
  Mail,
  Phone,
  Home,
  Check
} from "lucide-react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import "../../../styles/checkout.css";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    postal_code: '',
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    // Get selected items from location state or cart
    if (location.state?.selectedItems) {
      setSelectedItems(location.state.selectedItems);
      setCart(location.state.selectedItems);
    } else {
      // Fallback to full cart if no selected items
      fetchCart();
    }
  }, [location.state]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data.items || []);
      setSelectedItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const getTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.quantity * item.price_at_time, 0);
  };

  const getShippingFee = () => {
    return getTotal() >= 500000 ? 0 : 30000; // Free shipping for orders over 500k
  };

  const getGrandTotal = () => {
    return getTotal() + getShippingFee();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const fullAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`;
      const res = await axiosInstance.post(
        "/checkout",
        {
          items: selectedItems,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: fullAddress,
          payment_method: paymentMethod,
          subtotal: getTotal(),
          shipping_fee: getShippingFee(),
          total: getGrandTotal()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      sessionStorage.setItem("order_code", res.data.order_code);
      if (res.data.payment_method === "bank") {
        navigate("/payment", {
          state: {
            qr_url: res.data.qr_url,
            order_id: res.data.order_id,
            amount: res.data.amount,
            order_code: res.data.order_code
          }
        });
      } else {
        navigate("/orders"); // COD -> chuyển về trang đơn ngay
      }

    } catch (err) {
      console.log("🔥 Validation error:", err.response?.data);
      alert(JSON.stringify(err.response?.data, null, 2));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="checkout-loading">
          <div className="spinner"></div>
          <p>Đang tải thông tin thanh toán...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <>
        <Header />
        <div className="checkout-empty">
          <Package size={64} />
          <h3>Không có sản phẩm nào để thanh toán</h3>
          <p>Vui lòng chọn sản phẩm trong giỏ hàng</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/cart")}
          >
            Quay lại giỏ hàng
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-header">
            <h1>Thanh toán</h1>
            <div className="checkout-steps">
              <div className="step active">
                <div className="step-number">1</div>
                <span>Thông tin</span>
              </div>
              <div className="step active">
                <div className="step-number">2</div>
                <span>Thanh toán</span>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <span>Hoàn tất</span>
              </div>
            </div>
          </div>

          <div className="checkout-layout">
            {/* Billing Information */}
            <div className="billing-section">
              <div className="section-header">
                <User size={20} />
                <h2>Thông tin giao hàng</h2>
              </div>

              <form className="billing-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Thành phố</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Quận/Huyện</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phường/Xã</label>
                    <input
                      type="text"
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mã bưu điện</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Ghi chú thêm về đơn hàng..."
                    rows="3"
                  ></textarea>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <div className="section-header">
                <Package size={20} />
                <h2>Đơn hàng của bạn</h2>
              </div>

              <div className="order-items">
                {selectedItems.map((item) => (
                  <div className="order-item" key={item.id}>
                    <div className="item-image">
                      <img src={item.product_image} alt={item.product_name} />
                    </div>
                    <div className="item-details">
                      <h4>{item.product_name}</h4>
                      <p>Số lượng: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      {(item.quantity * item.price_at_time).toLocaleString()} ₫
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span>Tạm tính:</span>
                  <span>{getTotal().toLocaleString()} ₫</span>
                </div>
                <div className="total-row">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {getShippingFee() === 0 ? (
                      <span className="free-shipping">Miễn phí</span>
                    ) : (
                      `${getShippingFee().toLocaleString()} ₫`
                    )}
                  </span>
                </div>
                <div className="total-divider"></div>
                <div className="total-row grand-total">
                  <span>Tổng cộng:</span>
                  <span>{getGrandTotal().toLocaleString()} ₫</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="payment-methods">
                <h3>Phương thức thanh toán</h3>
                <div className="payment-options">
                  <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => handlePaymentMethodChange('cod')}
                    />
                    <div className="payment-info">
                      <Truck size={20} />
                      <div>
                        <strong>Thanh toán khi nhận hàng (COD)</strong>
                        <p>Thanh toán khi nhận được hàng</p>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'bank' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={() => handlePaymentMethodChange('bank')}
                    />
                    <div className="payment-info">
                      <CreditCard size={20} />
                      <div>
                        <strong>Chuyển khoản ngân hàng</strong>
                        <p>Chuyển khoản trước khi giao hàng</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn-checkout"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner-small"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Xác nhận đặt hàng
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="security-info">
                <Shield size={16} />
                <span>Thông tin của bạn được bảo mật</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;