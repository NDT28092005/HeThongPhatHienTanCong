import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../api/axios";
export default function ProductForm({ mode }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [previewImages, setPreviewImages] = useState([]); // ✅ preview gallery

    // ✅ luôn định nghĩa đầy đủ các field
    const [form, setForm] = useState({
        name: "",
        category_id: "",
        price: "",
        original_price: "",
        stock: "",
        featured: false,
        image: null,         // ảnh chính (File)
        images: [],          // ✅ danh sách ảnh phụ
        old_image: "",
        description: "",
    });

    // ✅ load categories từ API
    useEffect(() => {
        axiosInstance.get("/admin/categories")
            .then(res => setCategories(res.data.data ?? res.data));
    }, []);

    // ✅ Load product nếu editing
    useEffect(() => {
        if (mode === "edit" && id) {
            axiosInstance.get(`/admin/products/${id}`)
                .then(res => {
                    // ✅ Xử lý cả trường hợp data được wrap trong res.data.data
                    const data = res.data.data || res.data;

                    setForm({
                        name: data.name ?? "",
                        category_id: data.category_id ? String(data.category_id) : "",
                        price: data.price != null ? String(data.price) : "",
                        original_price: data.original_price != null ? String(data.original_price) : "",
                        stock: data.stock != null ? String(data.stock) : "",
                        featured: data.featured == 1 || data.featured === true,
                        description: data.description ?? "",
                        image: null,
                        images: [],
                        old_image: data.image_url ?? "",
                    });

                    if (data.image_url) {
                        setPreviewImage(data.image_url);
                    }

                    // ✅ preview các ảnh phụ
                    if (data.images && data.images.length > 0) {
                        setPreviewImages(data.images.map(img => img.image_url));
                    }
                })
                .catch(err => {
                    console.error("Error loading product:", err);
                    alert("Không thể tải thông tin sản phẩm. Vui lòng thử lại.");
                });
        }
    }, [id, mode]);

    // ✅ Hàm kiểm tra kích thước file (max 5120 KB = 5MB)
    const validateFileSize = (file, maxSizeKB = 5120) => {
        const maxSizeBytes = maxSizeKB * 1024; // Chuyển KB sang bytes
        if (file.size > maxSizeBytes) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const maxSizeMB = (maxSizeKB / 1024).toFixed(2);
            return {
                valid: false,
                message: `File "${file.name}" quá lớn (${fileSizeMB} MB). Kích thước tối đa cho phép là ${maxSizeMB} MB (${maxSizeKB} KB).`
            };
        }
        return { valid: true };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("name", form.name);
            
            // ✅ Xử lý category_id: chỉ append nếu có giá trị, không append empty string
            if (form.category_id && form.category_id !== "") {
                formData.append("category_id", form.category_id);
            }
            
            // ✅ Xử lý price: required, phải là số
            if (!form.price || form.price === "") {
                alert("Vui lòng nhập giá bán");
                return;
            }
            formData.append("price", parseInt(form.price) || 0);
            
            // ✅ Xử lý stock: required, phải là số
            if (!form.stock || form.stock === "") {
                alert("Vui lòng nhập số lượng tồn kho");
                return;
            }
            formData.append("stock", parseInt(form.stock) || 0);
            
            // ✅ Xử lý original_price: nullable, chỉ append nếu có giá trị
            if (form.original_price && form.original_price !== "") {
                formData.append("original_price", parseInt(form.original_price) || 0);
            }
            
            formData.append("featured", form.featured ? 1 : 0);
            
            // ✅ Xử lý description: nullable
            if (form.description) {
                formData.append("description", form.description);
            }

            // ✅ Kiểm tra kích thước ảnh chính
            if (form.image instanceof File) {
                const validation = validateFileSize(form.image);
                if (!validation.valid) {
                    alert(validation.message);
                    return;
                }
                formData.append("image", form.image);
            }

            // ✅ Kiểm tra kích thước ảnh phụ (gallery)
            if (form.images.length > 0) {
                for (let file of form.images) {
                    const validation = validateFileSize(file);
                    if (!validation.valid) {
                        alert(validation.message);
                        return;
                    }
                    formData.append("images[]", file);
                }
            }

            if (mode === "create") {
                await axiosInstance.post("/admin/products", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                await axiosInstance.post(
                    `/admin/products/${id}?_method=PUT`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
            }

            navigate("/admin/products");
        } catch (error) {
            console.error("Error submitting form:", error);
            
            // ✅ Hiển thị lỗi validation từ server
            if (error.response && error.response.status === 422) {
                const errors = error.response.data.errors || error.response.data;
                let errorMessage = "Lỗi validation:\n";
                
                if (typeof errors === 'object') {
                    Object.keys(errors).forEach(key => {
                        if (Array.isArray(errors[key])) {
                            errorMessage += `- ${key}: ${errors[key].join(', ')}\n`;
                        } else {
                            errorMessage += `- ${key}: ${errors[key]}\n`;
                        }
                    });
                } else {
                    errorMessage = error.response.data.message || "Có lỗi xảy ra khi cập nhật sản phẩm";
                }
                
                alert(errorMessage);
            } else {
                alert("Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại.");
            }
        }
    };

    return (
        <div className="container">
            <h2>{mode === "edit" ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm"}</h2>

            <form onSubmit={handleSubmit}>
                <label>Tên sản phẩm</label>
                <input className="input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />

                <label>Danh mục</label>
                <select className="input"
                    value={form.category_id}
                    onChange={e => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">-- chọn danh mục --</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <label>Giá bán</label>
                <input type="number" className="input"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })} />

                <label>Giá gốc</label>
                <input type="number" className="input"
                    value={form.original_price}
                    onChange={e => setForm({ ...form, original_price: e.target.value })} />

                <label>Tồn kho</label>
                <input type="number" className="input"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })} />

                <label>
                    <input type="checkbox"
                        checked={form.featured}
                        onChange={e => setForm({ ...form, featured: e.target.checked })} />
                    Sản phẩm nổi bật
                </label>

                {/* ========== ẢNH CHÍNH ========== */}
                <label>Ảnh chính (tối đa 5MB)</label>
                <input type="file" className="input" accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        
                        // ✅ Kiểm tra kích thước file
                        const validation = validateFileSize(file);
                        if (!validation.valid) {
                            alert(validation.message);
                            e.target.value = ""; // Reset input
                            return;
                        }
                        
                        setForm({ ...form, image: file });
                        setPreviewImage(URL.createObjectURL(file));
                    }} />

                {previewImage && (
                    <img src={previewImage} height="120" style={{ marginTop: 10 }} />
                )}

                {/* ========== ẢNH PHỤ NHIỀU ========== */}
                <label>Ảnh phụ (nhiều ảnh, mỗi ảnh tối đa 5MB)</label>
                <input type="file" className="input" name="images[]" multiple accept="image/*"
                    onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        
                        // ✅ Kiểm tra kích thước từng file
                        for (let file of files) {
                            const validation = validateFileSize(file);
                            if (!validation.valid) {
                                alert(validation.message);
                                e.target.value = ""; // Reset input
                                setForm({ ...form, images: [] });
                                setPreviewImages([]);
                                return;
                            }
                        }
                        
                        setForm({ ...form, images: files });
                        setPreviewImages(files.map(file => URL.createObjectURL(file)));
                    }} />

                {/* Preview gallery */}
                {previewImages.length > 0 && (
                    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                        {previewImages.map((img, i) => (
                            <img key={i} src={img} height="80" />
                        ))}
                    </div>
                )}

                <label>Mô tả (HTML)</label>
                <textarea 
                    className="input"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={15}
                    style={{
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word'
                    }}
                    placeholder="Nhập HTML code ở đây. Ví dụ: &lt;h2&gt;Tiêu đề&lt;/h2&gt;&lt;p&gt;Nội dung&lt;/p&gt;"
                />
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                    💡 Bạn có thể nhập HTML code trực tiếp. HTML sẽ được render khi hiển thị ở trang chi tiết sản phẩm.
                </small>

                <button type="submit" className="btn btn-primary">
                    {mode === "edit" ? "💾 Lưu thay đổi" : "✅ Tạo mới"}
                </button>
            </form>
        </div>
    );
}
