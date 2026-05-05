import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { Plus, Star, Search, Package, Edit2, Trash } from "lucide-react";

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        axiosInstance.get("/admin/products")
            .then(res => {
                const responseData = res.data;
                setProducts(Array.isArray(responseData) ? responseData : (responseData.data ?? []));
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setProducts([]);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

        try {
            await axiosInstance.delete(`/admin/products/${id}`);
            setProducts(products.filter(item => item.id !== id));
        } catch (err) {
            alert("Xóa thất bại!");
            console.error(err);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-info">
                    <div className="header-icon">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1>Quản lý Sản phẩm</h1>
                        <p>Tổng cộng {products.length} sản phẩm</p>
                    </div>
                </div>
                <Link to="/admin/products/create" className="btn btn-primary">
                    <Plus size={20} />
                    Thêm sản phẩm
                </Link>
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="table-container">
                <div className="table-header">
                    <h3>
                        <Package size={20} />
                        Danh sách sản phẩm
                    </h3>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <Package size={60} />
                        <h4>Không tìm thấy sản phẩm</h4>
                        <p>Thử thay đổi từ khóa tìm kiếm</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "60px" }}>Ảnh</th>
                                    <th>ID</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Danh mục</th>
                                    <th>Giá bán</th>
                                    <th>Giá gốc</th>
                                    <th>Tồn kho</th>
                                    <th>Nổi bật</th>
                                    <th style={{ width: "180px" }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="thumb-img"
                                                />
                                            ) : (
                                                <div className="no-image">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className="badge badge-secondary">#{product.id}</span>
                                        </td>
                                        <td>
                                            <span className="product-name">{product.name}</span>
                                        </td>
                                        <td>
                                            <span className="category-tag">
                                                {product.category?.name || "Chưa phân loại"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="price-current">{formatPrice(product.price)}</span>
                                        </td>
                                        <td>
                                            <span className="price-original">
                                                {product.original_price ? formatPrice(product.original_price) : "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`stock-badge ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-stock'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td>
                                            {product.featured ? (
                                                <span className="badge badge-warning">
                                                    <Star size={12} /> Featured
                                                </span>
                                            ) : (
                                                <span className="badge badge-secondary">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/admin/products/edit/${product.id}`}
                                                    className="btn btn-sm btn-info"
                                                    title="Sửa"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                                <Link
                                                    to={`/admin/products/${product.id}/reviews`}
                                                    className="btn btn-sm btn-warning"
                                                    title="Reviews"
                                                >
                                                    <Star size={16} />
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(product.id)}
                                                    title="Xóa"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                    padding: 24px;
                    background: var(--admin-bg-card);
                    border: 1px solid var(--admin-border);
                    border-radius: var(--admin-radius);
                }

                .header-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .header-icon {
                    width: 56px;
                    height: 56px;
                    background: rgba(99, 102, 241, 0.15);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6366f1;
                }

                .header-info h1 {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: var(--admin-text-primary);
                    margin: 0 0 4px 0;
                }

                .header-info p {
                    font-size: 0.9rem;
                    color: var(--admin-text-secondary);
                    margin: 0;
                }

                .search-container {
                    position: relative;
                    margin-bottom: 20px;
                }

                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--admin-text-muted);
                }

                .search-input {
                    width: 100%;
                    padding: 14px 16px 14px 48px;
                    background: var(--admin-bg-card);
                    border: 1px solid var(--admin-border);
                    border-radius: 10px;
                    color: var(--admin-text-primary);
                    font-size: 0.95rem;
                    transition: all 0.3s;
                }

                .search-input:focus {
                    outline: none;
                    border-color: var(--admin-primary);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
                }

                .search-input::placeholder {
                    color: var(--admin-text-muted);
                }

                .table-responsive {
                    overflow-x: auto;
                }

                .product-name {
                    font-weight: 500;
                    color: var(--admin-text-primary);
                }

                .category-tag {
                    display: inline-block;
                    padding: 4px 10px;
                    background: rgba(139, 92, 246, 0.15);
                    color: #a855f7;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                .price-current {
                    font-weight: 600;
                    color: #10b981;
                }

                .price-original {
                    color: var(--admin-text-muted);
                    text-decoration: line-through;
                    font-size: 0.85rem;
                }

                .stock-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 32px;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.8rem;
                }

                .stock-badge.in-stock {
                    background: rgba(16, 185, 129, 0.15);
                    color: #10b981;
                }

                .stock-badge.low-stock {
                    background: rgba(245, 158, 11, 0.15);
                    color: #f59e0b;
                }

                .stock-badge.out-stock {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }

                .action-buttons {
                    display: flex;
                    gap: 8px;
                }

                .no-image {
                    width: 50px;
                    height: 50px;
                    background: var(--admin-bg-hover);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--admin-text-muted);
                }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 20px;
                    color: var(--admin-text-secondary);
                }

                .loading-container .loading-spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid var(--admin-border);
                    border-top-color: var(--admin-primary);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin-bottom: 16px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        gap: 16px;
                        text-align: center;
                    }

                    .header-info {
                        flex-direction: column;
                    }

                    .action-buttons {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    );
}
