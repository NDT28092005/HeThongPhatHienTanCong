import React, { useEffect, useState, useContext } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Container from 'react-bootstrap/Container';
import { FaBars, FaUser, FaSignOutAlt, FaCog, FaShoppingCart } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from "../../api/axios";
import "../../styles/header.css";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, setUser } = useContext(AuthContext);

    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);  // ✅ state cart count

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // ✅ Lấy số lượng sản phẩm trong giỏ hàng
    const fetchCartCount = async () => {
        if (!localStorage.getItem("token")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axiosInstance.get("/cart", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCartCount(res.data.items.length);
        } catch (error) {
            console.error("Lỗi lấy giỏ hàng:", error);
        }
    };

    useEffect(() => {
        fetchCartCount();
    }, [user]);  // khi login hoặc logout thì cập nhật giỏ hàng

    // ✅ Sync user từ localStorage khi component mount
    useEffect(() => {
        const syncUserFromStorage = () => {
            const storedUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");
            
            if (token && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    // Format avatar URL if needed
                    if (parsedUser.avatar && !parsedUser.avatar.startsWith("http")) {
                        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
                        parsedUser.avatar = `${baseUrl}/storage/${parsedUser.avatar}`;
                    }
                    // Chỉ set user nếu chưa có hoặc khác với user hiện tại
                    setUser(prevUser => {
                        if (!prevUser || prevUser.id !== parsedUser.id) {
                            return parsedUser;
                        }
                        return prevUser;
                    });
                } catch (error) {
                    console.error("Error parsing user from localStorage:", error);
                }
            } else if (!token) {
                // Nếu không có token, clear user
                setUser(null);
            }
        };

        // Sync ngay khi mount
        syncUserFromStorage();

        // Listen for storage changes (khi login từ tab khác hoặc khi localStorage thay đổi)
        const handleStorageChange = (e) => {
            if (e.key === 'user' || e.key === 'token') {
                syncUserFromStorage();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Custom event để sync khi login trong cùng tab
        const handleUserUpdate = () => {
            syncUserFromStorage();
        };
        
        window.addEventListener('userUpdated', handleUserUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userUpdated', handleUserUpdate);
        };
    }, [setUser]); // Chỉ phụ thuộc vào setUser (stable function)

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setCartCount(0);
        navigate("/");
    };

    // Hàm scroll to top khi click NavLink
    const handleNavClick = (path) => {
        navigate(path);
        // Scroll to top với smooth behavior sau khi navigate
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 100);
    };

    // Scroll to top khi route thay đổi
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [location.pathname]);

    return (
        <Navbar expand="lg" className={`header ${scrolled ? "header-shadow" : ""}`} sticky="top">
            <Container className="header-container">
                <Navbar.Brand className="header-logo" onClick={() => handleNavClick("/")}>
                    <span><img src="/logo.png" alt="Boostea" style={{ height: '60px', marginRight: '8px', background:"none" }} /> Boos<span style={{color:"red"}}>Tea</span></span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" className="mobile-toggle">
                    <FaBars />
                </Navbar.Toggle>

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="header-menu me-auto">
                        <Nav.Link 
                            onClick={() => handleNavClick("/")}
                            className={location.pathname === "/" ? "active" : ""}
                        >
                            Trang Chủ
                        </Nav.Link>
                        <Nav.Link 
                            onClick={() => handleNavClick("/products")}
                            className={location.pathname === "/products" ? "active" : ""}
                        >
                            Tất Cả Sản Phẩm
                        </Nav.Link>
                        <Nav.Link 
                            onClick={() => handleNavClick("/about")}
                            className={location.pathname === "/about" ? "active" : ""}
                        >
                            Về Chúng Tôi
                        </Nav.Link>
                        <Nav.Link 
                            onClick={() => handleNavClick("/orders")}
                            className={location.pathname === "/orders" ? "active" : ""}
                        >
                            Đơn Hàng
                        </Nav.Link>
                    </Nav>

                    <div className="header-actions">
                        {/* Cart Button ✅ */}
                        <Button className="cart-btn" onClick={() => handleNavClick("/cart")}>
                            <FaShoppingCart />
                            {cartCount > 0 && (
                                <span className="cart-count">{cartCount}</span>
                            )}
                        </Button>

                        {user ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle className="user-dropdown-toggle">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="user-avatar" />
                                    ) : (
                                        <div className="user-avatar-placeholder">
                                            <FaUser />
                                        </div>
                                    )}
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end">
                                    <Dropdown.Item onClick={() => handleNavClick("/profile")}>
                                        <FaUser /> Tài khoản của tôi
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleNavClick("/orders")}>
                                        <FaShoppingCart /> Đơn hàng của tôi
                                    </Dropdown.Item>
                                    {user.role === "admin" && (
                                        <Dropdown.Item onClick={() => handleNavClick("/admin")}>
                                            <FaCog /> Quản trị
                                        </Dropdown.Item>
                                    )}
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>
                                        <FaSignOutAlt /> Đăng xuất
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <Button className="btn-login" onClick={() => handleNavClick("/login")}>
                                Đăng Nhập
                            </Button>
                        )}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
