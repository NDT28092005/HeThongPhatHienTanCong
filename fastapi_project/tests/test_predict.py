from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_predict_valid_features_returns_200_with_valid_status():
    """POST với features=[1.0, 2.0] → 200, status in {"attack", "normal"}"""
    response = client.post("/api/predict", json={"features": [1.0, 2.0]})
    assert response.status_code == 200
    assert response.json()["status"] in {"attack", "normal"}


def test_predict_empty_features_returns_200():
    """POST với features=[] (list rỗng) → 200"""
    response = client.post("/api/predict", json={"features": []})
    assert response.status_code == 200


def test_predict_request_id_is_echoed():
    """POST với request_id → response phản chiếu đúng request_id"""
    response = client.post("/api/predict", json={"features": [1.0], "request_id": "abc-123"})
    assert response.status_code == 200
    assert response.json()["request_id"] == "abc-123"


def test_predict_no_request_id_returns_null():
    """POST không có request_id → response request_id là null"""
    response = client.post("/api/predict", json={"features": [1.0]})
    assert response.status_code == 200
    assert response.json()["request_id"] is None


def test_predict_missing_features_returns_422():
    """POST thiếu features → 422"""
    response = client.post("/api/predict", json={"request_id": "x"})
    assert response.status_code == 422


def test_predict_features_not_a_list_returns_422():
    """POST với features="not_a_list" → 422"""
    response = client.post("/api/predict", json={"features": "not_a_list"})
    assert response.status_code == 422
