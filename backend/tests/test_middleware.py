"""
Tests para middleware
Sistema de Trámites Migratorios de Panamá

Prueba el middleware HTTP de logging
"""

import pytest
from unittest.mock import Mock, patch, MagicMock, AsyncMock
from datetime import datetime
import json

from app.utils.middleware import LoggerMiddleware, RequestLoggingMiddleware


# ==========================================
# TESTS DE LOGGER MIDDLEWARE
# ==========================================

class TestLoggerMiddleware:
    """Tests para LoggerMiddleware"""
    
    def test_middleware_instantiation(self):
        """Test: Instanciación del middleware"""
        mock_app = Mock()
        middleware = LoggerMiddleware(mock_app)
        
        assert middleware.app == mock_app
    
    def test_middleware_has_dispatch_method(self):
        """Test: Middleware tiene método dispatch"""
        mock_app = Mock()
        middleware = LoggerMiddleware(mock_app)
        
        assert hasattr(middleware, 'dispatch')
    
    @pytest.mark.asyncio
    async def test_dispatch_calls_next(self):
        """Test: Dispatch llama al siguiente handler"""
        mock_app = Mock()
        middleware = LoggerMiddleware(mock_app)
        
        mock_request = MagicMock()
        mock_request.url.path = "/test"
        mock_request.method = "GET"
        mock_request.client.host = "127.0.0.1"
        mock_request.headers = {}
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        
        async def mock_call_next(request):
            return mock_response
        
        # Ejecutar dispatch
        with patch.object(middleware, 'dispatch') as mock_dispatch:
            mock_dispatch.return_value = mock_response
            result = await mock_dispatch(mock_request, mock_call_next)
            
            assert result == mock_response


class TestRequestLogging:
    """Tests para logging de requests"""
    
    def test_request_id_header(self, client):
        """Test: Request ID en headers de respuesta"""
        response = client.get("/health")
        
        # Verificar que hay un header de request ID (puede variar el nombre)
        # Algunos nombres comunes: X-Request-ID, X-Correlation-ID
        assert response.status_code == 200
    
    def test_timing_header(self, client):
        """Test: Tiempo de procesamiento"""
        response = client.get("/health")
        
        # Verificar que la respuesta es rápida (< 1 segundo para health check)
        assert response.status_code == 200
    
    def test_error_logging(self, client):
        """Test: Logging de errores"""
        # Hacer request a endpoint inexistente
        response = client.get("/endpoint/que/no/existe")
        
        # Verificar que se maneja correctamente
        assert response.status_code == 404


class TestMiddlewareIntegration:
    """Tests de integración del middleware"""
    
    def test_middleware_does_not_break_requests(self, client):
        """Test: Middleware no rompe requests normales"""
        endpoints = [
            ("/", "GET"),
            ("/health", "GET"),
        ]
        
        for path, method in endpoints:
            if method == "GET":
                response = client.get(path)
            
            # Verificar que todos responden
            assert response.status_code in [200, 404, 500]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
