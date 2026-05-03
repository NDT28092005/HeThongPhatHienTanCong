from fastapi import APIRouter
from app.schemas import PredictRequest, PredictResponse
from app.services import predict_service

router = APIRouter()


@router.post("/predict", response_model=PredictResponse)
def predict_endpoint(payload: PredictRequest) -> PredictResponse:
    result = predict_service.predict(payload.features)
    return PredictResponse(status=result, request_id=payload.request_id)
