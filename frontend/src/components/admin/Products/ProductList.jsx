import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axios";

export default function ProductList() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        axiosInstance.get("/admin/products")
            .then(res => setProducts(res.data.data ?? res.data))
            .catch(err => console.error(err));
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

        await axiosInstance.delete(`/admin/products/${id}`);
        setProducts(products.filter(item => item.id !== id)); // ✅ auto update UI
    };

    return (
        <div className="container">
            <h2>📦 Quản lý sản phẩm</h2>

            <Link to="/admin/products/create" className="btn btn-primary">
                ➕ Thêm sản phẩm
            </Link>

            <table className="table">
                <thead>
                    <tr>
                        <th>Ảnh</th><th>ID</th><th>Tên</th><th>Danh mục</th>
                        <th>Giá</th><th>Giá gốc</th><th>Featured</th><th>Tồn kho</th><th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>
                                {product.image_url && (
                                    <img src={product.image_url} height="60" />
                                )}
                            </td>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.category?.name}</td>
                            <td>{product.price.toLocaleString()} đ</td>
                            <td>{product.original_price?.toLocaleString() ?? "-"}</td>
                            <td>{product.featured ? "✅" : "❌"}</td>
                            <td>{product.stock}</td>
                            <td>
                                <Link to={`/admin/products/edit/${product.id}`} className="btn btn-warning">✏️</Link>
                                <Link to={`/admin/products/${product.id}/reviews`} className="btn btn-info btn-sm">
                                    Reviews
                                </Link>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(product.id)}
                                >🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
