from fastapi import APIRouter, HTTPException, status

from app.schemas import PredictRequest, PredictResponse
from app.services.predict_service import predict_with_timing

router = APIRouter(tags=["Security"])


@router.post(
    "/api/v1/security/predict",
    response_model=PredictResponse,
    status_code=status.HTTP_200_OK,
    summary="Detect malicious HTTP requests",
    description="Phan tich URL va content de phat hien tan cong nhu SQL Injection, XSS, va cac hinh thuc tan cong HTTP khac.",
)
def predict(payload: PredictRequest) -> PredictResponse:
    try:
        result = predict_with_timing(
            url=payload.url,
            content=payload.content,
            model_preference=payload.model_preference,
        )
        return PredictResponse(
            status=result["status"],
            confidence=result["confidence"],
            model_used=result["model_used"],
            processing_time_ms=result["processing_time_ms"],
            request_id=payload.request_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}",
        )
