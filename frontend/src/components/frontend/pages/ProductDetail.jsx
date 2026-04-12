import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import {
    ShoppingCart,
    Heart,
    Share2,
    Star,
    Truck,
    Shield,
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    Check,
    Package
} from "lucide-react";
import "../../../styles/productDetail.css";

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        comment: ""
    });
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState("");
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedTab, setSelectedTab] = useState("description");
    const [isLoading, setIsLoading] = useState(true);

    // ✅ Hàm convert text thuần thành HTML (tự động xuống dòng)
    const formatDescription = (text) => {
        if (!text) return "";
        
        // Kiểm tra xem text đã có HTML tags chưa
        const hasHtmlTags = /<[a-z][\s\S]*>/i.test(text);
        
        if (hasHtmlTags) {
            // Nếu đã có HTML, trả về nguyên bản
            return text;
        }
        
        // Nếu là text thuần, convert xuống dòng thành <br> và wrap trong <p>
        return text
            .split('\n\n') // Split theo đoạn (2 xuống dòng)
            .map(paragraph => {
                if (!paragraph.trim()) return '';
                // Convert xuống dòng đơn thành <br>
                const formatted = paragraph
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .join('<br>');
                return `<p>${formatted}</p>`;
            })
            .join('');
    };

    // Zoom states
    const [isZoomed, setIsZoomed] = useState(false);
    const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        fetchReviews();
    }, [id]);

    const fetchReviews = async () => {
        const res = await axiosInstance.get(`/products/${id}/reviews`);
        setReviews(res.data);
    };
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axiosInstance.get(`/admin/products/${id}`);

                // ✅ Xử lý ảnh: lấy từ product_images table và thêm ảnh chính vào đầu
                let images = [];
                
                // Thêm ảnh chính vào đầu nếu có
                if (res.data.image_url) {
                    images.push({ image_url: res.data.image_url });
                }
                
                // Thêm các ảnh phụ từ product_images table
                if (res.data.images && res.data.images.length > 0) {
                    // Lọc bỏ ảnh trùng với ảnh chính (nếu có)
                    const additionalImages = res.data.images.filter(img => 
                        !res.data.image_url || img.image_url !== res.data.image_url
                    );
                    images = [...images, ...additionalImages];
                }

                // Nếu không có ảnh nào, tạo mảng rỗng
                if (images.length === 0) {
                    images = res.data.image_url ? [{ image_url: res.data.image_url }] : [];
                }

                setProduct({ ...res.data, images });
                setMainImage(images.length > 0 ? images[0].image_url : '');

                if (res.data.category_id) {
                    const relatedRes = await axiosInstance.get(`/admin/products`, {
                        params: { category_id: res.data.category_id, limit: 4 },
                    });

                    setRelatedProducts(
                        relatedRes.data.data?.filter((p) => p.id !== parseInt(id)) || []
                    );
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleImageChange = (direction) => {
        const images = product.images;
        const currentIndex = images.findIndex(img => img.image_url === mainImage);

        const newIndex = direction === "next"
            ? (currentIndex + 1) % images.length
            : (currentIndex - 1 + images.length) % images.length;

        setMainImage(images[newIndex].image_url);
    };

    const handleQuantityChange = (type) => {
        setQuantity((prev) => (type === "increase" ? prev + 1 : Math.max(1, prev - 1)));
    };

    // Zoom handlers
    const handleMouseMove = (e) => {
        if (!imageContainerRef.current) return;

        const container = imageContainerRef.current;
        const { left, top, width, height } = container.getBoundingClientRect();

        const x = e.clientX - left;
        const y = e.clientY - top;

        const lensWidth = 150;
        const lensHeight = 150;

        // Calculate lens position, keeping it within bounds
        let lensX = x - lensWidth / 2;
        let lensY = y - lensHeight / 2;

        if (lensX < 0) lensX = 0;
        if (lensY < 0) lensY = 0;
        if (lensX > width - lensWidth) lensX = width - lensWidth;
        if (lensY > height - lensHeight) lensY = height - lensHeight;

        setLensPosition({ x: lensX, y: lensY });

        // Calculate background position for the zoomed image
        const bgX = (x / width) * 100;
        const bgY = (y / height) * 100;

        // Set background position on the lens element directly
        const lens = container.querySelector('.zoom-lens');
        if (lens) {
            lens.style.backgroundPosition = `${bgX}% ${bgY}%`;
        }
    };

    const handleMouseEnter = () => {
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("⚠ Bạn cần đăng nhập để thêm giỏ hàng.");
            return;
        }

        try {
            await axiosInstance.post(
                "/cart/add",
                {
                    product_id: product.id,
                    quantity: quantity,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            alert("✅ Đã thêm vào giỏ hàng!");
        } catch (err) {
            console.error(err);
            alert("❌ Lỗi thêm giỏ hàng, thử lại sau!");
        }
    };

    const handleBuyNow = () => {
        navigate("/checkout");
    };
    const handleSubmitReview = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("⚠ Bạn phải đăng nhập để đánh giá.");
            navigate("/login");
            return;
        }

        try {
            await axiosInstance.post(
                "/reviews",
                {
                    product_id: id,
                    rating: reviewForm.rating,
                    comment: reviewForm.comment
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            alert("✅ Cảm ơn bạn đã đánh giá!");

            setReviewForm({ rating: 5, comment: "" });
        } catch (err) {
            console.error(err);
            alert("❌ Có lỗi xảy ra khi gửi đánh giá.");
        }
    };
    if (isLoading) {
        return (
            <>
                <Header />
                <div className="detail-loading">
                    <div className="spinner"></div>
                    <p>Đang tải sản phẩm...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Header />
                <div className="detail-error">
                    <h3>Không tìm thấy sản phẩm</h3>
                    <button onClick={() => navigate("/products")} className="btn-primary">
                        Quay lại danh sách sản phẩm
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    const discount =
        product.original_price && product.original_price > product.price
            ? Math.round((1 - product.price / product.original_price) * 100)
            : 0;

    return (
        <>
            <Header />
            <div className="product-detail-page">
                <div className="container">
                    {/* Breadcrumb */}
                    <nav className="breadcrumb">
                        <a href="/">Trang chủ</a>
                        <span>/</span>
                        <a href="/products">Sản phẩm</a>
                        <span>/</span>
                        <span className="current">{product.name}</span>
                    </nav>

                    <div className="detail-layout">
                        {/* ---------- Image Section (Gallery) ---------- */}
                        <div className="image-section">
                            <div
                                className="main-image-container"
                                ref={imageContainerRef}
                                onMouseMove={handleMouseMove}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <img className="main-image" src={mainImage} alt={product.name} />

                                {/* Zoom Lens */}
                                <div
                                    className="zoom-lens"
                                    style={{
                                        display: isZoomed ? 'block' : 'none',
                                        left: `${lensPosition.x}px`,
                                        top: `${lensPosition.y}px`,
                                        backgroundImage: `url(${mainImage})`,
                                    }}
                                ></div>

                                {discount > 0 && <span className="discount-badge">-{discount}%</span>}

                                <button
                                    className="image-nav prev"
                                    onClick={() => handleImageChange("prev")}
                                    disabled={product.images.length === 1}
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <button
                                    className="image-nav next"
                                    onClick={() => handleImageChange("next")}
                                    disabled={product.images.length === 1}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <div className="thumbnail-wrapper">
                                {product.images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img.image_url}
                                        alt={`${product.name} ${index}`}
                                        className={`thumbnail ${mainImage === img.image_url ? "active" : ""}`}
                                        onClick={() => setMainImage(img.image_url)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* ---------- Info Section ---------- */}
                        <div className="info-section">
                            <div className="product-header">
                                <h1 className="product-name">{product.name}</h1>
                                <div className="product-rating">
                                    <div className="stars">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < 4 ? "#FFC107" : "none"} color="#FFC107" />
                                        ))}
                                    </div>
                                    <span>(24 đánh giá)</span>
                                </div>
                            </div>

                            <div className="price-section">
                                <div className="current-price">
                                    <span className="price">{product?.price?.toLocaleString() || 0} đ</span>
                                    <span className="price-unit">/ sản phẩm</span>
                                </div>
                                {product.original_price && product.original_price > product.price && (
                                    <div className="original-price">
                                        <span>{product.original_price.toLocaleString()} đ</span>
                                        <span className="save">
                                            Tiết kiệm {(product.original_price - product.price).toLocaleString()} đ
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="product-meta">
                                <div className="meta-item">
                                    <Package size={18} />
                                    <span>Tình trạng: <strong>Còn hàng</strong></span>
                                </div>
                                <div className="meta-item">
                                    <Truck size={18} />
                                    <span>Giao hàng trong 2-3 ngày</span>
                                </div>
                            </div>

                            <div className="quantity-section">
                                <label>Số lượng:</label>
                                <div className="quantity-control">
                                    <button className="quantity-btn" onClick={() => handleQuantityChange("decrease")}>
                                        <Minus size={16} />
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    />
                                    <button className="quantity-btn" onClick={() => handleQuantityChange("increase")}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button className="btn-primary add-to-cart" onClick={handleAddToCart}>
                                    <ShoppingCart size={20} />
                                    Thêm vào giỏ hàng
                                </button>
                                <button className="btn-secondary buy-now" onClick={handleBuyNow}>
                                    Mua ngay
                                </button>
                            </div>

                            {/* <div className="extra-actions">
                                <button className="action-btn"><Heart size={18} /> Yêu thích</button>
                                <button className="action-btn"><Share2 size={18} /> Chia sẻ</button>
                            </div> */}
                        </div>
                    </div>

                    {/* ---------- Tabs ---------- */}
                    <div className="product-tabs">
                        <div className="tab-headers">
                            <button className={`tab-header ${selectedTab === "description" ? "active" : ""}`} onClick={() => setSelectedTab("description")}>
                                Mô tả sản phẩm
                            </button>
                            <button className={`tab-header ${selectedTab === "reviews" ? "active" : ""}`} onClick={() => setSelectedTab("reviews")}>
                                Đánh giá (24)
                            </button>
                        </div>

                        <div className="tab-content">
                            {selectedTab === "description" && (
                                <div className="tab-pane active">
                                    {product.description ? (
                                        <div
                                            className="product-description-content"
                                            dangerouslySetInnerHTML={{ __html: formatDescription(product.description) }}
                                        />
                                    ) : (
                                        <p>Chưa có mô tả cho sản phẩm.</p>
                                    )}
                                </div>
                            )}

                            {selectedTab === "reviews" && (
                                <div className="tab-pane active">
                                    {/* Review Summary */}
                                    <div className="review-summary">
                                        <div className="review-average">
                                            <div className="rating-number">4.5</div>
                                            <div className="stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={18} fill={i < 4.5 ? "#FFC107" : "none"} color="#FFC107" />
                                                ))}
                                            </div>
                                            <div className="total-reviews">24 đánh giá</div>
                                        </div>
                                        <div className="review-distribution">
                                            <div className="rating-bar">
                                                <div className="rating-bar-label">5 sao</div>
                                                <div className="rating-bar-container">
                                                    <div className="rating-bar-fill" style={{ width: '70%' }}></div>
                                                </div>
                                                <div className="rating-bar-count">17</div>
                                            </div>
                                            <div className="rating-bar">
                                                <div className="rating-bar-label">4 sao</div>
                                                <div className="rating-bar-container">
                                                    <div className="rating-bar-fill" style={{ width: '20%' }}></div>
                                                </div>
                                                <div className="rating-bar-count">5</div>
                                            </div>
                                            <div className="rating-bar">
                                                <div className="rating-bar-label">3 sao</div>
                                                <div className="rating-bar-container">
                                                    <div className="rating-bar-fill" style={{ width: '10%' }}></div>
                                                </div>
                                                <div className="rating-bar-count">2</div>
                                            </div>
                                            <div className="rating-bar">
                                                <div className="rating-bar-label">2 sao</div>
                                                <div className="rating-bar-container">
                                                    <div className="rating-bar-fill" style={{ width: '0%' }}></div>
                                                </div>
                                                <div className="rating-bar-count">0</div>
                                            </div>
                                            <div className="rating-bar">
                                                <div className="rating-bar-label">1 sao</div>
                                                <div className="rating-bar-container">
                                                    <div className="rating-bar-fill" style={{ width: '0%' }}></div>
                                                </div>
                                                <div className="rating-bar-count">0</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review Form */}
                                    <div className="review-form">
                                        <h3>Gửi đánh giá của bạn</h3>

                                        <div className="rating-select">
                                            <label>Đánh giá của bạn:</label>
                                            <div className="rating-stars-display">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={20}
                                                        fill={i < reviewForm.rating ? "#FFC107" : "none"}
                                                        color="#FFC107"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="user-info">
                                            <img
                                                src={user?.avatar ?? "/default-avatar.png"}
                                                alt="avatar"
                                                className="avatar-img"
                                            />
                                            <span>{user?.name}</span>
                                        </div>


                                        <label>Nhận xét</label>
                                        <textarea
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                        ></textarea>

                                        <button className="btn-primary" onClick={handleSubmitReview}>
                                            Gửi đánh giá
                                        </button>
                                    </div>

                                    <hr />

                                    {/* Existing Reviews */}
                                    <h3 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>Đánh giá từ khách hàng</h3>

                                    {reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div key={review.id} className="review-item">
                                                <div className="review-header">
                                                    <div className="review-user">
                                                        <div className="review-avatar">
                                                            <img
                                                                src={review.user_avatar_url || "/default-avatar.png"}
                                                                className="avatar-img"
                                                                alt="avatar"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="review-name">{review.user_name}</div>
                                                            <div className="review-date">
                                                                {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="review-rating">
                                                        <div className="stars">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={16} fill={i < review.rating ? "#FFC107" : "none"} color="#FFC107" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="review-content">
                                                    <p>{review.comment}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="reviews-empty">
                                            <Star size={48} />
                                            <h4>Chưa có đánh giá nào</h4>
                                            <p>Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ---------- Related Products ---------- */}
                    {relatedProducts.length > 0 && (
                        <div className="related-products">
                            <h3>Sản phẩm liên quan</h3>
                            <div className="related-grid">
                                {relatedProducts.map((item) => (
                                    <div
                                        className="related-card"
                                        key={item.id}
                                        onClick={() => navigate(`/products/${item.id}`)}
                                    >
                                        <img src={item.image_url} alt={item.name} />
                                        <h4>{item.name}</h4>
                                        <p>{item.price.toLocaleString()} đ</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ProductDetail;