import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { 
    FaLeaf, 
    FaHeart, 
    FaFlask, 
    FaAward, 
    FaRecycle, 
    FaSeedling,
    FaCheckCircle
} from 'react-icons/fa';
import '../../../styles/about.css';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
const About = () => {
    const features = [
        {
            icon: <FaLeaf />,
            title: '100% Tự Nhiên',
            description: 'Sử dụng trái cây tươi ngon, không chất bảo quản, không phẩm màu nhân tạo'
        },
        {
            icon: <FaFlask />,
            title: 'Công Nghệ Sấy Thăng Hoa',
            description: 'Giữ nguyên 95% dinh dưỡng và hương vị tự nhiên của trái cây'
        },
        {
            icon: <FaHeart />,
            title: 'Tốt Cho Sức Khỏe',
            description: 'Giàu vitamin, chất xơ và chất chống oxy hóa, hỗ trợ hệ miễn dịch'
        },
        {
            icon: <FaRecycle />,
            title: 'Thân Thiện Môi Trường',
            description: 'Bao bì có thể tái chế, quy trình sản xuất bền vững'
        }
    ];

    const benefits = [
        'Giàu vitamin C, A, E và các khoáng chất thiết yếu',
        'Chứa chất chống oxy hóa mạnh, làm chậm quá trình lão hóa',
        'Hỗ trợ tiêu hóa, tăng cường hệ miễn dịch',
        'Giảm căng thẳng, cải thiện tâm trạng',
        'Không chứa caffeine, phù hợp mọi lứa tuổi',
        'Hương vị tự nhiên, thơm ngon, dễ uống'
    ];

    const processSteps = [
        {
            step: '1',
            title: 'Chọn Lọc Trái Cây',
            description: 'Tuyển chọn những trái cây tươi ngon nhất, đạt chuẩn chất lượng'
        },
        {
            step: '2',
            title: 'Rửa Sạch & Sơ Chế',
            description: 'Rửa sạch, cắt lát đều, loại bỏ hạt và phần không sử dụng'
        },
        {
            step: '3',
            title: 'Sấy Thăng Hoa',
            description: 'Sử dụng công nghệ freeze-drying để giữ nguyên dinh dưỡng'
        },
        {
            step: '4',
            title: 'Đóng Gói',
            description: 'Đóng gói trong môi trường vô trùng, bảo quản chất lượng'
        }
    ];

    return (
        <>
        <Header />
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <Container>
                    <Row className="">
                        <Col lg={6}>
                            <div className="hero-content">
                                <h1 className="hero-title">
                                    <FaSeedling className="hero-icon" />
                                    Về Boostea
                                </h1>
                                <p className="hero-subtitle">
                                    Trà Trái Cây Sấy Thăng Hoa
                                </p>
                                <p className="hero-description">
                                    Chúng tôi tự hào mang đến những sản phẩm trà trái cây sấy thăng hoa 
                                    chất lượng cao, giữ nguyên hương vị và dinh dưỡng tự nhiên. 
                                    Mỗi gói trà là sự kết hợp hoàn hảo giữa công nghệ hiện đại và 
                                    tình yêu với thiên nhiên.
                                </p>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="hero-image">
                                <div className="floating-card card-1">
                                    <FaLeaf />
                                    <span>100% Tự Nhiên</span>
                                </div>
                                <div className="floating-card card-2">
                                    <FaAward />
                                    <span>Chất Lượng Cao</span>
                                </div>
                                <div className="floating-card card-3">
                                    <FaHeart />
                                    <span>Tốt Cho Sức Khỏe</span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section className="about-features">
                <Container>
                    <div className="section-header">
                        <h2 className="section-title">Đặc Điểm Nổi Bật</h2>
                        <p className="section-subtitle">
                            Những lý do bạn nên chọn sản phẩm của chúng tôi
                        </p>
                    </div>
                    <Row>
                        {features.map((feature, index) => (
                            <Col md={6} lg={3} key={index} className="mb-4">
                                <Card className="feature-card">
                                    <Card.Body>
                                        <div className="feature-icon">
                                            {feature.icon}
                                        </div>
                                        <Card.Title className="feature-title">
                                            {feature.title}
                                        </Card.Title>
                                        <Card.Text className="feature-description">
                                            {feature.description}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Benefits Section */}
            <section className="about-benefits">
                <Container>
                    <Row>
                        <Col lg={6}>
                            <div className="benefits-content">
                                <h2 className="benefits-title">
                                    Lợi Ích Sức Khỏe
                                </h2>
                                <p className="benefits-intro">
                                    Trà trái cây sấy thăng hoa không chỉ thơm ngon mà còn mang lại 
                                    nhiều lợi ích tuyệt vời cho sức khỏe của bạn:
                                </p>
                                <ul className="benefits-list">
                                    {benefits.map((benefit, index) => (
                                        <li key={index}>
                                            <FaCheckCircle className="check-icon" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="benefits-image">
                                <div className="benefits-card">
                                    <FaLeaf className="benefits-icon" />
                                    <h3>Dinh Dưỡng Tự Nhiên</h3>
                                    <p>
                                        Công nghệ sấy thăng hoa giúp giữ nguyên 95% 
                                        vitamin và khoáng chất có trong trái cây tươi
                                    </p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Process Section */}
            <section className="about-process">
                <Container>
                    <div className="section-header">
                        <h2 className="section-title">Quy Trình Sản Xuất</h2>
                        <p className="section-subtitle">
                            Từ trái cây tươi đến sản phẩm hoàn chỉnh
                        </p>
                    </div>
                    <Row>
                        {processSteps.map((step, index) => (
                            <Col md={6} lg={3} key={index} className="mb-4">
                                <div className="process-card">
                                    <div className="process-number">{step.step}</div>
                                    <h3 className="process-title">{step.title}</h3>
                                    <p className="process-description">{step.description}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Mission Section */}
            <section className="about-mission">
                <Container>
                    <Row>
                        <Col lg={8} className="mx-auto">
                            <div className="mission-content">
                                <FaSeedling className="mission-icon" />
                                <h2 className="mission-title">Sứ Mệnh Của Chúng Tôi</h2>
                                <p className="mission-text">
                                    Tại Boostea, chúng tôi cam kết mang đến những sản phẩm trà trái cây 
                                    chất lượng cao nhất, được sản xuất bằng công nghệ sấy thăng hoa tiên tiến. 
                                    Mục tiêu của chúng tôi là giúp mọi người dễ dàng tiếp cận với những 
                                    sản phẩm tự nhiên, tốt cho sức khỏe, đồng thời góp phần bảo vệ môi trường 
                                    thông qua quy trình sản xuất bền vững.
                                </p>
                                <p className="mission-text">
                                    Mỗi sản phẩm của chúng tôi đều được chăm chút kỹ lưỡng, từ khâu chọn lựa 
                                    nguyên liệu đến quy trình đóng gói, để đảm bảo bạn nhận được trải nghiệm 
                                    tốt nhất khi thưởng thức.
                                </p>
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

export default About;
