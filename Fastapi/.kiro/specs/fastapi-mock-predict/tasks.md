# Implementation Plan: fastapi-mock-predict

## Overview

Triển khai FastAPI mock service theo cấu trúc đã thiết kế: tạo schemas, service layer, routers, main app, cấu hình Docker, và viết tests (unit + property-based với Hypothesis).

## Tasks

- [x] 1. Khởi tạo cấu trúc dự án và dependencies
  - Tạo cấu trúc thư mục: `app/`, `app/routers/`, `app/services/`, `tests/`
  - Tạo các file `__init__.py` cần thiết
  - Tạo `requirements.txt` với các dependencies có phiên bản cụ thể: `fastapi`, `uvicorn[standard]`, `pydantic`, `httpx`, `pytest`, `pytest-asyncio`, `hypothesis`
  - _Requirements: 1.1, 1.2_

- [x] 2. Implement Pydantic schemas
  - [x] 2.1 Tạo `app/schemas.py` với `PredictRequest`, `PredictResponse`, `HealthResponse`
    - `PredictRequest`: trường `features: List[float]` (bắt buộc), `request_id: Optional[str]` (tùy chọn)
    - `PredictResponse`: trường `status: Literal["attack", "normal"]`, `request_id: Optional[str]`
    - `HealthResponse`: trường `status: Literal["ok"]`
    - _Requirements: 2.2, 2.3_

- [x] 3. Implement predict service
  - [x] 3.1 Tạo `app/services/predict_service.py`
    - Hàm `predict(features: list[float]) -> str` dùng `random.choice(["attack", "normal"])`
    - _Requirements: 3.2_

- [x] 4. Implement routers và main app
  - [x] 4.1 Tạo `app/routers/predict.py` với `POST /predict`
    - Nhận `PredictRequest`, gọi `predict_service.predict()`, trả về `PredictResponse`
    - Phản chiếu `request_id` từ request sang response
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 4.2 Tạo `app/main.py` với FastAPI app instance
    - Mount `predict_router` với prefix `/api`
    - Thêm `GET /health` trả về `HealthResponse(status="ok")`
    - Cấu hình title và version cho OpenAPI docs
    - _Requirements: 2.1, 4.1_

- [x] 5. Checkpoint — Kiểm tra app chạy được
  - Ensure all imports resolve, app khởi động không lỗi, ask the user if questions arise.

- [x] 6. Viết unit tests
  - [x] 6.1 Tạo `tests/test_health.py`
    - Test `GET /health` → `200`, body `{"status": "ok"}`
    - Test `GET /docs` → `200`
    - Test `GET /openapi.json` → schema chứa `PredictRequest` và `PredictResponse`
    - _Requirements: 2.1, 4.1_
  - [x] 6.2 Tạo `tests/test_predict.py` với example-based tests
    - POST với `features=[1.0, 2.0]` → `200`, `status` in `{"attack", "normal"}`
    - POST với `features=[]` (list rỗng) → `200`
    - POST với `request_id` → response phản chiếu đúng `request_id`
    - POST không có `request_id` → response `request_id` là `null`
    - POST thiếu `features` → `422`
    - POST với `features="not_a_list"` → `422`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7. Viết property-based tests với Hypothesis
  - [ ]* 7.1 Viết property test cho Property 1: valid payload luôn trả về response hợp lệ
    - **Property 1: Valid payload luôn trả về response hợp lệ**
    - Dùng `@given(features=st.lists(st.floats(allow_nan=False, allow_infinity=False)), request_id=st.one_of(st.none(), st.text()))`
    - Assert HTTP `200` và `status` in `{"attack", "normal"}`
    - Comment tag: `# Feature: fastapi-mock-predict, Property 1: valid payload returns 200 with status in {attack, normal}`
    - **Validates: Requirements 3.1, 3.2**
  - [ ]* 7.2 Viết property test cho Property 2: request_id round-trip
    - **Property 2: request_id được phản chiếu chính xác**
    - Dùng `@given(request_id=st.text())`
    - Assert response `request_id` bằng đúng giá trị đã gửi
    - Comment tag: `# Feature: fastapi-mock-predict, Property 2: request_id is echoed back unchanged`
    - **Validates: Requirements 3.3**
  - [ ]* 7.3 Viết property test cho Property 3: invalid features → 422
    - **Property 3: Invalid features luôn bị từ chối với 422**
    - Dùng `@given(invalid_features=st.one_of(st.text(), st.none(), st.integers(), st.lists(st.text())))`
    - Assert HTTP `422`
    - Comment tag: `# Feature: fastapi-mock-predict, Property 3: invalid features returns 422`
    - **Validates: Requirements 3.4, 3.5**

- [x] 8. Cấu hình Docker
  - [x] 8.1 Tạo `Dockerfile`
    - Base image Python chính thức (ví dụ: `python:3.11-slim`)
    - Copy `requirements.txt`, chạy `pip install`
    - Copy `app/`, expose port `8000`, CMD chạy uvicorn
    - _Requirements: 5.1, 5.4_
  - [x] 8.2 Tạo `docker-compose.yml`
    - Service `api` build từ Dockerfile, map port `8000:8000`
    - Restart policy `always`
    - _Requirements: 5.2, 5.3, 5.5_

- [x] 9. Tạo README.md
  - Mô tả cách cài đặt, chạy với Docker (`docker-compose up`), chạy tests (`pytest`)
  - Mô tả các endpoints: `POST /api/predict`, `GET /health`, `GET /docs`
  - _Requirements: 1.3_

- [x] 10. Checkpoint cuối — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks đánh dấu `*` là tùy chọn, có thể bỏ qua để triển khai MVP nhanh hơn
- Property tests (7.1, 7.2, 7.3) dùng Hypothesis với `max_examples=100`
- Mỗi task tham chiếu requirements cụ thể để đảm bảo traceability
- Checkpoints đảm bảo kiểm tra tăng dần sau mỗi giai đoạn quan trọng
