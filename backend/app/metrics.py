"""
Sistema de Métricas con Redis
Tracking simple de métricas de aplicación sin necesidad de Prometheus
"""

import time
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from functools import wraps
import json
import redis


class MetricsCollector:
    """Colector de métricas simple usando Redis"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.prefix = "metrics"
        
    def increment(self, metric_name: str, value: int = 1, tags: Optional[Dict[str, str]] = None):
        """
        Incrementa un contador
        
        Args:
            metric_name: Nombre de la métrica (ej: 'http_requests')
            value: Cantidad a incrementar
            tags: Tags opcionales (ej: {'method': 'GET', 'endpoint': '/api/users'})
        """
        try:
            key = self._build_key(metric_name, tags)
            self.redis.hincrby(f"{self.prefix}:counters", key, value)
            
            # También guardar en serie temporal por hora
            hour_key = datetime.now().strftime("%Y-%m-%d-%H")
            timeseries_key = f"{self.prefix}:timeseries:{metric_name}:{hour_key}"
            self.redis.hincrby(timeseries_key, key, value)
            self.redis.expire(timeseries_key, 86400 * 7)  # 7 días
            
        except Exception as e:
            print(f"Error incrementando métrica {metric_name}: {e}")
    
    def gauge(self, metric_name: str, value: float, tags: Optional[Dict[str, str]] = None):
        """
        Establece un valor gauge (instantáneo)
        
        Args:
            metric_name: Nombre de la métrica (ej: 'active_users')
            value: Valor actual
            tags: Tags opcionales
        """
        try:
            key = self._build_key(metric_name, tags)
            data = {
                "value": value,
                "timestamp": datetime.now().isoformat()
            }
            self.redis.hset(f"{self.prefix}:gauges", key, json.dumps(data))
        except Exception as e:
            print(f"Error guardando gauge {metric_name}: {e}")
    
    def timing(self, metric_name: str, duration_ms: float, tags: Optional[Dict[str, str]] = None):
        """
        Registra una duración
        
        Args:
            metric_name: Nombre de la métrica (ej: 'http_request_duration')
            duration_ms: Duración en milisegundos
            tags: Tags opcionales
        """
        try:
            key = self._build_key(metric_name, tags)
            
            # Guardar en lista circular (últimas 1000 mediciones)
            list_key = f"{self.prefix}:timings:{key}"
            self.redis.lpush(list_key, duration_ms)
            self.redis.ltrim(list_key, 0, 999)
            
            # Actualizar estadísticas
            stats_key = f"{self.prefix}:timing_stats:{key}"
            self._update_timing_stats(stats_key, duration_ms)
            
        except Exception as e:
            print(f"Error guardando timing {metric_name}: {e}")
    
    def _update_timing_stats(self, stats_key: str, value: float):
        """Actualiza estadísticas de timing (min, max, avg, count)"""
        try:
            # Obtener stats actuales
            stats = self.redis.hgetall(stats_key)
            
            count = int(stats.get(b"count", 0)) + 1 if stats else 1
            current_min = float(stats.get(b"min", value)) if stats else value
            current_max = float(stats.get(b"max", value)) if stats else value
            current_sum = float(stats.get(b"sum", 0)) + value if stats else value
            
            # Calcular nuevos valores
            new_stats = {
                "count": count,
                "min": min(current_min, value),
                "max": max(current_max, value),
                "sum": current_sum,
                "avg": current_sum / count,
                "last_value": value,
                "last_update": datetime.now().isoformat()
            }
            
            self.redis.hset(stats_key, mapping=new_stats)
            self.redis.expire(stats_key, 86400 * 7)  # 7 días
            
        except Exception as e:
            print(f"Error actualizando timing stats: {e}")
    
    def get_counter(self, metric_name: str, tags: Optional[Dict[str, str]] = None) -> int:
        """Obtiene el valor de un contador"""
        try:
            key = self._build_key(metric_name, tags)
            value = self.redis.hget(f"{self.prefix}:counters", key)
            return int(value) if value else 0
        except Exception as e:
            print(f"Error obteniendo contador {metric_name}: {e}")
            return 0
    
    def get_gauge(self, metric_name: str, tags: Optional[Dict[str, str]] = None) -> Optional[Dict]:
        """Obtiene el valor de un gauge"""
        try:
            key = self._build_key(metric_name, tags)
            value = self.redis.hget(f"{self.prefix}:gauges", key)
            return json.loads(value) if value else None
        except Exception as e:
            print(f"Error obteniendo gauge {metric_name}: {e}")
            return None
    
    def get_timing_stats(self, metric_name: str, tags: Optional[Dict[str, str]] = None) -> Optional[Dict]:
        """Obtiene estadísticas de timing"""
        try:
            key = self._build_key(metric_name, tags)
            stats_key = f"{self.prefix}:timing_stats:{key}"
            stats = self.redis.hgetall(stats_key)
            
            if not stats:
                return None
            
            return {
                k.decode(): float(v) if k.decode() != "last_update" else v.decode()
                for k, v in stats.items()
            }
        except Exception as e:
            print(f"Error obteniendo timing stats {metric_name}: {e}")
            return None
    
    def get_all_metrics(self) -> Dict[str, Any]:
        """Obtiene todas las métricas disponibles"""
        try:
            counters = self.redis.hgetall(f"{self.prefix}:counters")
            gauges = self.redis.hgetall(f"{self.prefix}:gauges")
            
            return {
                "counters": {
                    k.decode(): int(v) 
                    for k, v in counters.items()
                },
                "gauges": {
                    k.decode(): json.loads(v)
                    for k, v in gauges.items()
                }
            }
        except Exception as e:
            print(f"Error obteniendo todas las métricas: {e}")
            return {}
    
    def _build_key(self, metric_name: str, tags: Optional[Dict[str, str]] = None) -> str:
        """Construye la clave de Redis con tags"""
        if not tags:
            return metric_name
        
        tag_str = ",".join(f"{k}={v}" for k, v in sorted(tags.items()))
        return f"{metric_name}{{{tag_str}}}"


def timer(metric_name: str, tags: Optional[Dict[str, str]] = None):
    """
    Decorador para medir tiempo de ejecución de funciones
    
    Ejemplo:
        @timer("db_query", tags={"table": "users"})
        def get_users():
            ...
    """
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start = time.time()
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                duration_ms = (time.time() - start) * 1000
                # TODO: Obtener metrics collector del contexto
                print(f"⏱️  {metric_name}: {duration_ms:.2f}ms")
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start = time.time()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                duration_ms = (time.time() - start) * 1000
                print(f"⏱️  {metric_name}: {duration_ms:.2f}ms")
        
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


# Singleton global (se inicializa en main.py)
_metrics_collector: Optional[MetricsCollector] = None


def init_metrics(redis_client: redis.Redis):
    """Inicializa el colector de métricas global"""
    global _metrics_collector
    _metrics_collector = MetricsCollector(redis_client)


def get_metrics() -> Optional[MetricsCollector]:
    """Obtiene el colector de métricas global"""
    return _metrics_collector
