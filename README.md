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
  - [Docker (Khuyến nghị)](#docker-khuyến-nghị)
  - [Chạy từng service](#chạy-từng-service)
- [API Endpoints](#api-endpoints)
- [Tính Năng](#tính-năng)
- [ML Security](#ml-security)
- [Database](#database)
- [Docker Commands](#docker-commands)

---

## Giới Thiệu

**Boostea** là nền tảng thương mại điện tử bán trà sữa, được xây dựng với:

| Layer | Technology | Port |
|-------|------------|------|
| Backend | Laravel 9.x (PHP 8.0+) | 8001 |
| Frontend | React 19 + Vite | 5173 |
| ML Service | FastAPI (Python) | 8000 |
| Database | MySQL | 3306 |

### Tính Năng Chính

- Mua sắm sản phẩm với giỏ hàng
- Thanh toán COD và VietQR
- Quản lý đơn hàng
- Đăng nhập Google OAuth
- Dashboard quản trị
- **ML Security** - Phát hiện tấn công HTTP bằng Machine Learning

---

## Cấu Trúc Dự Án

```
antoan/
├── backend/                 # Laravel Backend (PHP)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Admin/          # Admin controllers
│   │   │   │   └── Api/            # API controllers
│   │   │   └── Middleware/
│   │   │       ├── MLSecurityMiddleware.php
│   │   │       ├── IsAdmin.php
│   │   │       └── CorsMiddleware.php
│   │   └── Models/
│   ├── config/
│   ├── routes/api.php
│   └── database/migrations/
│
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   └── styles/
│   └── vite.config.js
│
├── Fastapi/                 # Python ML Service (Docker)
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   └── services/
│   ├── exports/              # ML models (.pkl)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
│
└── README.md
```

---

## Yêu Cầu Hệ Thống

### Backend & Frontend
- **PHP**: 8.0+
- **Composer**: Latest
- **Node.js**: 18+ LTS
- **npm**: 9+
- **MySQL**: 5.7+

### ML Service (Docker)
- **Docker Desktop**: 4.0+
- **Docker Compose**: 2.0+

---

## Cài Đặt

### 1. Backend (Laravel)

```bash
cd backend

# Cài đặt dependencies
composer install

# Copy và chỉnh sửa .env
cp .env.example .env

# Tạo application key
php artisan key:generate

# Tạo database trong MySQL (tên: laravel)
# Chỉnh sửa .env:
# DB_DATABASE=laravel
# DB_USERNAME=root
# DB_PASSWORD=

# Chạy migrations
php artisan migrate
php artisan db:seed

# Tạo symbolic link
php artisan storage:link
```

### 2. Frontend (React)

```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo .env
# VITE_API_URL=http://localhost:8001/api
```

---

## Chạy Ứng Dụng

### Docker (Khuyến nghị)

#### Chạy ML Service bằng Docker

```bash
cd Fastapi

# Build và chạy container
docker compose up -d --build

# Xem logs
docker compose logs -f

# Stop
docker compose down
```

#### Kiểm tra ML Service

```bash
# Health check
curl http://localhost:8000/health

# API docs
# http://localhost:8000/docs
```

### Chạy Từng Service

#### Backend (Laravel)

```bash
cd backend
php artisan serve
# http://localhost:8001
```

#### Frontend (React)

```bash
cd frontend
npm run dev
# http://localhost:5173
```

#### ML Service (Python - không khuyến nghị)

```bash
cd Fastapi
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Thứ Tự Khởi Động

| Thứ tự | Service | URL | Port |
|---------|---------|-----|------|
| 1 | MySQL Database | - | 3306 |
| 2 | ML Service (Docker) | http://localhost:8000 | 8000 |
| 3 | Backend (Laravel) | http://localhost:8001 | 8001 |
| 4 | Frontend (React) | http://localhost:5173 | 5173 |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Đăng ký |
| POST | `/api/login` | Đăng nhập |
| POST | `/api/logout` | Đăng xuất |
| GET | `/api/user/me` | Thông tin user |
| POST | `/api/user/update-profile` | Cập nhật profile |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Danh sách sản phẩm |
| GET | `/api/products/{id}` | Chi tiết sản phẩm |
| GET | `/api/categories` | Danh mục |

### Cart & Checkout

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Lấy giỏ hàng |
| POST | `/api/cart/add` | Thêm vào giỏ |
| POST | `/api/checkout` | Tạo đơn hàng |
| GET | `/api/orders` | Danh sách đơn hàng |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard |
| CRUD | `/api/admin/products` | Quản lý sản phẩm |
| CRUD | `/api/admin/categories` | Quản lý danh mục |
| GET | `/api/admin/orders` | Quản lý đơn hàng |
| GET | `/api/admin/security/logs` | Logs tấn công |

---

## Tính Năng

### Người Dùng
- [x] Đăng ký / Đăng nhập
- [x] Google OAuth
- [x] Giỏ hàng persistent
- [x] Thanh toán COD / VietQR
- [x] Xem lịch sử đơn hàng

### Quản Trị
- [x] Dashboard với thống kê
- [x] CRUD Users, Products, Categories, Gifts, Sliders, Testimonials
- [x] Quản lý đơn hàng
- [x] ML Security Dashboard

### Bảo Mật
- [x] JWT Authentication (Sanctum)
- [x] Role-based Access Control
- [x] ML-based Attack Detection
- [x] CORS Configuration

---

## ML Security

### Giới Thiệu

Hệ thống sử dụng Machine Learning để phát hiện các tấn công HTTP:

- SQL Injection
- XSS (Cross-Site Scripting)
- Command Injection
- Path Traversal
- SSRF
- NoSQL Injection

### ML Models

| Model | Status | Mô tả |
|-------|--------|--------|
| Random Forest | ✓ Loaded | Mặc định, recommended |
| Decision Tree | ✓ Loaded | Fast inference |
| Gradient Boosting | ✓ Loaded | High accuracy |
| K-Nearest Neighbors | ✓ Loaded | Balanced |
| MLP | ⚠ Fallback | Không load được (numpy version) |
| SVC | ✓ Loaded | Baseline |

### Cách Hoạt Động

```
1. Request → Laravel Backend
2. Middleware kiểm tra:
   - Static assets → Skip
   - Whitelist path → Skip
   - Khác → Gửi đến ML Service
3. ML Service trả về:
   - status: "normal" | "attack"
   - confidence: 0-1
   - model_used: tên model
4. Nếu attack → 403 Forbidden + log
```

### ML Service API

```
GET  /health              # Health check
POST /predict             # Dự đoán attack
     Body: { url, content, model_preference }
```

---

## Database

### Tables

```
users           - Tài khoản người dùng (admin/user)
products        - Sản phẩm
categories      - Danh mục
orders          - Đơn hàng
order_items     - Chi tiết đơn hàng
carts/cart_items - Giỏ hàng
gifts           - Quà tặng
sliders         - Banner
testimonials    - Đánh giá khách hàng
attack_logs     - Logs tấn công ML
```

---

## Docker Commands

```bash
# Di chuyển vào thư mục Fastapi
cd Fastapi

# Build image
docker compose build

# Chạy container
docker compose up -d

# Xem logs
docker compose logs -f

# Stop container
docker compose down

# Rebuild khi có thay đổi
docker compose up -d --build

# Stop và xóa
docker compose down -v

# Kiểm tra container
docker ps

# Shell vào container
docker exec -it security-ml-api bash
```

### Docker Configuration

**Dockerfile:** `Fastapi/Dockerfile`
**Docker Compose:** `Fastapi/docker-compose.yml`
**Container Name:** `security-ml-api`
**Port:** `8000:8000`

---

## Giấy Phép

Dự án phát triển cho mục đích học tập.

<p align="center">
  Made with ❤️ by tù túng team
</p>
