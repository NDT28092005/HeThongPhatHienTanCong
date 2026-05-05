import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_predict_with_attack_url_returns_attack(client):
    response = client.post(
        "/api/v1/security/predict",
        json={"url": "/search?q=' OR 1=1 --"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] in ("attack", "normal")
    assert "confidence" in data
    assert 0.0 <= data["confidence"] <= 1.0
    assert "model_used" in data
    assert "processing_time_ms" in data


def test_predict_with_normal_url_returns_normal(client):
    response = client.post(
        "/api/v1/security/predict",
        json={"url": "/products"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("attack", "normal")
    assert "confidence" in data
    assert "model_used" in data


def test_predict_with_request_id_echoes_back(client):
    response = client.post(
        "/api/v1/security/predict",
        json={"url": "/home", "request_id": "req-abc-123"},
    )
    assert response.status_code == 200
    assert response.json()["request_id"] == "req-abc-123"


def test_predict_with_content_param(client):
    response = client.post(
        "/api/v1/security/predict",
        json={
            "url": "/api/data",
            "content": "<script>alert('xss')</script>",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("attack", "normal")


def test_predict_missing_url_returns_422(client):
    response = client.post("/api/v1/security/predict", json={})
    assert response.status_code == 422


def test_predict_url_type_error_returns_422(client):
    response = client.post(
        "/api/v1/security/predict",
        json={"url": 12345},
    )
    assert response.status_code == 422


def test_predict_model_preference_in_response(client):
    response = client.post(
        "/api/v1/security/predict",
        json={"url": "/test", "model_preference": "knn"},
    )
    assert response.status_code == 200
    assert response.json()["model_used"] == "knn"


def test_predict_default_model_is_random_forest(client):
    response = client.post(
        "/api/v1/security/predict",
        json={"url": "/test"},
    )
    assert response.status_code == 200
    assert response.json()["model_used"] == "random_forest"
