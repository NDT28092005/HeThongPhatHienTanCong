import { Link, Outlet } from "react-router-dom";
import "../styles/admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar bg-dark text-white p-3">
        <h3 className="text-center mb-4">Admin Panel</h3>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link to="/admin/dashboard" className="nav-link text-white">📊 Dashboard</Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/orders" className="nav-link text-white">🛒 Đơn Hàng</Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/users" className="nav-link text-white">👥 Users</Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/categories" className="nav-link text-white">📂 Danh Mục</Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/products" className="nav-link text-white">📦 Sản Phẩm</Link>
          </li>
          <li className="nav-item mb-2">
             <Link to="/admin/gifts" className="nav-link text-white">🎁 Quà Tặng</Link>
          </li>
          <li className="nav-item mb-2">
             <Link to="/admin/sliders" className="nav-link text-white">🖼️ Sliders</Link>
          </li>
          <li className="nav-item mb-2">
             <Link to="/admin/testimonials" className="nav-link text-white">💬 Đánh Giá</Link>
          </li>
          <li className="nav-item mt-4">
            <a href="/logout" className="nav-link text-danger">🚪 Logout</a>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="admin-content p-4 bg-light w-100" style={{ minHeight: "100vh" }}>
        <Outlet />
      </main>
    </div>
  );
}
