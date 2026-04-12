import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import { Filter, Grid, List, Search, ShoppingCart, Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import "../../../styles/product.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
const Products = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const [isLoading, setIsLoading] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Đọc category từ URL query params khi component mount
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts(selectedCategory, currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory, currentPage]);

    const fetchCategories = async () => {
        try {
            const res = await axiosInstance.get("/admin/categories");
            setCategories(res.data.data ?? res.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchProducts = async (category = "all", page = 1) => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.get("/admin/products", {
                params: {
                    category_id: category,
                    page,
                    search: searchTerm
                }
            });

            setProducts(res.data.data);
            setCurrentPage(res.data.meta.current_page);
            setTotalPages(res.data.meta.last_page);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryClick = (id) => {
        setSelectedCategory(id);
        setCurrentPage(1); // reset về page 1 khi chọn danh mục khác
        // Cập nhật URL với query params
        if (id === "all") {
            setSearchParams({});
        } else {
            setSearchParams({ category: id });
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchProducts(selectedCategory, 1);
    };

    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`pagination-number ${currentPage === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="pagination">
                <button
                    className="pagination-nav"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    <ChevronLeft size={18} />
                </button>

                {startPage > 1 && (
                    <>
                        <button className="pagination-number" onClick={() => handlePageChange(1)}>1</button>
                        {startPage > 2 && <span className="pagination-ellipsis">...</span>}
                    </>
                )}

                {pages}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                        <button className="pagination-number" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
                    </>
                )}

                <button
                    className="pagination-nav"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        );
    };

    return (
        <><Header />
            <div className="product-page">
                <div className="container">
                    <div className="product-layout">
                        {/* ---- Sidebar ---- */}
                        <aside className="sidebar">
                            <div className="sidebar-header">
                                <h3><Filter size={18} /> Bộ lọc</h3>
                            </div>

                            <div className="sidebar-section">
                                <h4>Danh mục</h4>
                                <ul className="category-list">
                                    <li
                                        className={selectedCategory === "all" ? "active" : ""}
                                        onClick={() => handleCategoryClick("all")}
                                    >
                                        Tất cả
                                    </li>

                                    {categories.map(c => (
                                        <li
                                            key={c.id}
                                            className={selectedCategory === c.id ? "active" : ""}
                                            onClick={() => handleCategoryClick(c.id)}
                                        >
                                            {c.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>

                        {/* ---- Product List ---- */}
                        <main className="product-content">
                            <div className="product-toolbar">
                                <form className="search-form" onSubmit={handleSearch}>
                                    <div className="search-input">
                                        <Search size={18} />
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm sản phẩm..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)} />
                                    </div>
                                    <button type="submit" className="search-btn">Tìm kiếm</button>
                                </form>

                                <div className="view-options">
                                    <button
                                        className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                                        onClick={() => setViewMode("list")}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="loading-container">
                                    <div className="spinner"></div>
                                    <p>Đang tải sản phẩm...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📦</div>
                                    <h4>Không có sản phẩm nào</h4>
                                    <p>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                                </div>
                            ) : (
                                <>
                                    <div className={`product-list related-grid ${viewMode === "list" ? "list-view" : "grid-view"}`}>
                                        {products.map(item => (
                                            <div className="product-card" key={item.id}>
                                                <div className="product-image-container">
                                                    <img src={item.image_url} alt={item.name} />
                                                    {item.original_price && item.original_price > item.price && (
                                                        <span className="discount-badge">
                                                            -{Math.round((1 - item.price / item.original_price) * 100)}%
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="product-info">
                                                    <h5>{item.name}</h5>
                                                    <div className="product-rating">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < 4 ? "#FFC107" : "none"} color="#FFC107" />
                                                        ))}
                                                        <span>(12)</span>
                                                    </div>
                                                    <div className="product-price">
                                                        <p className="current-price">{item.price.toLocaleString()} đ</p>
                                                        {item.original_price && item.original_price > item.price && (
                                                            <p className="original-price">{item.original_price.toLocaleString()} đ</p>
                                                        )}
                                                    </div>
                                                    <button className="btn-primary" onClick={() => navigate(`/products/${item.id}`)}>
                                                        Xem chi tiết
                                                    </button>

                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ---- Pagination ---- */}
                                    {totalPages > 1 && renderPagination()}
                                </>
                            )}
                        </main>
                    </div>
                </div>
            </div>
            <Footer /></>
    );
};

export default Products;