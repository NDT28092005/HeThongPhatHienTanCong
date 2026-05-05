import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health_returns_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_health_contains_models_loaded(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert "models_loaded" in response.json()
    assert isinstance(response.json()["models_loaded"], list)


def test_health_has_random_forest_loaded(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert "random_forest" in response.json()["models_loaded"]


def test_docs_available(client):
    response = client.get("/docs")
    assert response.status_code == 200


def test_openapi_schema_contains_new_schema(client):
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    schemas = schema.get("components", {}).get("schemas", {})
    assert "PredictRequest" in schemas
    assert "PredictResponse" in schemas
    url_field = schemas["PredictRequest"]["properties"].get("url")
    assert url_field is not None, "PredictRequest should have 'url' field"
    assert url_field.get("type") == "string"
