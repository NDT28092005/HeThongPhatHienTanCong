from fastapi import FastAPI
from app.routers.predict import router as predict_router
from app.schemas import HealthResponse

app = FastAPI(title="FastAPI Mock Predict", version="1.0.0")
app.include_router(predict_router, prefix="/api")


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")
