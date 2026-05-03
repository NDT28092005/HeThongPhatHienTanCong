# Requirements Document

## Introduction

Tính năng này thay thế hàm mock `random.choice(["attack", "normal"])` trong `predict_service.py` bằng model ML thực tế — Random Forest đã được train sẵn với accuracy 92.6%. Input API thay đổi từ `features: List[float]` sang `url: str` (bắt buộc) và `content: Optional[str]` (tùy chọn). Feature extraction được thực hiện tự động bởi `feature_extractor.py`. Output giữ nguyên: `status: "attack" | "normal"`.

## Glossary

- **ML_Service**: Module `app/services/predict_service.py` sau khi tích hợp model ML thực tế.
- **Predict_Endpoint**: Đường dẫn POST `/api/predict` nhận URL và content, trả về kết quả phân loại.
- **Feature_Extractor**: Module `feature_extractor.py` nhận DataFrame có cột `URL` (và tùy chọn `content`), trả về DataFrame với 19–32 features số.
- **Random_Forest_Model**: File `random_forest.pkl` — model Random Forest đã được train, accuracy 92.6%.
- **Label_Encoder**: File `label_encoder.pkl` — dùng để decode output số của model thành nhãn chuỗi (`"Normal"` hoặc `"Anomalous"`).
- **PredictRequest**: Pydantic schema đầu vào với trường `url: str` (bắt buộc) và `content: Optional[str]` (tùy chọn).
- **PredictResponse**: Pydantic schema đầu ra với trường `status: Literal["attack", "normal"]`.
- **Model_Loader**: Logic khởi tạo tải `random_forest.pkl` và `label_encoder.pkl` vào bộ nhớ khi service khởi động.
- **Label_Map**: Quy tắc ánh xạ nhãn: `"Normal"` → `"normal"`, `"Anomalous"` → `"attack"`.

---

## Requirements

### Requirement 1: Cập nhật schema đầu vào API

**User Story:** As a developer, I want the predict endpoint to accept a URL and optional content instead of a raw feature list, so that callers don't need to compute features manually.

#### Acceptance Criteria

1. THE Predict_Endpoint SHALL chấp nhận request body JSON với trường `url` kiểu `str` là bắt buộc.
2. THE Predict_Endpoint SHALL chấp nhận trường `content` kiểu `str` là tùy chọn (có thể vắng mặt hoặc `null`).
3. THE Predict_Endpoint SHALL tiếp tục chấp nhận trường `request_id` kiểu `str` là tùy chọn.
4. IF request body thiếu trường `url`, THEN THE Predict_Endpoint SHALL trả về HTTP status code `422` kèm thông báo lỗi mô tả trường bị thiếu.
5. IF trường `url` trong request body không phải kiểu `str`, THEN THE Predict_Endpoint SHALL trả về HTTP status code `422` kèm thông báo lỗi mô tả kiểu dữ liệu không hợp lệ.
6. THE Predict_Endpoint SHALL không còn chấp nhận trường `features: List[float]` trong request body.

---

### Requirement 2: Tải model ML khi khởi động service

**User Story:** As an operator, I want the ML model to be loaded once at startup, so that prediction requests are served without per-request I/O overhead.

#### Acceptance Criteria

1. WHEN ML_Service được khởi tạo, THE Model_Loader SHALL tải `random_forest.pkl` và `label_encoder.pkl` vào bộ nhớ đúng một lần.
2. IF file `random_forest.pkl` không tồn tại tại đường dẫn cấu hình, THEN THE Model_Loader SHALL raise `FileNotFoundError` với thông báo mô tả đường dẫn bị thiếu.
3. IF file `label_encoder.pkl` không tồn tại tại đường dẫn cấu hình, THEN THE Model_Loader SHALL raise `FileNotFoundError` với thông báo mô tả đường dẫn bị thiếu.
4. THE Model_Loader SHALL tải model từ thư mục `exports/` nằm ở root của project.

---

### Requirement 3: Feature extraction từ URL và content

**User Story:** As a developer, I want the service to automatically extract features from a URL and optional content, so that the ML model receives the correct input format.

#### Acceptance Criteria

1. WHEN ML_Service nhận `url` và không có `content`, THE Feature_Extractor SHALL trả về DataFrame với đúng 19 features URL.
2. WHEN ML_Service nhận `url` và `content` không rỗng, THE Feature_Extractor SHALL trả về DataFrame với đúng 32 features (19 URL features + 13 content features).
3. THE Feature_Extractor SHALL nhận đầu vào là DataFrame có cột `URL` (bắt buộc) và cột `content` (tùy chọn).
4. IF `content` là `None` hoặc không được cung cấp, THEN THE Feature_Extractor SHALL bỏ qua tất cả content features và chỉ trả về URL features.
5. THE Feature_Extractor SHALL trả về DataFrame chỉ chứa các cột feature số (không chứa cột `URL` hay `content` gốc) trước khi truyền vào Random_Forest_Model.

---

### Requirement 4: Dự đoán bằng Random Forest model

**User Story:** As a user, I want the service to use the trained Random Forest model for prediction, so that I receive accurate classification results instead of random outputs.

#### Acceptance Criteria

1. WHEN Feature_Extractor trả về DataFrame features hợp lệ, THE ML_Service SHALL gọi `Random_Forest_Model.predict()` với DataFrame đó và nhận về mảng nhãn số.
2. WHEN Random_Forest_Model trả về nhãn số, THE ML_Service SHALL dùng Label_Encoder để decode nhãn số thành chuỗi (`"Normal"` hoặc `"Anomalous"`).
3. WHEN Label_Encoder trả về `"Normal"`, THE ML_Service SHALL ánh xạ thành `"normal"` theo Label_Map.
4. WHEN Label_Encoder trả về `"Anomalous"`, THE ML_Service SHALL ánh xạ thành `"attack"` theo Label_Map.
5. THE Predict_Endpoint SHALL trả về HTTP status code `200` và PredictResponse với trường `status` là `"attack"` hoặc `"normal"` cho mọi request hợp lệ.

---

### Requirement 5: Xử lý lỗi trong quá trình dự đoán

**User Story:** As an operator, I want the service to handle prediction errors gracefully, so that a single bad request doesn't crash the service.

#### Acceptance Criteria

1. IF Feature_Extractor raise exception khi xử lý `url` hoặc `content`, THEN THE ML_Service SHALL bắt exception đó và trả về HTTP status code `500` kèm thông báo lỗi mô tả nguyên nhân.
2. IF Random_Forest_Model raise exception trong quá trình predict, THEN THE ML_Service SHALL bắt exception đó và trả về HTTP status code `500` kèm thông báo lỗi mô tả nguyên nhân.
3. WHILE ML_Service đang xử lý một request lỗi, THE ML_Service SHALL tiếp tục phục vụ các request tiếp theo mà không bị crash.

---

### Requirement 6: Cập nhật dependencies

**User Story:** As a developer, I want all required ML dependencies declared in requirements.txt, so that the project can be installed and run reproducibly.

#### Acceptance Criteria

1. THE API_Server SHALL khai báo `scikit-learn` với phiên bản cụ thể trong `requirements.txt`.
2. THE API_Server SHALL khai báo `pandas` với phiên bản cụ thể trong `requirements.txt`.
3. THE API_Server SHALL khai báo `numpy` với phiên bản cụ thể trong `requirements.txt`.
4. WHEN Docker image được build, THE Docker_Service SHALL cài đặt `scikit-learn`, `pandas`, và `numpy` từ `requirements.txt` vào trong image.

---

### Requirement 7: Tài liệu API phản ánh schema mới

**User Story:** As a developer or tester, I want the OpenAPI documentation to reflect the updated request schema, so that I can integrate with the new API without ambiguity.

#### Acceptance Criteria

1. THE Predict_Endpoint SHALL mô tả rõ ràng schema đầu vào mới bao gồm trường `url` (chuỗi, bắt buộc), `content` (chuỗi, tùy chọn), và `request_id` (chuỗi, tùy chọn) trong Swagger UI tại `/docs`.
2. THE Predict_Endpoint SHALL không còn hiển thị trường `features` trong schema đầu vào tại `/docs`.
3. THE Predict_Endpoint SHALL tiếp tục mô tả schema đầu ra với trường `status` có giá trị `"attack"` hoặc `"normal"` và trường `request_id` tùy chọn.
