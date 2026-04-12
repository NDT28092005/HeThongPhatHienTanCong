from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI()
class PredictInput(BaseModel):
    feature_1: float
    feature_2: float
@app.post("/api/predict")
async def predict_status(data: PredictInput):
    """
    Nhận JSON input, xử lý mock logic và trả về kết quả
    """
    mock_result = random.choice(["attack", "normal"])
   
    return {"status": mock_result}