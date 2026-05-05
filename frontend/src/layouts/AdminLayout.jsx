import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/admin.css";
import axiosInstance from "../api/axios";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  FolderTree,
  Package,
  Gift,
  Image,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  X
} from "lucide-react";

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/orders", label: "Đơn Hàng", icon: ShoppingCart },
  { path: "/admin/users", label: "Người Dùng", icon: Users },
  { path: "/admin/categories", label: "Danh Mục", icon: FolderTree },
  { path: "/admin/products", label: "Sản Phẩm", icon: Package },
  { path: "/admin/gifts", label: "Quà Tặng", icon: Gift },
  { path: "/admin/sliders", label: "Sliders", icon: Image },
  { path: "/admin/testimonials", label: "Đánh Giá", icon: MessageSquare },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout");
    } catch {
      // Continue with local cleanup even if API fails
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  return (
    <div className={`admin-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="logo-container">
            <Shield className="logo-icon" size={32} />
            {!collapsed && <span className="logo-text">AdminShield</span>}
          </div>
          <button className="collapse-btn desktop-collapse" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button className="close-btn mobile-close" onClick={() => setMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive ? "active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : ""}
                  >
                    <Icon size={22} className="nav-icon" />
                    {!collapsed && <span className="nav-text">{item.label}</span>}
                    {isActive && <div className="active-indicator" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-link logout-link" style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
            <LogOut size={22} className="nav-icon" />
            {!collapsed && <span className="nav-text">Đăng Xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="breadcrumb">
              <span className="page-title">
                {menuItems.find(item =>
                  location.pathname === item.path || location.pathname.startsWith(item.path + "/")
                )?.label || "Dashboard"}
              </span>
            </div>
          </div>
          <div className="header-right">
            <div className="admin-avatar">
              <span>A</span>
            </div>
            <span className="admin-name">Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
