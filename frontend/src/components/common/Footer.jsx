import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import "../../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">

        <div className="footer-col">
          <h6 className="footer-title">Boostea</h6>
          <p className="footer-desc">
            Trà trái cây sấy thăng hoa – giữ trọn vị nguyên bản từ thiên nhiên 🍃
          </p>
        </div>

        <div className="footer-col">
          <h6 className="footer-title">Khám phá</h6>
          <ul>
            <li><Link to="/about">Giới thiệu</Link></li>
            <li><Link to="/products">Sản phẩm</Link></li>
            <li><Link to="/services">Dịch vụ</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h6 className="footer-title">Hỗ trợ</h6>
          <ul>
            <li><Link to="/shipping-policy">Chính sách giao hàng</Link></li>
            <li><Link to="/privacy-policy">Bảo mật thông tin</Link></li>
            <li><Link to="/terms-of-service">Điều khoản sử dụng</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h6 className="footer-title">Kết nối với chúng tôi</h6>
          <div className="footer-social">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
          </div>

          <p className="footer-contact"><FaPhoneAlt />  0946403788</p>
          <p className="footer-contact"><FaEnvelope /> support@boostea.vn</p>
        </div>
      </div>

      <div className="footer-bottom">
        © 2025 Boostea. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
