from typing import List, Literal, Optional

from pydantic import BaseModel


class PredictRequest(BaseModel):
    features: List[float]
    request_id: Optional[str] = None


class PredictResponse(BaseModel):
    status: Literal["attack", "normal"]
    request_id: Optional[str] = None


class HealthResponse(BaseModel):
    status: Literal["ok"]
