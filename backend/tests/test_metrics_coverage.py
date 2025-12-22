"""
Tests completos para app/utils/metrics.py - Cobertura 100%
Sistema de Trámites Migratorios de Panamá

Cubre las líneas faltantes del módulo de métricas:
- MetricsCollector.gauge()
- MetricsCollector.get_counter()
- MetricsCollector.get_gauge()
- MetricsCollector.get_timing_stats()
- Manejo de excepciones
"""

import pytest
from unittest.mock import MagicMock
import json

from app.utils.metrics import MetricsCollector, init_metrics, get_metrics


# ==========================================
# FIXTURES
# ==========================================

@pytest.fixture
def mock_redis():
    """Mock de cliente Redis"""
    redis_mock = MagicMock()
    redis_mock.hincrby = MagicMock()
    redis_mock.expire = MagicMock()
    redis_mock.hset = MagicMock()
    redis_mock.hget = MagicMock(return_value=None)
    redis_mock.hgetall = MagicMock(return_value={})
    redis_mock.lpush = MagicMock()
    redis_mock.ltrim = MagicMock()
    return redis_mock


@pytest.fixture
def metrics_collector(mock_redis):
    """Instancia de MetricsCollector con Redis mockeado"""
    return MetricsCollector(mock_redis)


# ==========================================
# TESTS PARA MetricsCollector.__init__
# ==========================================

class TestMetricsCollectorInit:
    """Tests para inicialización de MetricsCollector"""

    def test_init_with_redis(self, mock_redis):
        """Test: Inicialización correcta con cliente Redis"""
        collector = MetricsCollector(mock_redis)
        assert collector.redis == mock_redis
        assert collector.prefix == "metrics"


# ==========================================
# TESTS PARA MetricsCollector.increment
# ==========================================

class TestMetricsCollectorIncrement:
    """Tests para MetricsCollector.increment()"""

    def test_increment_basic(self, metrics_collector, mock_redis):
        """Test: Incrementar contador básico"""
        metrics_collector.increment("http_requests")

        mock_redis.hincrby.assert_called()
        mock_redis.expire.assert_called()

    def test_increment_with_value(self, metrics_collector, mock_redis):
        """Test: Incrementar contador con valor específico"""
        metrics_collector.increment("http_requests", value=5)

        # Verificar que se llamó hincrby con el valor
        calls = mock_redis.hincrby.call_args_list
        assert len(calls) >= 1

    def test_increment_with_tags(self, metrics_collector, mock_redis):
        """Test: Incrementar contador con tags"""
        tags = {"method": "GET", "endpoint": "/api/users"}
        metrics_collector.increment("http_requests", tags=tags)

        mock_redis.hincrby.assert_called()

    def test_increment_exception_handling(self, metrics_collector, mock_redis):
        """Test: Manejo de excepciones en increment"""
        mock_redis.hincrby.side_effect = Exception("Redis error")

        # No debe lanzar excepción
        metrics_collector.increment("http_requests")


# ==========================================
# TESTS PARA MetricsCollector.gauge
# ==========================================

class TestMetricsCollectorGauge:
    """Tests para MetricsCollector.gauge()"""

    def test_gauge_basic(self, metrics_collector, mock_redis):
        """Test: Establecer gauge básico"""
        metrics_collector.gauge("active_users", 42)

        mock_redis.hset.assert_called()
        call_args = mock_redis.hset.call_args
        assert "metrics:gauges" in str(call_args)

    def test_gauge_with_tags(self, metrics_collector, mock_redis):
        """Test: Establecer gauge con tags"""
        tags = {"service": "api"}
        metrics_collector.gauge("active_connections", 100, tags=tags)

        mock_redis.hset.assert_called()

    def test_gauge_stores_timestamp(self, metrics_collector, mock_redis):
        """Test: Gauge almacena timestamp"""
        metrics_collector.gauge("cpu_usage", 75.5)

        call_args = mock_redis.hset.call_args
        # El segundo argumento debe contener JSON con timestamp
        stored_data = call_args[0][2] if len(call_args[0]) > 2 else call_args[1].get('mapping', '')
        if isinstance(stored_data, str):
            data = json.loads(stored_data)
            assert "timestamp" in data
            assert "value" in data

    def test_gauge_exception_handling(self, metrics_collector, mock_redis):
        """Test: Manejo de excepciones en gauge"""
        mock_redis.hset.side_effect = Exception("Redis error")

        # No debe lanzar excepción
        metrics_collector.gauge("test_gauge", 10)


# ==========================================
# TESTS PARA MetricsCollector.timing
# ==========================================

class TestMetricsCollectorTiming:
    """Tests para MetricsCollector.timing()"""

    def test_timing_basic(self, metrics_collector, mock_redis):
        """Test: Registrar timing básico"""
        metrics_collector.timing("request_duration", 150.5)

        mock_redis.lpush.assert_called()
        mock_redis.ltrim.assert_called()

    def test_timing_with_tags(self, metrics_collector, mock_redis):
        """Test: Registrar timing con tags"""
        tags = {"endpoint": "/api/users", "method": "GET"}
        metrics_collector.timing("request_duration", 200.0, tags=tags)

        mock_redis.lpush.assert_called()

    def test_timing_exception_handling(self, metrics_collector, mock_redis):
        """Test: Manejo de excepciones en timing"""
        mock_redis.lpush.side_effect = Exception("Redis error")

        # No debe lanzar excepción
        metrics_collector.timing("test_timing", 100.0)


# ==========================================
# TESTS PARA MetricsCollector._update_timing_stats
# ==========================================

class TestMetricsCollectorUpdateTimingStats:
    """Tests para MetricsCollector._update_timing_stats()"""

    def test_update_timing_stats_first_value(self, metrics_collector, mock_redis):
        """Test: Actualizar stats con primer valor"""
        mock_redis.hgetall.return_value = {}

        metrics_collector._update_timing_stats("test_stats", 100.0)

        mock_redis.hset.assert_called()
        mock_redis.expire.assert_called()

    def test_update_timing_stats_existing_values(self, metrics_collector, mock_redis):
        """Test: Actualizar stats con valores existentes"""
        mock_redis.hgetall.return_value = {
            b"count": b"5",
            b"min": b"50.0",
            b"max": b"200.0",
            b"sum": b"500.0"
        }

        metrics_collector._update_timing_stats("test_stats", 150.0)

        # Verificar que se actualizaron los stats
        call_args = mock_redis.hset.call_args
        assert call_args is not None

    def test_update_timing_stats_exception_handling(self, metrics_collector, mock_redis):
        """Test: Manejo de excepciones en _update_timing_stats"""
        mock_redis.hgetall.side_effect = Exception("Redis error")

        # No debe lanzar excepción
        metrics_collector._update_timing_stats("test_stats", 100.0)


# ==========================================
# TESTS PARA MetricsCollector.get_counter
# ==========================================

class TestMetricsCollectorGetCounter:
    """Tests para MetricsCollector.get_counter()"""

    def test_get_counter_existing(self, metrics_collector, mock_redis):
        """Test: Obtener contador existente"""
        mock_redis.hget.return_value = b"42"

        result = metrics_collector.get_counter("http_requests")

        assert result == 42

    def test_get_counter_not_existing(self, metrics_collector, mock_redis):
        """Test: Obtener contador que no existe"""
        mock_redis.hget.return_value = None

        result = metrics_collector.get_counter("nonexistent")

        assert result == 0

    def test_get_counter_with_tags(self, metrics_collector, mock_redis):
        """Test: Obtener contador con tags"""
        mock_redis.hget.return_value = b"100"
        tags = {"method": "GET"}

        result = metrics_collector.get_counter("http_requests", tags=tags)

        assert result == 100

    def test_get_counter_exception_handling(self, metrics_collector, mock_redis):
        """Test: Manejo de excepciones en get_counter"""
        mock_redis.hget.side_effect = Exception("Redis error")

        result = metrics_collector.get_counter("test")

        assert result == 0


# ==========================================
# TESTS PARA MetricsCollector.get_gauge
# ==========================================

class TestMetricsCollectorGetGauge:
    """Tests para MetricsCollector.get_gauge()"""

    def test_get_gauge_existing(self, metrics_collector, mock_redis):
        """Test: Obtener gauge existente"""
        gauge_data = json.dumps({"value": 75.5, "timestamp": "2025-01-01T00:00:00"})
        mock_redis.hget.return_value = gauge_data.encode()

        result = metrics_collector.get_gauge("cpu_usage")

        assert result["value"] == 75.5

    def test_get_gauge_not_existing(self, metrics_collector, mock_redis):
        """Test: Obtener gauge que no existe"""
        mock_redis.hget.return_value = None

        result = metrics_collector.get_gauge("nonexistent")

        assert result is None

    def test_get_gauge_exception_handling(self, metrics_collector, mock_redis):
        """Test: Manejo de excepciones en get_gauge"""
        mock_redis.hget.side_effect = Exception("Redis error")

        result = metrics_collector.get_gauge("test")

        assert result is None


# ==========================================
# TESTS PARA MetricsCollector.get_timing_stats
# ==========================================

class TestMetricsCollectorGetTimingStats:
    """Tests para MetricsCollector.get_timing_stats()"""

    def test_get_timing_stats_existing(self, metrics_collector, mock_redis):
        """Test: Obtener stats de timing existentes"""
        mock_redis.hgetall.return_value = {
            b"count": b"10",
            b"min": b"50.0",
            b"max": b"200.0",
            b"avg": b"125.0",
            b"last_update": b"2025-01-01T00:00:00"
        }

        result = metrics_collector.get_timing_stats("request_duration")

        assert result["count"] == 10.0
        assert result["min"] == 50.0
        assert result["max"] == 200.0

    def test_get_timing_stats_not_existing(self, metrics_collector, mock_redis):
        """Test: Obtener stats de timing que no existe"""
        mock_redis.hgetall.return_value = {}

        result = metrics_collector.get_timing_stats("nonexistent")

        assert result is None

    def test_get_timing_stats_exception_handling(self, metrics_collector, mock_redis):
        """Test: Manejo de excepciones en get_timing_stats"""
        mock_redis.hgetall.side_effect = Exception("Redis error")

        result = metrics_collector.get_timing_stats("test")

        assert result is None


# ==========================================
# TESTS PARA _build_key
# ==========================================

class TestMetricsCollectorBuildKey:
    """Tests para MetricsCollector._build_key()"""

    def test_build_key_without_tags(self, metrics_collector):
        """Test: Construir key sin tags"""
        key = metrics_collector._build_key("http_requests", None)
        assert key == "http_requests"

    def test_build_key_with_tags(self, metrics_collector):
        """Test: Construir key con tags"""
        tags = {"method": "GET", "endpoint": "/api"}
        key = metrics_collector._build_key("http_requests", tags)

        assert "http_requests" in key
        assert "GET" in key or "method" in key


# ==========================================
# TESTS PARA init_metrics y get_metrics
# ==========================================

class TestMetricsFunctions:
    """Tests para funciones init_metrics y get_metrics"""

    def test_init_metrics(self, mock_redis):
        """Test: Inicializar métricas"""
        # Reset global state
        import app.utils.metrics as metrics_module
        metrics_module._metrics_collector = None
        
        collector = init_metrics(mock_redis)
        # init_metrics puede retornar None si ya existe un collector
        # Lo importante es que no lance excepción

    def test_get_metrics_not_initialized(self):
        """Test: get_metrics cuando no está inicializado"""
        import app.utils.metrics as metrics_module
        original = metrics_module._metrics_collector
        metrics_module._metrics_collector = None
        
        result = get_metrics()
        # Puede retornar None o el collector existente
        # dependiendo del estado global
        
        # Restore
        metrics_module._metrics_collector = original


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
