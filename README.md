# Boostea - Antoan Tea Shop E-Commerce Platform

<p align="center">
  <img src="frontend/public/logo.png" alt="Boostea Logo" width="200"/>
</p>

<p align="center">
  Hệ thống thương mại điện tử trà sữa với Laravel, React & Machine Learning Security
</p>

---

## Mục Lục

- [Giới Thiệu](#giới-thiệu)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt](#cài-đặt)
- [Chạy Ứng Dụng](#chạy-ứng-dụng)
- [Cấu Hình](#cấu-hình)
- [API Endpoints](#api-endpoints)
- [Tính Năng](#tính-năng)
- [ML Security](#ml-security)
- [Database](#database)
- [Frontend](#frontend)
- [Đóng Góp](#đóng-góp)

---

## Giới Thiệu

**Boostea** là một nền tảng thương mại điện tử bán trà sữa, được xây dựng với:

- **Backend**: Laravel 9.x (PHP 8.0+) - API RESTful
- **Frontend**: React 19 + Vite - Giao diện người dùng
- **ML Service**: FastAPI (Python) - Phát hiện tấn công bảo mật
- **Database**: MySQL
- **Authentication**: Laravel Sanctum (JWT)

### Các Tính Năng Chính

- Mua sắm sản phẩm với giỏ hàng
- Thanh toán đa phương thức (COD, Chuyển khoản VietQR)
- Quản lý đơn hàng
- Tài khoản người dùng với Google OAuth
- Dashboard quản trị toàn diện
- Hệ thống bảo mật ML phát hiện tấn công HTTP

---

## Cấu Trúc Dự Án

```
antoan/
├── backend/                 # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Admin/          # Admin controllers
│   │   │   │   └── Api/            # API controllers
│   │   │   └── Middleware/
│   │   │       ├── MLSecurityMiddleware.php
│   │   │       ├── IsAdmin.php
│   │   │       └── CorsMiddleware.php
│   │   └── Models/                 # Eloquent models
│   ├── config/                     # Laravel config
│   ├── routes/api.php             # API routes
│   └── database/migrations/        # Database migrations
│
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── api/                  # Axios configuration
│   │   ├── components/
│   │   │   ├── admin/            # Admin components
│   │   │   ├── common/           # Shared components
│   │   │   └── frontend/         # Customer pages
│   │   ├── context/              # React Context (Auth)
│   │   ├── layouts/              # Layouts
│   │   └── styles/               # CSS files
│   └── vite.config.js
│
├── Fastapi/                 # Python ML Service
│   ├── app/
│   │   ├── main.py               # FastAPI app
│   │   ├── routers/              # API routes
│   │   └── services/             # ML services
│   ├── exports/                  # Trained ML models
│   └── requirements.txt
│
└── README.md
```

---

## Yêu Cầu Hệ Thống

### Backend
- **PHP**: 8.0 hoặc cao hơn
- **Composer**: Phiên bản mới nhất
- **MySQL**: 5.7+ hoặc MariaDB 10.3+
- **Web Server**: Apache (XAMPP) hoặc Nginx

### Frontend
- **Node.js**: 18+ LTS
- **npm**: 9+ hoặc yarn

### ML Service
- **Python**: 3.9+
- **pip**: Phiên bản mới nhất

---

## Cài Đặt

### 1. Clone Repository

```bash
git clone <repository-url>
cd antoan
```

### 2. Backend (Laravel)

```bash
cd backend

# Cài đặt dependencies
composer install

# Copy file cấu hình
cp .env.example .env

# Tạo application key
php artisan key:generate

# Tạo database trong MySQL
# Vào phpMyAdmin, tạo database tên: laravel

# Chỉnh sửa .env với thông tin database của bạn:
# DB_DATABASE=laravel
# DB_USERNAME=root
# DB_PASSWORD=

# Chạy migrations và seeders
php artisan migrate
php artisan db:seed

# Tạo symbolic link cho storage
php artisan storage:link
```

### 3. Frontend (React)

```bash
cd frontend

# Cài đặt dependencies
npm install

# Copy file cấu hình
cp .env.example .env
# Hoặc tạo file .env với nội dung:
# VITE_API_URL=http://localhost:8001/api
```

### 4. ML Service (FastAPI)

```bash
cd Fastapi

# Tạo virtual environment (khuyến nghị)
python -m venv venv

# Active virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

---

## Chạy Ứng Dụng

### Chạy Backend (Laravel)

```bash
cd backend

# Chạy development server
php artisan serve
# Server sẽ chạy tại http://localhost:8001

# Hoặc sử dụng XAMPP
# Đặt thư mục backend vào htdocs và chạy Apache
```

### Chạy Frontend (React)

```bash
cd frontend

# Development mode
npm run dev
# Server sẽ chạy tại http://localhost:5173

# Production build
npm run build
npm run preview
```

### Chạy ML Service (FastAPI)

```bash
cd Fastapi

# Development mode (auto-reload)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Server sẽ chạy tại http://localhost:8000
```

### Chạy Tất Cả Cùng Lúc

Bạn cần chạy cả 3 services để ứng dụng hoạt động đầy đủ:

| Service | URL | Port |
|---------|-----|------|
| Laravel Backend | http://localhost:8001 | 8001 |
| React Frontend | http://localhost:5173 | 5173 |
| FastAPI ML | http://localhost:8000 | 8000 |

**Thứ tự khởi động khuyến nghị:**
1. MySQL Database
2. ML Service (FastAPI) - port 8000
3. Backend (Laravel) - port 8001
4. Frontend (React) - port 5173

---

## Cấu Hình

### Backend (.env)

```env
APP_NAME=Boostea
APP_ENV=local
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=true
APP_URL=http://localhost:8001

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=

# ML Security
SECURITY_MODEL=random_forest
ML_API_URL=http://localhost:8000/api/v1/security/predict

# Mail Configuration (cho email verification)
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@boostea.com"
MAIL_FROM_NAME="${APP_NAME}"

# Google OAuth (tùy chọn)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8001/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### ML Service

Không cần file .env, service sử dụng các đường dẫn tương đối.

### CORS Configuration

Để cho phép frontend truy cập backend, chỉnh sửa `backend/config/cors.php`:

```php
'allowed_origins' => [
    'http://localhost:5173',
    'http://localhost:3000',
    // Thêm các origin khác nếu cần
],
```

---

## API Endpoints

### Authentication (Xác thực)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/register` | Đăng ký tài khoản | Không |
| POST | `/api/login` | Đăng nhập | Không |
| POST | `/api/logout` | Đăng xuất | Có |
| GET | `/api/user/me` | Lấy thông tin user hiện tại | Có |
| POST | `/api/user/update-profile` | Cập nhật profile | Có |
| POST | `/api/auth/google/callback` | Google OAuth callback | Không |

### Products (Sản phẩm)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Danh sách sản phẩm (phân trang) | Không |
| GET | `/api/products/{id}` | Chi tiết sản phẩm | Không |
| GET | `/api/products/{id}/reviews` | Đánh giá sản phẩm | Không |
| CRUD | `/api/admin/products` | Quản lý sản phẩm | Admin |

### Categories (Danh mục)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | Danh sách danh mục | Không |
| CRUD | `/api/admin/categories` | Quản lý danh mục | Admin |

### Cart (Giỏ hàng)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cart` | Lấy giỏ hàng | Có |
| POST | `/api/cart/add` | Thêm vào giỏ hàng | Có |
| PUT | `/api/cart/update` | Cập nhật số lượng | Có |
| DELETE | `/api/cart/remove/{id}` | Xóa sản phẩm | Có |
| DELETE | `/api/cart/clear` | Xóa toàn bộ giỏ hàng | Có |

### Checkout & Orders (Thanh toán & Đơn hàng)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/checkout` | Tạo đơn hàng | Có |
| POST | `/api/payment-success` | Xác nhận thanh toán | Có |
| GET | `/api/orders` | Danh sách đơn hàng của tôi | Có |
| GET | `/api/admin/orders` | Tất cả đơn hàng | Admin |
| PUT | `/api/admin/orders/{id}/status` | Cập nhật trạng thái | Admin |

### Gifts (Quà tặng)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/homepage/featured-gifts` | Quà tặng nổi bật | Không |
| CRUD | `/api/admin/gifts` | Quản lý quà tặng | Admin |

### Homepage Content

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/homepage/categories` | Danh mục cho homepage | Không |
| GET | `/api/homepage/sliders` | Sliders banner | Không |
| GET | `/api/homepage/testimonials` | Testimonials | Không |

### Admin Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Thống kê dashboard | Admin |
| GET | `/api/admin/security/logs` | Logs tấn công | Admin |
| GET | `/api/admin/security/model-preference` | ML model hiện tại | Admin |
| POST | `/api/admin/security/model-preference` | Đổi ML model | Admin |

---

## Tính Năng

### Người Dùng

- [x] Đăng ký / Đăng nhập bằng email
- [x] Đăng nhập bằng Google OAuth
- [x] Xác thực email
- [x] Quản lý profile
- [x] Xem lịch sử đơn hàng
- [x] Giỏ hàng persistent (lưu khi đăng nhập)
- [x] Thanh toán COD
- [x] Thanh toán chuyển khoản VietQR
- [x] Đếm ngược thời gian thanh toán

### Quản Trị

- [x] Dashboard với thống kê
- [x] CRUD Users
- [x] CRUD Categories
- [x] CRUD Products (với gallery, mô tả chi tiết)
- [x] CRUD Gifts
- [x] CRUD Sliders
- [x] CRUD Testimonials
- [x] Quản lý đơn hàng (cập nhật trạng thái)
- [x] Quản lý đánh giá sản phẩm
- [x] ML Security Dashboard

### Bảo Mật

- [x] JWT Authentication (Sanctum)
- [x] Role-based Access Control
- [x] ML-based Attack Detection
- [x] CORS Configuration
- [x] XSS Protection
- [x] CSRF Protection

---

## ML Security

### Giới Thiệu

Hệ thống ML Security sử dụng Machine Learning để phát hiện các tấn công HTTP như:

- SQL Injection
- XSS (Cross-Site Scripting)
- Command Injection
- Path Traversal
- SSRF
- NoSQL Injection
- LDAP Injection
- SSTI (Server-Side Template Injection)

### Các Model ML

| Model | Accuracy | Use Case |
|-------|----------|----------|
| Random Forest | 92.6% | Mặc định, recommended |
| Decision Tree | 91.9% | Fast inference |
| Gradient Boosting | 92.2% | High accuracy |
| K-Nearest Neighbors | 91.5% | Balanced |
| Neural Network (MLP) | 90.3% | Complex patterns |
| Support Vector (SVC) | 78.7% | Baseline |

### Cách Hoạt Động

1. Request đến Laravel backend
2. Middleware kiểm tra path:
   - Nếu là static asset (`/css`, `/js`, etc.) → Skip
   - Nếu là whitelist path → Skip
   - Nếu không → Gửi đến ML Service
3. ML Service phân tích URL và trả về:
   - `status`: "normal" hoặc "attack"
   - `confidence`: Độ tin cậy (0-1)
   - `model_used`: Model được sử dụng
4. Nếu phát hiện tấn công → Trả về 403 Forbidden
5. Log được ghi vào database `attack_logs`

### Đổi ML Model

Trong Admin Dashboard, chọn ML model từ dropdown:
```javascript
// Gọi API để đổi model
POST /api/admin/security/model-preference
{
  "model": "gradient_boosting"
}
```

### Feature Extraction

ML service trích xuất 28 features từ request:

**URL Features:**
- Số lượng dots
- Số lượng thư mục
- Độ dài URL
- Số lượng parameters
- Từ khóa đáng ngờ (union, select, script, etc.)
- Các ký tự encoding đặc biệt

---

## Database

### Tables

```
users
├── id
├── name
├── email
├── email_verified_at
├── password
├── google_id
├── role (admin/user)
├── avatar
└── timestamps

products
├── id
├── category_id
├── name
├── slug
├── price
├── original_price
├── stock
├── featured
├── image_url
└── timestamps

categories
├── id
├── name
├── slug
├── image_url
└── timestamps

orders
├── id
├── user_id
├── order_code
├── customer_name
├── customer_phone
├── customer_address
├── payment_method (cod/bank)
├── total_price
├── status (pending/processing/paid/completed/cancelled)
├── expires_at (cho bank payment)
└── timestamps

order_items
├── id
├── order_id
├── product_id
├── quantity
├── price
└── timestamps

carts / cart_items
├── id / cart_id, product_id
├── user_id
├── status (0=active, 1=checked_out)
├── quantity, price_at_time
└── timestamps

gifts
├── id
├── name
├── price
├── image_url
├── featured
└── timestamps

sliders
├── id
├── title
├── image_url
├── redirect_url
├── order (thứ tự hiển thị)
└── timestamps

testimonials
├── id
├── name
├── content
├── rating (1-5)
├── avatar_url
└── timestamps

product_reviews
├── id
├── product_id
├── user_id
├── rating
├── content
├── status (pending/approved/rejected)
└── timestamps

attack_logs
├── id
├── ip_address
├── url
├── method
├── model_used
├── confidence
├── user_agent
└── timestamps
```

### Relationships

```
User (1) ── (N) Orders
User (1) ── (N) Carts
Category (1) ── (N) Products
Category (1) ── (N) Gifts
Product (1) ── (N) OrderItems
Product (1) ── (N) ProductReviews
Product (1) ── (N) ProductImages
Product (1) ── (1) ProductDescription
Order (1) ── (N) OrderItems
```

---

## Frontend

### Cấu Trúc Components

```
frontend/src/components/
├── admin/
│   ├── pages/
│   │   ├── AdminDashboard.jsx      # Dashboard + Attack logs
│   │   └── LoginAdmin.jsx          # Admin login
│   ├── Categories/
│   │   ├── CategoriesList.jsx     # List view
│   │   └── CategoryForm.jsx        # Create/Edit form
│   ├── Products/
│   │   ├── ProductList.jsx
│   │   ├── ProductForm.jsx
│   │   └── ProductReviewManagement.jsx
│   ├── Gifts/
│   │   ├── GiftsList.jsx
│   │   └── GiftForm.jsx
│   ├── Sliders/
│   │   ├── SliderList.jsx
│   │   └── SliderForm.jsx
│   ├── Testimonials/
│   │   ├── TestimonialsList.jsx
│   │   └── TestimonialForm.jsx
│   ├── Users/
│   │   ├── UsersList.jsx
│   │   └── UserForm.jsx
│   ├── OrderManagement.jsx          # Order list + details
│   └── PrivateAdminRoute.jsx       # Route protection
│
├── common/
│   ├── Header.jsx                   # Navigation header
│   ├── Footer.jsx                   # Footer
│   ├── Content.jsx                  # Main content wrapper
│   └── Loader.jsx                   # Loading spinner
│
└── frontend/pages/
    ├── Home.jsx                     # Homepage
    ├── Products.jsx                 # Product listing
    ├── ProductDetail.jsx           # Single product
    ├── CartPage.jsx                 # Shopping cart
    ├── CheckoutPage.jsx             # Checkout form
    ├── PaymentQR.jsx                # VietQR payment
    ├── MyOrders.jsx                 # Order history
    ├── Profile.jsx                 # User profile
    ├── Login.jsx                    # User login
    ├── Register.jsx                # User registration
    ├── VerifyEmail.jsx              # Email verification
    ├── About.jsx                   # About page
    ├── Services.jsx                # Services page
    ├── ShippingPolicy.jsx           # Shipping info
    ├── PrivacyPolicy.jsx            # Privacy policy
    └── TermsOfService.jsx           # Terms of service
```

### Authentication Flow

```
1. User đăng nhập → /api/login
2. Backend trả về token + user data
3. Frontend lưu vào localStorage:
   - token
   - user (JSON string)
4. AuthProvider kiểm tra user:
   - Gọi /admin/me để xác định admin
   - Gọi /user/me để lấy user thường
5. Context cập nhật state
6. Protected routes kiểm tra quyền
```

### State Management

- **AuthContext**: User authentication state
- **Component State**: Local state với useState
- **localStorage**: Persistent data (token, cart)

---


## Giấy Phép

Dự án này được phát triển cho mục đích học tập

<p align="center">
  Made with ❤️ by tù túng team
</p>
