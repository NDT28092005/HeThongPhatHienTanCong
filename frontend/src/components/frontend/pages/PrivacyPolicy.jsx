import React from 'react';
import { Container } from 'react-bootstrap';
import { FaShieldAlt, FaLock, FaUserShield, FaDatabase } from 'react-icons/fa';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import '../../../styles/policy.css';

const PrivacyPolicy = () => {
    return (
        <>
            <Header />
            <div className="policy-page">
                <Container>
                    <div className="policy-header">
                        <FaShieldAlt className="policy-icon" />
                        <h1 className="policy-title">Chính Sách Bảo Mật Thông Tin</h1>
                        <p className="policy-subtitle">
                            Cam kết bảo vệ thông tin cá nhân của khách hàng
                        </p>
                    </div>

                    <div className="policy-content">
                        {/* Giới thiệu */}
                        <section className="policy-section">
                            <h2 className="section-title">1. Giới Thiệu</h2>
                            <div className="section-content">
                                <p>
                                    Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng. 
                                    Chính sách này mô tả cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ 
                                    thông tin của bạn khi sử dụng dịch vụ của chúng tôi.
                                </p>
                            </div>
                        </section>

                        {/* Thông tin thu thập */}
                        <section className="policy-section">
                            <h2 className="section-title">
                                <FaDatabase className="section-icon" />
                                2. Thông Tin Chúng Tôi Thu Thập
                            </h2>
                            <div className="section-content">
                                <h3>2.1. Thông tin cá nhân:</h3>
                                <ul>
                                    <li>Họ và tên</li>
                                    <li>Số điện thoại</li>
                                    <li>Địa chỉ email</li>
                                    <li>Địa chỉ giao hàng</li>
                                    <li>Ngày sinh (nếu cung cấp)</li>
                                </ul>

                                <h3>2.2. Thông tin thanh toán:</h3>
                                <ul>
                                    <li>Thông tin thẻ tín dụng/ghi nợ (được mã hóa và bảo mật)</li>
                                    <li>Thông tin tài khoản ngân hàng (nếu sử dụng)</li>
                                    <li>Lịch sử giao dịch</li>
                                </ul>

                                <h3>2.3. Thông tin kỹ thuật:</h3>
                                <ul>
                                    <li>Địa chỉ IP</li>
                                    <li>Loại trình duyệt và thiết bị</li>
                                    <li>Thông tin cookie</li>
                                    <li>Lịch sử truy cập website</li>
                                </ul>
                            </div>
                        </section>

                        {/* Mục đích sử dụng */}
                        <section className="policy-section">
                            <h2 className="section-title">3. Mục Đích Sử Dụng Thông Tin</h2>
                            <div className="section-content">
                                <p>Chúng tôi sử dụng thông tin của bạn cho các mục đích sau:</p>
                                <ul>
                                    <li>Xử lý và giao hàng đơn đặt hàng</li>
                                    <li>Gửi thông báo về tình trạng đơn hàng</li>
                                    <li>Cải thiện dịch vụ và trải nghiệm khách hàng</li>
                                    <li>Gửi thông tin khuyến mãi, ưu đãi (nếu bạn đồng ý)</li>
                                    <li>Phân tích và thống kê để cải thiện website</li>
                                    <li>Bảo vệ quyền lợi và an toàn của khách hàng</li>
                                    <li>Tuân thủ các yêu cầu pháp lý</li>
                                </ul>
                            </div>
                        </section>

                        {/* Bảo mật thông tin */}
                        <section className="policy-section">
                            <h2 className="section-title">
                                <FaLock className="section-icon" />
                                4. Bảo Mật Thông Tin
                            </h2>
                            <div className="section-content">
                                <p>
                                    Chúng tôi áp dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin của bạn:
                                </p>
                                <ul>
                                    <li><strong>Mã hóa SSL/TLS:</strong> Tất cả dữ liệu được mã hóa khi truyền tải</li>
                                    <li><strong>Bảo mật cơ sở dữ liệu:</strong> Thông tin được lưu trữ an toàn với hệ thống firewall</li>
                                    <li><strong>Kiểm soát truy cập:</strong> Chỉ nhân viên được ủy quyền mới có thể truy cập thông tin</li>
                                    <li><strong>Cập nhật bảo mật:</strong> Thường xuyên cập nhật hệ thống bảo mật</li>
                                    <li><strong>Thanh toán an toàn:</strong> Thông tin thanh toán được xử lý bởi các đối tác uy tín</li>
                                </ul>
                            </div>
                        </section>

                        {/* Chia sẻ thông tin */}
                        <section className="policy-section">
                            <h2 className="section-title">
                                <FaUserShield className="section-icon" />
                                5. Chia Sẻ Thông Tin
                            </h2>
                            <div className="section-content">
                                <p>Chúng tôi cam kết không bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn. 
                                Thông tin chỉ được chia sẻ trong các trường hợp sau:</p>
                                
                                <h3>5.1. Đối tác dịch vụ:</h3>
                                <ul>
                                    <li>Đơn vị vận chuyển (để giao hàng)</li>
                                    <li>Đơn vị thanh toán (để xử lý giao dịch)</li>
                                    <li>Nhà cung cấp dịch vụ công nghệ (để vận hành website)</li>
                                </ul>

                                <h3>5.2. Yêu cầu pháp lý:</h3>
                                <ul>
                                    <li>Khi có yêu cầu từ cơ quan nhà nước có thẩm quyền</li>
                                    <li>Để bảo vệ quyền lợi và an toàn của chúng tôi và khách hàng</li>
                                </ul>

                                <h3>5.3. Với sự đồng ý của bạn:</h3>
                                <ul>
                                    <li>Khi bạn đồng ý chia sẻ thông tin với bên thứ ba</li>
                                </ul>
                            </div>
                        </section>

                        {/* Quyền của khách hàng */}
                        <section className="policy-section">
                            <h2 className="section-title">6. Quyền Của Khách Hàng</h2>
                            <div className="section-content">
                                <p>Bạn có quyền:</p>
                                <ul>
                                    <li>Truy cập và xem thông tin cá nhân của mình</li>
                                    <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
                                    <li>Yêu cầu xóa thông tin cá nhân (trừ thông tin bắt buộc theo quy định pháp luật)</li>
                                    <li>Từ chối nhận email marketing, khuyến mãi</li>
                                    <li>Rút lại sự đồng ý về việc sử dụng thông tin</li>
                                </ul>
                                <p>
                                    Để thực hiện các quyền trên, vui lòng liên hệ với chúng tôi qua email: 
                                    <strong> privacy@boostea.vn</strong>
                                </p>
                            </div>
                        </section>

                        {/* Cookie */}
                        <section className="policy-section">
                            <h2 className="section-title">7. Cookie và Công Nghệ Theo Dõi</h2>
                            <div className="section-content">
                                <p>
                                    Website của chúng tôi sử dụng cookie để cải thiện trải nghiệm người dùng. 
                                    Cookie là các file nhỏ được lưu trên thiết bị của bạn.
                                </p>
                                <h3>7.1. Loại cookie chúng tôi sử dụng:</h3>
                                <ul>
                                    <li><strong>Cookie cần thiết:</strong> Để website hoạt động bình thường</li>
                                    <li><strong>Cookie phân tích:</strong> Để hiểu cách bạn sử dụng website</li>
                                    <li><strong>Cookie quảng cáo:</strong> Để hiển thị quảng cáo phù hợp (nếu bạn đồng ý)</li>
                                </ul>
                                <p>
                                    Bạn có thể tắt cookie trong cài đặt trình duyệt, nhưng điều này có thể ảnh hưởng 
                                    đến chức năng của website.
                                </p>
                            </div>
                        </section>

                        {/* Thay đổi chính sách */}
                        <section className="policy-section">
                            <h2 className="section-title">8. Thay Đổi Chính Sách</h2>
                            <div className="section-content">
                                <p>
                                    Chúng tôi có thể cập nhật chính sách này theo thời gian. 
                                    Mọi thay đổi sẽ được thông báo trên website và có hiệu lực ngay sau khi đăng tải.
                                </p>
                                <p>
                                    <strong>Lần cập nhật cuối:</strong> {new Date().toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </section>

                        {/* Liên hệ */}
                        <section className="policy-section contact-section">
                            <h2 className="section-title">9. Liên Hệ</h2>
                            <div className="section-content">
                                <p>Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ:</p>
                                <ul>
                                    <li><strong>Email:</strong> privacy@boostea.vn</li>
                                    <li><strong>Hotline:</strong> 1900 1234</li>
                                    <li><strong>Địa chỉ:</strong> [Địa chỉ công ty]</li>
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

export default PrivacyPolicy;

