import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import "../../../styles/cart.css";

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axiosInstance.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = res.data.items || [];
      setCart(items);
      // Initially select all items
      setSelectedItems(items.map(item => item.id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    try {
      const token = localStorage.getItem("token");

      await axiosInstance.put(
        `/cart/update`,
        { item_id: itemId, quantity: quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchCart(); // refresh state
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");

      await axiosInstance.delete(`/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item.id));
    }
  };

  const getSelectedItemsData = () => {
    return cart.filter(item => selectedItems.includes(item.id));
  };

  const getSelectedTotal = () => {
    return cart
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.quantity * item.price_at_time, 30000);
  };

  const getSelectedItemsCount = () => {
    return cart
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="cart-loading">
          <div className="spinner"></div>
          <p>Đang tải giỏ hàng...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="cart-page">
        <div className="container">
          <div className="cart-header">
            <div className="cart-title">
              <h1>Giỏ hàng của bạn</h1>
            </div>
            <div className="cart-count">
              <span>{cart.length}</span> sản phẩm
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">
                <ShoppingBag size={64} />
              </div>
              <h2>Giỏ hàng trống</h2>
              <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
              <Link to="/products" className="btn-primary">
                <ShoppingBag size={18} />
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <>
              {/* Select All Controls */}
              <div className="select-all-container">
                <div className="select-all-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === cart.length && cart.length > 0}
                      onChange={toggleSelectAll}
                    />
                    <div className="checkbox-custom">
                      {selectedItems.length === cart.length && cart.length > 0 && <Check size={14} />}
                    </div>
                    <span style={{ color: 'black' }}>Chọn tất cả ({selectedItems.length}/{cart.length})</span>
                  </label>
                </div>
              </div>

              <div className="cart-items">
                {cart.map((item) => (
                  <div
                    className={`cart-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                    key={item.id}
                  >
                    {/* Hàng trên: Checkbox và Actions */}
                    <div className="item-header">
                      <div className="item-checkbox">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                          />
                          <div className="checkbox-custom">
                            {selectedItems.includes(item.id) && <Check size={14} />}
                          </div>
                        </label>
                      </div>

                      <div className="item-actions">
                        <button
                          className="remove-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Hàng giữa: Hình ảnh và thông tin chi tiết */}
                    <div className="item-content">
                      <div className="item-image">
                        <img src={item.product_image} alt={item.product_name} />
                      </div>

                      <div className="item-details">
                        <h3>{item.product_name}</h3>
                        <div className="item-price">
                          <span className="current-price">
                            {item.price_at_time.toLocaleString()} ₫
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hàng dưới: Số lượng và tổng tiền */}
                    <div className="item-footer">
                      <div className="item-quantity">
                        <span className="quantity-label">Số lượng:</span>
                        <div className="quantity-control">
                          <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity === 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="item-total">
                        <span className="total-label">Thành tiền:</span>
                        <span className="total-price">
                          {(item.quantity * item.price_at_time).toLocaleString()} ₫
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-content">
                  <h3>Tóm tắt đơn hàng</h3>

                  <div className="summary-row">
                    <span>Sản phẩm đã chọn:</span>
                    <span>{getSelectedItemsCount()} sản phẩm</span>
                  </div>

                  <div className="summary-row">
                    <span>Tạm tính:</span>
                    <span>{(getSelectedTotal() - 30000).toLocaleString()} ₫</span>
                  </div>
                  <div className="summary-row">
                    <span>Phí vận chuyển:</span>
                    <span>30.000 đ</span>
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-row total">
                    <span>Tổng cộng:</span>
                    <span>{getSelectedTotal().toLocaleString()} ₫</span>
                  </div>

                  <Link
                    to="/checkout"
                    state={{ selectedItems: getSelectedItemsData() }}
                    className={`btn-checkout ${selectedItems.length === 0 ? 'disabled' : ''}`}
                    onClick={(e) => {
                      if (selectedItems.length === 0) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Tiến hành thanh toán
                    <ArrowRight size={18} />
                  </Link>

                  <Link to="/products" className="continue-shopping">
                    ← Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;