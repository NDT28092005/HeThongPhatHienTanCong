from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.routers import predict_router
from app.schemas import HealthResponse
from app.services.predict_service import load_models


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
    yield


app = FastAPI(
    title="Security ML API",
    description="HTTP Attack Detection API powered by Machine Learning",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(predict_router)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health() -> HealthResponse:
    from app.services.predict_service import _loader

    return HealthResponse(
        status="ok",
        models_loaded=_loader.loaded_model_names,
    )
