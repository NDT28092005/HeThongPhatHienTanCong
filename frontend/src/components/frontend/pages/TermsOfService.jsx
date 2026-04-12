import React from 'react';
import { Container } from 'react-bootstrap';
import { FaFileContract, FaShoppingCart, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import '../../../styles/policy.css';

const TermsOfService = () => {
    return (
        <>
            <Header />
            <div className="policy-page">
                <Container>
                    <div className="policy-header">
                        <FaFileContract className="policy-icon" />
                        <h1 className="policy-title">Điều Khoản Sử Dụng</h1>
                        <p className="policy-subtitle">
                            Quy định và điều khoản khi sử dụng dịch vụ của chúng tôi
                        </p>
                    </div>

                    <div className="policy-content">
                        {/* Chấp nhận điều khoản */}
                        <section className="policy-section">
                            <h2 className="section-title">1. Chấp Nhận Điều Khoản</h2>
                            <div className="section-content">
                                <p>
                                    Bằng việc truy cập và sử dụng website <strong>Boostea</strong>, 
                                    bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này. 
                                    Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ của chúng tôi.
                                </p>
                            </div>
                        </section>

                        {/* Định nghĩa */}
                        <section className="policy-section">
                            <h2 className="section-title">2. Định Nghĩa</h2>
                            <div className="section-content">
                                <ul>
                                    <li><strong>"Chúng tôi", "Công ty":</strong> Chỉ Boostea và các đối tác được ủy quyền</li>
                                    <li><strong>"Bạn", "Khách hàng":</strong> Người sử dụng website và dịch vụ của chúng tôi</li>
                                    <li><strong>"Website":</strong> Trang web boostea.vn và các trang liên quan</li>
                                    <li><strong>"Sản phẩm":</strong> Các sản phẩm trà trái cây sấy thăng hoa được bán trên website</li>
                                    <li><strong>"Dịch vụ":</strong> Tất cả các dịch vụ được cung cấp bởi chúng tôi</li>
                                </ul>
                            </div>
                        </section>

                        {/* Đăng ký tài khoản */}
                        <section className="policy-section">
                            <h2 className="section-title">3. Đăng Ký Tài Khoản</h2>
                            <div className="section-content">
                                <h3>3.1. Yêu cầu:</h3>
                                <ul>
                                    <li>Bạn phải từ 18 tuổi trở lên hoặc có sự đồng ý của người giám hộ</li>
                                    <li>Cung cấp thông tin chính xác, đầy đủ khi đăng ký</li>
                                    <li>Chịu trách nhiệm bảo mật thông tin đăng nhập</li>
                                    <li>Thông báo ngay cho chúng tôi nếu phát hiện tài khoản bị xâm nhập</li>
                                </ul>

                                <h3>3.2. Quyền và nghĩa vụ:</h3>
                                <ul>
                                    <li>Bạn có quyền sử dụng tài khoản để mua sắm và quản lý đơn hàng</li>
                                    <li>Không được sử dụng tài khoản cho mục đích bất hợp pháp</li>
                                    <li>Chúng tôi có quyền đình chỉ hoặc xóa tài khoản nếu vi phạm điều khoản</li>
                                </ul>
                            </div>
                        </section>

                        {/* Đặt hàng và thanh toán */}
                        <section className="policy-section">
                            <h2 className="section-title">
                                <FaShoppingCart className="section-icon" />
                                4. Đặt Hàng Và Thanh Toán
                            </h2>
                            <div className="section-content">
                                <h3>4.1. Quy trình đặt hàng:</h3>
                                <ol>
                                    <li>Chọn sản phẩm và thêm vào giỏ hàng</li>
                                    <li>Kiểm tra thông tin đơn hàng</li>
                                    <li>Điền thông tin giao hàng</li>
                                    <li>Chọn phương thức thanh toán</li>
                                    <li>Xác nhận đơn hàng</li>
                                </ol>

                                <h3>4.2. Xác nhận đơn hàng:</h3>
                                <ul>
                                    <li>Đơn hàng chỉ được xác nhận sau khi chúng tôi gọi điện xác nhận</li>
                                    <li>Chúng tôi có quyền từ chối đơn hàng nếu sản phẩm hết hàng hoặc thông tin không hợp lệ</li>
                                    <li>Giá sản phẩm có thể thay đổi, giá cuối cùng là giá tại thời điểm xác nhận đơn hàng</li>
                                </ul>

                                <h3>4.3. Phương thức thanh toán:</h3>
                                <ul>
                                    <li>Thanh toán khi nhận hàng (COD)</li>
                                    <li>Chuyển khoản ngân hàng</li>
                                    <li>Thanh toán qua ví điện tử</li>
                                    <li>Thẻ tín dụng/ghi nợ</li>
                                </ul>
                            </div>
                        </section>

                        {/* Giá cả và sản phẩm */}
                        <section className="policy-section">
                            <h2 className="section-title">5. Giá Cả Và Sản Phẩm</h2>
                            <div className="section-content">
                                <h3>5.1. Giá sản phẩm:</h3>
                                <ul>
                                    <li>Giá được hiển thị trên website là giá bán lẻ (đã bao gồm VAT nếu có)</li>
                                    <li>Chúng tôi có quyền thay đổi giá mà không cần thông báo trước</li>
                                    <li>Giá áp dụng cho đơn hàng là giá tại thời điểm xác nhận đơn hàng</li>
                                </ul>

                                <h3>5.2. Mô tả sản phẩm:</h3>
                                <ul>
                                    <li>Chúng tôi cố gắng mô tả chính xác nhất có thể về sản phẩm</li>
                                    <li>Màu sắc có thể khác một chút so với hình ảnh do điều kiện hiển thị</li>
                                    <li>Nếu sản phẩm không đúng mô tả, bạn có quyền đổi trả</li>
                                </ul>

                                <h3>5.3. Tình trạng hàng hóa:</h3>
                                <ul>
                                    <li>Chúng tôi cố gắng duy trì số lượng hàng tồn kho chính xác</li>
                                    <li>Nếu sản phẩm hết hàng, chúng tôi sẽ thông báo và đề xuất sản phẩm thay thế</li>
                                    <li>Bạn có quyền hủy đơn hàng nếu không muốn chờ hàng về</li>
                                </ul>
                            </div>
                        </section>

                        {/* Đổi trả và hoàn tiền */}
                        <section className="policy-section">
                            <h2 className="section-title">
                                <FaCheckCircle className="section-icon" />
                                6. Đổi Trả Và Hoàn Tiền
                            </h2>
                            <div className="section-content">
                                <h3>6.1. Điều kiện đổi trả:</h3>
                                <ul>
                                    <li>Sản phẩm còn nguyên vẹn, chưa sử dụng</li>
                                    <li>Còn hạn sử dụng ít nhất 80%</li>
                                    <li>Có hóa đơn mua hàng</li>
                                    <li>Yêu cầu đổi trả trong vòng 7 ngày kể từ ngày nhận hàng</li>
                                </ul>

                                <h3>6.2. Trường hợp được đổi trả:</h3>
                                <ul>
                                    <li>Sản phẩm không đúng với mô tả</li>
                                    <li>Sản phẩm bị lỗi do nhà sản xuất</li>
                                    <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển</li>
                                    <li>Giao nhầm sản phẩm</li>
                                </ul>

                                <h3>6.3. Trường hợp không được đổi trả:</h3>
                                <ul>
                                    <li>Sản phẩm đã qua sử dụng</li>
                                    <li>Hết hạn đổi trả (quá 7 ngày)</li>
                                    <li>Không có hóa đơn mua hàng</li>
                                    <li>Sản phẩm bị hư hỏng do lỗi của khách hàng</li>
                                </ul>

                                <h3>6.4. Quy trình hoàn tiền:</h3>
                                <ul>
                                    <li>Hoàn tiền trong vòng 3-5 ngày làm việc sau khi nhận được sản phẩm trả lại</li>
                                    <li>Tiền sẽ được hoàn về phương thức thanh toán ban đầu</li>
                                    <li>Phí vận chuyển không được hoàn lại (trừ trường hợp lỗi từ phía chúng tôi)</li>
                                </ul>
                            </div>
                        </section>

                        {/* Trách nhiệm */}
                        <section className="policy-section">
                            <h2 className="section-title">
                                <FaExclamationTriangle className="section-icon" />
                                7. Trách Nhiệm Và Giới Hạn
                            </h2>
                            <div className="section-content">
                                <h3>7.1. Trách nhiệm của chúng tôi:</h3>
                                <ul>
                                    <li>Cung cấp sản phẩm đúng chất lượng như cam kết</li>
                                    <li>Giao hàng đúng thời gian đã hẹn</li>
                                    <li>Bảo vệ thông tin khách hàng</li>
                                    <li>Hỗ trợ khách hàng khi có vấn đề</li>
                                </ul>

                                <h3>7.2. Trách nhiệm của khách hàng:</h3>
                                <ul>
                                    <li>Cung cấp thông tin chính xác khi đặt hàng</li>
                                    <li>Thanh toán đầy đủ theo thỏa thuận</li>
                                    <li>Nhận hàng đúng thời gian đã hẹn</li>
                                    <li>Kiểm tra hàng hóa trước khi nhận</li>
                                </ul>

                                <h3>7.3. Giới hạn trách nhiệm:</h3>
                                <ul>
                                    <li>Chúng tôi không chịu trách nhiệm về thiệt hại gián tiếp, ngẫu nhiên</li>
                                    <li>Trách nhiệm tối đa không vượt quá giá trị đơn hàng</li>
                                    <li>Không chịu trách nhiệm về sự cố do lỗi kỹ thuật ngoài tầm kiểm soát</li>
                                </ul>
                            </div>
                        </section>

                        {/* Sở hữu trí tuệ */}
                        <section className="policy-section">
                            <h2 className="section-title">8. Sở Hữu Trí Tuệ</h2>
                            <div className="section-content">
                                <p>
                                    Tất cả nội dung trên website bao gồm logo, hình ảnh, văn bản, thiết kế 
                                    đều thuộc quyền sở hữu của Boostea hoặc được cấp phép sử dụng.
                                </p>
                                <ul>
                                    <li>Không được sao chép, sử dụng lại nội dung mà không có sự cho phép</li>
                                    <li>Không được sử dụng logo, thương hiệu cho mục đích thương mại</li>
                                    <li>Vi phạm sẽ bị xử lý theo quy định pháp luật</li>
                                </ul>
                            </div>
                        </section>

                        {/* Thay đổi điều khoản */}
                        <section className="policy-section">
                            <h2 className="section-title">9. Thay Đổi Điều Khoản</h2>
                            <div className="section-content">
                                <p>
                                    Chúng tôi có quyền cập nhật, thay đổi các điều khoản này bất cứ lúc nào. 
                                    Các thay đổi sẽ có hiệu lực ngay sau khi được đăng tải trên website.
                                </p>
                                <p>
                                    Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi được xem như 
                                    bạn đã chấp nhận các điều khoản mới.
                                </p>
                            </div>
                        </section>

                        {/* Luật áp dụng */}
                        <section className="policy-section">
                            <h2 className="section-title">10. Luật Áp Dụng</h2>
                            <div className="section-content">
                                <p>
                                    Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. 
                                    Mọi tranh chấp sẽ được giải quyết thông qua thương lượng, 
                                    nếu không thành công sẽ được đưa ra Tòa án có thẩm quyền tại Việt Nam.
                                </p>
                            </div>
                        </section>

                        {/* Liên hệ */}
                        <section className="policy-section contact-section">
                            <h2 className="section-title">11. Liên Hệ</h2>
                            <div className="section-content">
                                <p>Nếu bạn có câu hỏi về điều khoản sử dụng, vui lòng liên hệ:</p>
                                <ul>
                                    <li><strong>Email:</strong> legal@boostea.vn</li>
                                    <li><strong>Hotline:</strong> 1900 1234</li>
                                    <li><strong>Địa chỉ:</strong> [Địa chỉ công ty]</li>
                                </ul>
                                <p>
                                    <strong>Lần cập nhật cuối:</strong> {new Date().toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </section>
                    </div>
                </Container>
            </div>
            <Footer />
        </>
    );
};

export default TermsOfService;

