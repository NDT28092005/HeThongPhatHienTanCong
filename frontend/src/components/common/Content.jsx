import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../api/axios";
import Carousel from "react-bootstrap/Carousel";
import { ChevronLeft, ChevronRight, Gift, Star, Truck, Shield, Play, Pause, Sparkles, Leaf, Package, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/home.css";

const Content = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [featuredGifts, setFeaturedGifts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Carousel states for different sections
  const [productsPage, setProductsPage] = useState(0);
  const [categoriesPage, setCategoriesPage] = useState(0);
  const [testimonialsPage, setTestimonialsPage] = useState(0);
  
  // Auto-play intervals
  const productsIntervalRef = useRef(null);
  const categoriesIntervalRef = useRef(null);
  const testimonialsIntervalRef = useRef(null);

  // Number of items per page based on screen size
  const [itemsPerPage, setItemsPerPage] = useState({
    products: 3,
    categories: 3,
    testimonials: 3
  });

  // Update items per page based on window width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 576) {
        setItemsPerPage({ products: 1, categories: 2, testimonials: 1 });
      } else if (width < 768) {
        setItemsPerPage({ products: 2, categories: 2, testimonials: 2 });
      } else if (width < 992) {
        setItemsPerPage({ products: 3, categories: 3, testimonials: 2 });
      } else {
        setItemsPerPage({ products: 3, categories: 4, testimonials: 3 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-play for products carousel
  useEffect(() => {
    if (featuredGifts.length > itemsPerPage.products) {
      productsIntervalRef.current = setInterval(() => {
        setProductsPage((prevPage) => 
          (prevPage + 1) % Math.ceil(featuredGifts.length / itemsPerPage.products)
        );
      }, 5000);
    }
    
    return () => {
      if (productsIntervalRef.current) clearInterval(productsIntervalRef.current);
    };
  }, [featuredGifts.length, itemsPerPage.products]);

  // Auto-play for categories carousel
  useEffect(() => {
    if (categories.length > itemsPerPage.categories) {
      categoriesIntervalRef.current = setInterval(() => {
        setCategoriesPage((prevPage) => 
          (prevPage + 1) % Math.ceil(categories.length / itemsPerPage.categories)
        );
      }, 5000);
    }
    
    return () => {
      if (categoriesIntervalRef.current) clearInterval(categoriesIntervalRef.current);
    };
  }, [categories.length, itemsPerPage.categories]);

  // Auto-play for testimonials carousel
  useEffect(() => {
    if (testimonials.length > itemsPerPage.testimonials) {
      testimonialsIntervalRef.current = setInterval(() => {
        setTestimonialsPage((prevPage) => 
          (prevPage + 1) % Math.ceil(testimonials.length / itemsPerPage.testimonials)
        );
      }, 5000);
    }
    
    return () => {
      if (testimonialsIntervalRef.current) clearInterval(testimonialsIntervalRef.current);
    };
  }, [testimonials.length, itemsPerPage.testimonials]);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
    setAutoPlay(false);
  };

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterMessage("");
    setNewsletterLoading(true);

    try {
      const response = await axiosInstance.post("/newsletter/subscribe", {
        email: email
      });

      if (response.data.success) {
        setNewsletterMessage("✅ " + response.data.message);
        setEmail("");
        // Xóa thông báo sau 5 giây
        setTimeout(() => {
          setNewsletterMessage("");
        }, 5000);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau.";
      setNewsletterMessage("❌ " + message);
      setTimeout(() => {
        setNewsletterMessage("");
      }, 5000);
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Hero slides data - ideally this would come from an API
  const [sliders, setSliders] = useState([]);

  /** === CALL API === */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [slidersRes, giftsRes, categoriesRes, testimonialsRes] = await Promise.all([
          axiosInstance.get("/homepage/sliders"),   // ✅ slider API
          axiosInstance.get("/homepage/featured-gifts"),
          axiosInstance.get("/homepage/categories"),
          axiosInstance.get("/homepage/testimonials"),
        ]);

        setSliders(slidersRes.data.data || []);
        setFeaturedGifts(giftsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
        setTestimonials(testimonialsRes.data.data || []);
      } catch (err) {
        console.error("❌ Error loading homepage data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Carousel navigation functions
  const goToProductsPage = (page) => {
    setProductsPage(page);
    if (productsIntervalRef.current) {
      clearInterval(productsIntervalRef.current);
      // Restart auto-play after manual navigation
      productsIntervalRef.current = setInterval(() => {
        setProductsPage((prevPage) => 
          (prevPage + 1) % Math.ceil(featuredGifts.length / itemsPerPage.products)
        );
      }, 5000);
    }
  };

  const goToCategoriesPage = (page) => {
    setCategoriesPage(page);
    if (categoriesIntervalRef.current) {
      clearInterval(categoriesIntervalRef.current);
      // Restart auto-play after manual navigation
      categoriesIntervalRef.current = setInterval(() => {
        setCategoriesPage((prevPage) => 
          (prevPage + 1) % Math.ceil(categories.length / itemsPerPage.categories)
        );
      }, 5000);
    }
  };

  const goToTestimonialsPage = (page) => {
    setTestimonialsPage(page);
    if (testimonialsIntervalRef.current) {
      clearInterval(testimonialsIntervalRef.current);
      // Restart auto-play after manual navigation
      testimonialsIntervalRef.current = setInterval(() => {
        setTestimonialsPage((prevPage) => 
          (prevPage + 1) % Math.ceil(testimonials.length / itemsPerPage.testimonials)
        );
      }, 5000);
    }
  };

  return (
    <div className="home-wrapper">
      {/* HERO SECTION */}
      <section className="hero">
        {sliders.length > 0 ? (
          <Carousel
            activeIndex={index}
            onSelect={handleSelect}
            prevIcon={<ChevronLeft size={40} />}
            nextIcon={<ChevronRight size={40} />}
            interval={autoPlay ? 5000 : null}
            controls={true}
            indicators={true}
          >
            {sliders.map((slide) => (
              <Carousel.Item key={slide.id}>
                <div
                  className="hero-slide"
                  style={{ backgroundImage: `url(${slide.image_url})` }}
                >
                  <div className="hero-overlay"></div>
                  <div className="hero-content">

                    {slide.title && (
                      <>
                        <h1>{slide.title}</h1>
                        {slide.redirect_url && (
                          <a href={slide.redirect_url} className="btn-primary">
                            Khám phá ngay
                          </a>
                        )}
                      </>
                    )}

                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        ) : (
          <p style={{ textAlign: "center", padding: 50 }}>Không có slider nào</p>
        )}

        {/* nút play / pause */}
        <button
          className="autoplay-toggle"
          onClick={toggleAutoPlay}
          aria-label={autoPlay ? "Pause slideshow" : "Play slideshow"}
        >
          {autoPlay ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section featured-products">
        <div className="container">
          <div className="section-header">
            <div className="section-title-container">
              <h3 className="section-title">Sản phẩm nổi bật</h3>
              <div className="title-decoration"></div>
            </div>
            <a href="/products" className="view-all-link">Xem tất cả</a>
          </div>

          {isLoading ? (
            <div className="loading-skeleton">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-card"></div>
              ))}
            </div>
          ) : (
            <div 
              className="custom-carousel-container"
              style={{ '--items-per-page': itemsPerPage.products }}
            >
              <div className="custom-carousel">
                <div 
                  className="carousel-track"
                  style={{ transform: `translateX(-${productsPage * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(featuredGifts.length / itemsPerPage.products) }).map((_, pageIndex) => (
                    <div key={pageIndex} className="carousel-slide">
                      <div className="carousel-items-container">
                        {featuredGifts
                          .slice(pageIndex * itemsPerPage.products, (pageIndex + 1) * itemsPerPage.products)
                          .map((gift) => (
                            <div className="card product-card" key={gift.id}>
                              <div className="product-image-container">
                                <img src={gift.image_url} alt={gift.name} />
                                <div className="product-badges">
                                  {gift.is_new && <span className="product-badge new">Mới</span>}
                                  {gift.discount && <span className="product-badge discount">-{gift.discount}%</span>}
                                </div>
                                
                              </div>
                              <div className="product-info">
                                <h4>{gift.name}</h4>
                                <div className="price-container">
                                  <p className="price">{gift.price.toLocaleString()}đ</p>
                                  {gift.old_price && <p className="old-price">{gift.old_price.toLocaleString()}đ</p>}
                                </div>
                                <button 
                                  className="btn-secondary"
                                  onClick={() => navigate(`/products/${gift.id}`)}
                                >
                                  Mua ngay
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {featuredGifts.length > itemsPerPage.products && (
                <>
                  <button 
                    className="carousel-nav-btn prev" 
                    onClick={() => goToProductsPage((productsPage - 1 + Math.ceil(featuredGifts.length / itemsPerPage.products)) % Math.ceil(featuredGifts.length / itemsPerPage.products))}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    className="carousel-nav-btn next" 
                    onClick={() => goToProductsPage((productsPage + 1) % Math.ceil(featuredGifts.length / itemsPerPage.products))}
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="carousel-indicators">
                    {Array.from({ length: Math.ceil(featuredGifts.length / itemsPerPage.products) }).map((_, i) => (
                      <button 
                        key={i} 
                        className={`indicator ${i === productsPage ? 'active' : ''}`}
                        onClick={() => goToProductsPage(i)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section categories-section bg-light">
        <div className="container">
          <div className="section-header">
            <div className="section-title-container">
              <h3 className="section-title">Danh mục sản phẩm</h3>
              <div className="title-decoration"></div>
            </div>
            <a href="/products" className="view-all-link">Xem tất cả</a>
          </div>

          {isLoading ? (
            <div className="loading-skeleton">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-card category-skeleton"></div>
              ))}
            </div>
          ) : (
            <div 
              className="custom-carousel-container"
              style={{ '--items-per-page': itemsPerPage.categories }}
            >
              <div className="custom-carousel">
                <div 
                  className="carousel-track"
                  style={{ transform: `translateX(-${categoriesPage * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(categories.length / itemsPerPage.categories) }).map((_, pageIndex) => (
                    <div key={pageIndex} className="carousel-slide">
                      <div className="carousel-items-container">
                        {categories
                          .slice(pageIndex * itemsPerPage.categories, (pageIndex + 1) * itemsPerPage.categories)
                          .map((category) => (
                            <div 
                              className="card category-card" 
                              key={category.id}
                              onClick={() => navigate(`/products?category=${category.id}`)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="category-image-container">
                                <img src={category.image_url} alt={category.name} />
                                <div className="category-overlay">
                                  <Leaf size={24} />
                                </div>
                              </div>
                              <div className="category-info">
                                <h4>{category.name}</h4>
                                <span className="product-count">{category.product_count} sản phẩm</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {categories.length > itemsPerPage.categories && (
                <>
                  <button 
                    className="carousel-nav-btn prev" 
                    onClick={() => goToCategoriesPage((categoriesPage - 1 + Math.ceil(categories.length / itemsPerPage.categories)) % Math.ceil(categories.length / itemsPerPage.categories))}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    className="carousel-nav-btn next" 
                    onClick={() => goToCategoriesPage((categoriesPage + 1) % Math.ceil(categories.length / itemsPerPage.categories))}
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="carousel-indicators">
                    {Array.from({ length: Math.ceil(categories.length / itemsPerPage.categories) }).map((_, i) => (
                      <button 
                        key={i} 
                        className={`indicator ${i === categoriesPage ? 'active' : ''}`}
                        onClick={() => goToCategoriesPage(i)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* BENEFIT SECTION */}
      <section className="section benefits-section">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-title-container">
              <h3 className="section-title">Tại sao chọn Boostea?</h3>
              <div className="title-decoration center"></div>
            </div>
          </div>
          <div className="benefit-grid">
            <Benefit icon={<Gift />} title="Quà tặng tinh tế" desc="Thiết kế sang trọng, phù hợp mọi dịp" />
            <Benefit icon={<Star />} title="Trái cây sấy thăng hoa" desc="Giữ nguyên vị & vitamin tự nhiên" />
            <Benefit icon={<Truck />} title="Giao hàng nhanh" desc="Đóng gói cẩn thận, giao hàng toàn quốc" />
            <Benefit icon={<Shield />} title="Đổi trả dễ dàng" desc="7 ngày linh hoạt, hoàn tiền nếu không hài lòng" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials-section bg-light">
        <div className="container">
          <div className="section-header">
            <div className="section-title-container">
              <h3 className="section-title">Khách hàng nói gì?</h3>
              <div className="title-decoration"></div>
            </div>
            <a href="/reviews" className="view-all-link">Xem tất cả đánh giá</a>
          </div>

          {isLoading ? (
            <div className="loading-skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card testimonial-skeleton"></div>
              ))}
            </div>
          ) : (
            <div 
              className="custom-carousel-container"
              style={{ '--items-per-page': itemsPerPage.testimonials }}
            >
              <div className="custom-carousel">
                <div 
                  className="carousel-track"
                  style={{ transform: `translateX(-${testimonialsPage * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(testimonials.length / itemsPerPage.testimonials) }).map((_, pageIndex) => (
                    <div key={pageIndex} className="carousel-slide">
                      <div className="carousel-items-container">
                        {testimonials
                          .slice(pageIndex * itemsPerPage.testimonials, (pageIndex + 1) * itemsPerPage.testimonials)
                          .map((t) => (
                            <div className="testimonial-card" key={t.id}>
                              <div className="testimonial-content">
                                <p>"{t.content}"</p>
                              </div>
                              <div className="testimonial-header">
                                <img src={t.avatar_url} alt={t.name} />
                                <div>
                                  <h6>{t.name}</h6>
                                  <div className="rating">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={16} fill={i < t.rating ? "#FFC107" : "none"} color="#FFC107" />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <p className="testimonial-date">{new Date(t.created_at).toLocaleDateString('vi-VN')}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {testimonials.length > itemsPerPage.testimonials && (
                <>
                  <button 
                    className="carousel-nav-btn prev" 
                    onClick={() => goToTestimonialsPage((testimonialsPage - 1 + Math.ceil(testimonials.length / itemsPerPage.testimonials)) % Math.ceil(testimonials.length / itemsPerPage.testimonials))}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    className="carousel-nav-btn next" 
                    onClick={() => goToTestimonialsPage((testimonialsPage + 1) % Math.ceil(testimonials.length / itemsPerPage.testimonials))}
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="carousel-indicators">
                    {Array.from({ length: Math.ceil(testimonials.length / itemsPerPage.testimonials) }).map((_, i) => (
                      <button 
                        key={i} 
                        className={`indicator ${i === testimonialsPage ? 'active' : ''}`}
                        onClick={() => goToTestimonialsPage(i)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="cta-icon">
              <Package size={32} />
            </div>
            <h3>Đăng ký nhận tin</h3>
            <p>Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt</p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <div className="newsletter-input-wrapper">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={newsletterLoading}
                  className="newsletter-input"
                />
                <button 
                  type="submit" 
                  className="newsletter-btn"
                  disabled={newsletterLoading}
                >
                  {newsletterLoading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    "Đăng ký"
                  )}
                </button>
              </div>
              {newsletterMessage && (
                <div className={`newsletter-message ${newsletterMessage.includes("✅") ? "success" : "error"}`}>
                  {newsletterMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

const Benefit = ({ icon, title, desc }) => (
  <div className="benefit-item">
    <div className="benefit-icon">{icon}</div>
    <h5>{title}</h5>
    <p>{desc}</p>
  </div>
);

export default Content;