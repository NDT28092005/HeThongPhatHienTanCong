import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { 
    FaTruck, 
    FaGift, 
    FaHeadset, 
    FaShieldAlt,
    FaLeaf,
    FaAward,
    FaRecycle
} from 'react-icons/fa';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import '../../../styles/services.css';

const Services = () => {
    const services = [
        {
            icon: <FaTruck />,
            title: 'Giao Hàng Nhanh',
            description: 'Giao hàng toàn quốc trong 24-48h. Miễn phí ship cho đơn hàng trên 500.000đ',
            details: [
                'Giao hàng nội thành: 24 giờ',
                'Giao hàng liên tỉnh: 48-72 giờ',
                'Miễn phí vận chuyển cho đơn hàng trên 500.000đ',
                'Đóng gói cẩn thận, đảm bảo chất lượng sản phẩm'
            ]
        },
        {
            icon: <FaGift />,
            title: 'Quà Tặng & Combo',
            description: 'Nhiều combo ưu đãi và quà tặng hấp dẫn cho khách hàng thân thiết',
            details: [
                'Combo trà trái cây với giá ưu đãi',
                'Quà tặng kèm cho đơn hàng đầu tiên',
                'Chương trình tích điểm đổi quà',
                'Ưu đãi đặc biệt cho khách hàng VIP'
            ]
        },
        {
            icon: <FaHeadset />,
            title: 'Hỗ Trợ 24/7',
            description: 'Đội ngũ tư vấn chuyên nghiệp, sẵn sàng hỗ trợ bạn mọi lúc mọi nơi',
            details: [
                'Hotline: 1900 1234 (24/7)',
                'Email: support@boostea.vn',
                'Chat trực tuyến trên website',
                'Tư vấn miễn phí về sản phẩm'
            ]
        },
        {
            icon: <FaShieldAlt />,
            title: 'Đổi Trả Dễ Dàng',
            description: 'Chính sách đổi trả linh hoạt trong vòng 7 ngày nếu sản phẩm không đúng mô tả',
            details: [
                'Đổi trả miễn phí trong 7 ngày',
                'Hoàn tiền 100% nếu không hài lòng',
                'Sản phẩm phải còn nguyên vẹn, chưa sử dụng',
                'Hỗ trợ đổi size, đổi vị nếu có'
            ]
        },
        {
            icon: <FaLeaf />,
            title: 'Sản Phẩm Tự Nhiên',
            description: '100% nguyên liệu tự nhiên, không chất bảo quản, an toàn cho sức khỏe',
            details: [
                'Trái cây tươi ngon, được tuyển chọn kỹ lưỡng',
                'Công nghệ sấy thăng hoa giữ nguyên dinh dưỡng',
                'Không chất bảo quản, không phẩm màu',
                'Được kiểm định chất lượng nghiêm ngặt'
            ]
        },
        {
            icon: <FaAward />,
            title: 'Chất Lượng Đảm Bảo',
            description: 'Cam kết chất lượng sản phẩm tốt nhất, đạt tiêu chuẩn vệ sinh an toàn thực phẩm',
            details: [
                'Chứng nhận VSATTP',
                'Quy trình sản xuất khép kín',
                'Kiểm tra chất lượng từng lô hàng',
                'Bảo hành chất lượng sản phẩm'
            ]
        }
    ];

    return (
        <>
            <Header />
            <div className="services-page">
                {/* Hero Section */}
                <section className="services-hero">
                    <Container>
                        <div className="hero-content">
                            <h1 className="hero-title">
                                <FaLeaf className="hero-icon" />
                                Dịch Vụ Của Chúng Tôi
                            </h1>
                            <p className="hero-subtitle">
                                Cam kết mang đến trải nghiệm tốt nhất cho khách hàng
                            </p>
                        </div>
                    </Container>
                </section>

                {/* Services Grid */}
                <section className="services-grid-section">
                    <Container>
                        <Row>
                            {services.map((service, index) => (
                                <Col md={6} lg={4} key={index} className="mb-4">
                                    <Card className="service-card">
                                        <Card.Body>
                                            <div className="service-icon">
                                                {service.icon}
                                            </div>
                                            <Card.Title className="service-title">
                                                {service.title}
                                            </Card.Title>
                                            <Card.Text className="service-description">
                                                {service.description}
                                            </Card.Text>
                                            <ul className="service-details">
                                                {service.details.map((detail, idx) => (
                                                    <li key={idx}>{detail}</li>
                                                ))}
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </section>

                {/* Why Choose Us */}
                <section className="why-choose-section">
                    <Container>
                        <div className="section-header">
                            <h2 className="section-title">Tại Sao Chọn Chúng Tôi?</h2>
                        </div>
                        <Row>
                            <Col md={4}>
                                <div className="feature-box">
                                    <FaRecycle className="feature-icon" />
                                    <h3>Bền Vững</h3>
                                    <p>Bao bì thân thiện môi trường, quy trình sản xuất bền vững</p>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="feature-box">
                                    <FaAward className="feature-icon" />
                                    <h3>Chất Lượng</h3>
                                    <p>Sản phẩm được kiểm định chất lượng nghiêm ngặt</p>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="feature-box">
                                    <FaHeadset className="feature-icon" />
                                    <h3>Hỗ Trợ</h3>
                                    <p>Đội ngũ chăm sóc khách hàng chuyên nghiệp, tận tâm</p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default Services;

