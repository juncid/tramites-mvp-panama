import pytest


def test_read_root(client):
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"
    assert "version" in response.json()


def test_health_check(client):
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_api_docs(client):
    """Test that API documentation is accessible"""
    response = client.get("/api/docs")
    assert response.status_code == 200


def test_openapi_json(client):
    """Test that OpenAPI schema is accessible"""
    response = client.get("/api/openapi.json")
    assert response.status_code == 200
    assert "openapi" in response.json()
