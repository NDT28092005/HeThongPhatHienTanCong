from typing import Optional, Literal

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    url: str = Field(..., description="URL hoặc request path cần kiểm tra")
    content: Optional[str] = Field(None, description="Nội dung body (tùy chọn)")
    model_preference: Optional[str] = Field(
        "random_forest",
        description="Model muốn sử dụng: random_forest, knn, decision_tree, gradient_boosting, mlp, svc"
    )
    request_id: Optional[str] = Field(None, description="ID tùy chọn để trace request")


class PredictResponse(BaseModel):
    status: Literal["attack", "normal"] = Field(..., description="Kết quả phân loại")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Độ tin cậy của model (0.0 - 1.0)")
    model_used: str = Field(..., description="Tên model được sử dụng")
    processing_time_ms: float = Field(..., ge=0.0, description="Thời gian xử lý (milliseconds)")
    request_id: Optional[str] = Field(None, description="Phản chiếu request_id từ request")


class HealthResponse(BaseModel):
    status: Literal["ok"]
    models_loaded: list[str] = Field(default_factory=list, description="Danh sách model đã load")


class ModelsInfoResponse(BaseModel):
    models: dict[str, dict] = Field(..., description="Thông tin các model có sẵn")
    default_model: str = Field(..., description="Model mặc định")
