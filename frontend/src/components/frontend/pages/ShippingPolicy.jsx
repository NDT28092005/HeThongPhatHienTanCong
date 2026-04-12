import React from 'react';
import { Container } from 'react-bootstrap';
import { FaTruck, FaMapMarkerAlt, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import '../../../styles/policy.css';

const ShippingPolicy = () => {
    return (
        <>
            <Header />
            <div className="policy-page">
                <Container>
                    <div className="policy-header">
                        <FaTruck className="policy-icon" />
                        <h1 className="policy-title">Chính Sách Giao Hàng</h1>
                        <p className="policy-subtitle">
                            Thông tin chi tiết về quy trình và phí vận chuyển
                        </p>
                    </div>

                    <div className="policy-content">
                        {/* Phạm vi giao hàng */}
                        <section className="policy-section">
                            <h2 className="section-title">
                                <FaMapMarkerAlt className="section-icon" />
                                1. Phạm Vi Giao Hàng
                            </h2>
                            <div className="section-content">
                                <p>
                                    Chúng tôi cung cấp dịch vụ giao hàng trên toàn quốc, bao gồm:
                                </p>
                                <ul>
                                    <li><strong>Nội thành:</strong> Các quận/huyện trong thành phố</li>
                                    <li><strong>Liên tỉnh:</strong> Tất cả các tỉnh thành trên toàn quốc</li>
                                    <li><strong>Vùng sâu, vùng xa:</strong> Áp dụng phí vận chuyển đặc biệt</li>
                                </ul>
                            </div>
                        </section>

                        {/* Thời gian giao hàng */}
                        <section className="policy-section">
                            <h2 className="section-title">
                                <FaClock className="section-icon" />
                                2. Thời Gian Giao Hàng
                            </h2>
                            <div className="section-content">
                                <h3>2.1. Giao hàng nội thành:</h3>
                                <ul>
                                    <li>Đơn hàng đặt trước 12h00: Giao trong ngày (24 giờ)</li>
                                    <li>Đơn hàng đặt sau 12h00: Giao ngày hôm sau</li>
                                    <li>Thời gian giao hàng: 8h00 - 20h00 các ngày trong tuần</li>
                                </ul>

                                <h3>2.2. Giao hàng liên tỉnh:</h3>
                                <ul>
                                    <li>Khu vực miền Bắc: 1-2 ngày làm việc</li>
                                    <li>Khu vực miền Trung: 2-3 ngày làm việc</li>
                                    <li>Khu vực miền Nam: 3-5 ngày làm việc</li>
                                    <li>Vùng sâu, vùng xa: 5-7 ngày làm việc</li>
                                </ul>

                                <h3>2.3. Lưu ý:</h3>
                                <ul>
                                    <li>Thời gian giao hàng không tính thứ 7, Chủ nhật và các ngày lễ</li>
                                    <li>Thời gian có thể thay đổi do điều kiện thời tiết hoặc dịch vụ vận chuyển</li>
                                    <li>Chúng tôi sẽ thông báo trước nếu có thay đổi về thời gian giao hàng</li>
                                </ul>
                            </div>
                        </section>

                        {/* Phí vận chuyển */}
                        <section className="policy-section">
                            <h2 className="section-title">
                                <FaMoneyBillWave className="section-icon" />
                                3. Phí Vận Chuyển
                            </h2>
                            <div className="section-content">
                                <h3>3.1. Miễn phí vận chuyển:</h3>
                                <ul>
                                    <li>Đơn hàng có giá trị từ <strong>500.000đ</strong> trở lên</li>
                                    <li>Áp dụng cho tất cả các khu vực giao hàng</li>
                                    <li>Không áp dụng cho các chương trình khuyến mãi khác</li>
                                </ul>

                                <h3>3.2. Phí vận chuyển có thu phí:</h3>
                                <div className="shipping-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Khu vực</th>
                                                <th>Phí vận chuyển</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Nội thành</td>
                                                <td>30.000đ</td>
                                            </tr>
                                            <tr>
                                                <td>Ngoại thành (cùng tỉnh)</td>
                                                <td>40.000đ</td>
                                            </tr>
                                            <tr>
                                                <td>Liên tỉnh (miền Bắc)</td>
                                                <td>50.000đ</td>
                                            </tr>
                                            <tr>
                                                <td>Liên tỉnh (miền Trung)</td>
                                                <td>60.000đ</td>
                                            </tr>
                                            <tr>
                                                <td>Liên tỉnh (miền Nam)</td>
                                                <td>70.000đ</td>
                                            </tr>
                                            <tr>
                                                <td>Vùng sâu, vùng xa</td>
                                                <td>Theo bảng giá của đơn vị vận chuyển</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* Quy trình giao hàng */}
                        <section className="policy-section">
                            <h2 className="section-title">4. Quy Trình Giao Hàng</h2>
                            <div className="section-content">
                                <ol className="process-list">
                                    <li>
                                        <strong>Bước 1:</strong> Xác nhận đơn hàng
                                        <p>Sau khi nhận được đơn hàng, chúng tôi sẽ gọi điện xác nhận trong vòng 2 giờ.</p>
                                    </li>
                                    <li>
                                        <strong>Bước 2:</strong> Chuẩn bị hàng
                                        <p>Đóng gói cẩn thận, đảm bảo sản phẩm không bị hư hỏng trong quá trình vận chuyển.</p>
                                    </li>
                                    <li>
                                        <strong>Bước 3:</strong> Giao hàng
                                        <p>Nhân viên giao hàng sẽ liên hệ trước khi đến để xác nhận địa chỉ và thời gian.</p>
                                    </li>
                                    <li>
                                        <strong>Bước 4:</strong> Kiểm tra và nhận hàng
                                        <p>Khách hàng kiểm tra hàng hóa trước khi thanh toán. Nếu có vấn đề, vui lòng từ chối nhận hàng.</p>
                                    </li>
                                </ol>
                            </div>
                        </section>

                        {/* Lưu ý quan trọng */}
                        <section className="policy-section">
                            <h2 className="section-title">5. Lưu Ý Quan Trọng</h2>
                            <div className="section-content">
                                <ul>
                                    <li>Vui lòng cung cấp địa chỉ chính xác, đầy đủ khi đặt hàng</li>
                                    <li>Người nhận hàng phải có mặt tại địa chỉ giao hàng hoặc ủy quyền cho người khác</li>
                                    <li>Nếu không liên hệ được, đơn hàng sẽ được giao lại vào ngày hôm sau</li>
                                    <li>Sau 3 lần giao hàng không thành công, đơn hàng sẽ bị hủy và hoàn tiền</li>
                                    <li>Chúng tôi không chịu trách nhiệm nếu địa chỉ giao hàng không chính xác do khách hàng cung cấp</li>
                                </ul>
                            </div>
                        </section>

                        {/* Liên hệ */}
                        <section className="policy-section contact-section">
                            <h2 className="section-title">6. Liên Hệ</h2>
                            <div className="section-content">
                                <p>Nếu bạn có bất kỳ thắc mắc nào về chính sách giao hàng, vui lòng liên hệ:</p>
                                <ul>
                                    <li><strong>Hotline:</strong> 0946403788</li>
                                    <li><strong>Email:</strong> support@boostea.vn</li>
                                    <li><strong>Thời gian:</strong> 8h00 - 20h00 (Tất cả các ngày trong tuần)</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </Container>
            </div>
            <Footer />
        </>
    );
};

export default ShippingPolicy;

