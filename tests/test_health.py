import json

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_docs_available():
    response = client.get("/docs")
    assert response.status_code == 200


def test_openapi_schema_contains_models():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema_text = json.dumps(response.json())
    assert "PredictRequest" in schema_text
    assert "PredictResponse" in schema_text
