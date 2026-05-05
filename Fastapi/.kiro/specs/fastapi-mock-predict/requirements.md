# Requirements Document

## Introduction

Dự án xây dựng một FastAPI mock service chạy trên Docker, cung cấp endpoint POST `/api/predict` nhận dữ liệu JSON và trả về kết quả phân loại ngẫu nhiên (`"attack"` hoặc `"normal"`). Mục tiêu là tạo ra một môi trường mock ổn định để kiểm thử tích hợp với các hệ thống khác (ví dụ: Postman, frontend, pipeline ML) mà không cần model thực tế.

## Glossary

- **API_Server**: Ứng dụng FastAPI chạy bên trong Docker container, xử lý các HTTP request.
- **Predict_Endpoint**: Đường dẫn POST `/api/predict` nhận payload JSON và trả về kết quả phân loại.
- **Payload**: Dữ liệu JSON được gửi lên trong body của HTTP request.
- **Prediction_Result**: Đối tượng JSON trả về từ Predict_Endpoint, chứa trường `status` với giá trị `"attack"` hoặc `"normal"`.
- **Docker_Service**: Tập hợp Dockerfile và docker-compose.yml dùng để build và chạy API_Server trong container.
- **Health_Endpoint**: Đường dẫn GET `/health` dùng để kiểm tra trạng thái hoạt động của API_Server.

---

## Requirements

### Requirement 1: Cấu trúc dự án Python rõ ràng

**User Story:** As a developer, I want a well-organized Python project structure, so that I can easily navigate, maintain, and extend the codebase.

#### Acceptance Criteria

1. THE API_Server SHALL organize source code theo cấu trúc thư mục chuẩn với các thư mục riêng biệt cho `app/`, `tests/`, và các file cấu hình ở root.
2. THE API_Server SHALL cung cấp file `requirements.txt` liệt kê tất cả các Python dependencies với phiên bản cụ thể.
3. THE API_Server SHALL cung cấp file `README.md` mô tả cách cài đặt, chạy, và test dự án.

---

### Requirement 2: Tài liệu mô tả cấu trúc API

**User Story:** As a developer or tester, I want clear API documentation describing request and response JSON formats, so that I can integrate with the service without ambiguity.

#### Acceptance Criteria

1. THE API_Server SHALL tự động sinh tài liệu OpenAPI (Swagger UI) tại đường dẫn `/docs`.
2. THE Predict_Endpoint SHALL mô tả rõ ràng schema của Payload đầu vào bao gồm các trường: `features` (danh sách số thực, bắt buộc) và `request_id` (chuỗi ký tự, tùy chọn).
3. THE Predict_Endpoint SHALL mô tả rõ ràng schema của Prediction_Result đầu ra bao gồm trường `status` (chuỗi, giá trị `"attack"` hoặc `"normal"`) và trường `request_id` (chuỗi, tùy chọn, phản chiếu lại giá trị từ Payload nếu có).

---

### Requirement 3: Endpoint POST /api/predict hoạt động

**User Story:** As a tester, I want a working POST /api/predict endpoint, so that I can send prediction requests and receive valid responses.

#### Acceptance Criteria

1. WHEN một HTTP POST request được gửi đến `/api/predict` với Payload hợp lệ, THE Predict_Endpoint SHALL trả về HTTP status code `200` và một Prediction_Result.
2. WHEN Predict_Endpoint nhận Payload hợp lệ, THE Predict_Endpoint SHALL trả về Prediction_Result với trường `status` có giá trị ngẫu nhiên là `"attack"` hoặc `"normal"`.
3. WHEN trường `request_id` có mặt trong Payload, THE Predict_Endpoint SHALL phản chiếu lại giá trị `request_id` đó trong Prediction_Result.
4. IF Payload thiếu trường `features` bắt buộc, THEN THE Predict_Endpoint SHALL trả về HTTP status code `422` kèm thông báo lỗi mô tả trường bị thiếu.
5. IF trường `features` trong Payload không phải là danh sách số thực, THEN THE Predict_Endpoint SHALL trả về HTTP status code `422` kèm thông báo lỗi mô tả kiểu dữ liệu không hợp lệ.
6. THE Predict_Endpoint SHALL không bị crash khi nhận bất kỳ Payload JSON hợp lệ nào.

---

### Requirement 4: Health check endpoint

**User Story:** As an operator, I want a health check endpoint, so that I can verify the service is running correctly inside Docker.

#### Acceptance Criteria

1. WHEN một HTTP GET request được gửi đến `/health`, THE Health_Endpoint SHALL trả về HTTP status code `200` và JSON `{"status": "ok"}`.
2. WHILE API_Server đang chạy, THE Health_Endpoint SHALL phản hồi trong vòng 1 giây.

---

### Requirement 5: Toàn bộ dự án chạy trên Docker

**User Story:** As a developer, I want the entire project to run on Docker, so that I can deploy and test it in an isolated, reproducible environment.

#### Acceptance Criteria

1. THE Docker_Service SHALL cung cấp `Dockerfile` để build image của API_Server từ base image Python chính thức.
2. THE Docker_Service SHALL cung cấp `docker-compose.yml` để khởi động API_Server với một lệnh duy nhất (`docker-compose up`).
3. WHEN `docker-compose up` được thực thi, THE Docker_Service SHALL expose API_Server trên cổng `8000` của máy host.
4. WHEN Docker image được build, THE Docker_Service SHALL cài đặt tất cả dependencies từ `requirements.txt` vào trong image.
5. IF API_Server bị crash bên trong container, THEN THE Docker_Service SHALL tự động khởi động lại container (restart policy: `always`).
