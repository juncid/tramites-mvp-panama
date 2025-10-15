import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_read_root():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"
    assert "version" in response.json()


def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_api_docs():
    """Test that API documentation is accessible"""
    response = client.get("/api/docs")
    assert response.status_code == 200


def test_openapi_json():
    """Test that OpenAPI schema is accessible"""
    response = client.get("/api/openapi.json")
    assert response.status_code == 200
    assert "openapi" in response.json()
