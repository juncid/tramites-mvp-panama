# 7. Monitoreo y Logs

Sistema completo de logging, métricas, dashboards y alertas para monitoreo proactivo del sistema.

---

## 7.1 Sistema de Logging

### Configuración de Logging

```python
# app/logging_config.py
import logging
import sys
from datetime import datetime
import json

class JSONFormatter(logging.Formatter):
    """Formatter para logs en formato JSON"""
    
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Agregar request_id si existe
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        
        # Agregar exception info si existe
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        # Agregar campos extra
        for key, value in record.__dict__.items():
            if key not in ['name', 'msg', 'args', 'created', 'filename', 
                          'funcName', 'levelname', 'levelno', 'lineno',
                          'module', 'msecs', 'pathname', 'process', 
                          'processName', 'relativeCreated', 'thread', 
                          'threadName', 'exc_info', 'exc_text', 'stack_info']:
                log_data[key] = value
        
        return json.dumps(log_data)

def setup_logging(log_level: str = "INFO"):
    """Configurar logging del sistema"""
    
    # Logger principal
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level))
    
    # Handler para consola (JSON)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(JSONFormatter())
    logger.addHandler(console_handler)
    
    # Handler para archivo
    file_handler = logging.FileHandler('/app/logs/app.log')
    file_handler.setFormatter(JSONFormatter())
    logger.addHandler(file_handler)
    
    return logger
```

### Middleware de Request ID

```python
# app/middleware/request_id.py
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import uuid
import logging

logger = logging.getLogger(__name__)

class RequestIDMiddleware(BaseHTTPMiddleware):
    """Agregar UUID único a cada request para trazabilidad"""
    
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Agregar a contexto de logging
        log_extra = {'request_id': request_id}
        
        logger.info(
            "Request iniciado",
            extra={
                **log_extra,
                'method': request.method,
                'url': str(request.url),
                'client_ip': request.client.host
            }
        )
        
        response = await call_next(request)
        
        logger.info(
            "Request completado",
            extra={
                **log_extra,
                'status_code': response.status_code
            }
        )
        
        response.headers["X-Request-ID"] = request_id
        return response
```

### Logging en Endpoints

```python
import logging
from fastapi import Request

logger = logging.getLogger(__name__)

@app.post("/tramites")
async def create_tramite(tramite: TramiteCreate, request: Request):
    """Crear trámite con logging estructurado"""
    
    log_extra = {'request_id': request.state.request_id}
    
    logger.info(
        "Creando trámite",
        extra={
            **log_extra,
            'tipo_tramite': tramite.tipo_tramite_id,
            'solicitante': tramite.solicitante_nombre
        }
    )
    
    try:
        # Lógica de creación
        nuevo_tramite = db.add(tramite)
        
        logger.info(
            "Trámite creado exitosamente",
            extra={
                **log_extra,
                'tramite_id': nuevo_tramite.id
            }
        )
        
        return nuevo_tramite
        
    except Exception as e:
        logger.error(
            "Error al crear trámite",
            extra={
                **log_extra,
                'error': str(e),
                'tipo_tramite': tramite.tipo_tramite_id
            },
            exc_info=True
        )
        raise
```

---

## 7.2 Prometheus y Métricas

### Docker Compose con Prometheus

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
    ports:
      - "9090:9090"
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - "3001:3000"
    networks:
      - monitoring
    depends_on:
      - prometheus

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    ports:
      - "9100:9100"
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:

networks:
  monitoring:
    driver: bridge
```

### Configuración de Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
  
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
  
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - '/etc/prometheus/alerts/*.yml'
```

### Instrumentación FastAPI

```python
# app/metrics.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from prometheus_fastapi_instrumentator import Instrumentator

# Métricas personalizadas
request_count = Counter(
    'http_requests_total',
    'Total de requests HTTP',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'Duración de requests HTTP',
    ['method', 'endpoint']
)

active_connections = Gauge(
    'active_connections',
    'Conexiones activas'
)

tramites_created = Counter(
    'tramites_created_total',
    'Total de trámites creados',
    ['tipo_tramite']
)

database_query_duration = Histogram(
    'database_query_duration_seconds',
    'Duración de queries a base de datos',
    ['query_type']
)

# Instrumentar FastAPI
def setup_metrics(app):
    """Configurar métricas de Prometheus"""
    
    instrumentator = Instrumentator(
        should_group_status_codes=False,
        should_ignore_untemplated=True,
        should_respect_env_var=True,
        should_instrument_requests_inprogress=True,
        excluded_handlers=[".*admin.*", "/metrics"],
        env_var_name="ENABLE_METRICS",
        inprogress_name="http_requests_inprogress",
        inprogress_labels=True,
    )
    
    instrumentator.instrument(app).expose(app, endpoint="/metrics")
    
    return instrumentator

# Uso en endpoints
@app.post("/tramites")
async def create_tramite(tramite: TramiteCreate):
    with request_duration.labels(
        method='POST',
        endpoint='/tramites'
    ).time():
        
        nuevo_tramite = create_tramite_logic(tramite)
        
        tramites_created.labels(
            tipo_tramite=tramite.tipo_tramite_id
        ).inc()
        
        return nuevo_tramite
```

---

## 7.3 Dashboards Grafana

### Dashboard API Performance

```json
{
  "dashboard": {
    "title": "API Performance",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ],
        "yaxes": [
          {"format": "reqps", "label": "Requests/sec"}
        ]
      },
      {
        "id": 2,
        "title": "Response Time (p95)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "{{endpoint}}"
          }
        ],
        "yaxes": [
          {"format": "s", "label": "Duration"}
        ]
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ],
        "alert": {
          "conditions": [
            {
              "evaluator": {"params": [10], "type": "gt"},
              "query": {"params": ["A", "5m", "now"]}
            }
          ]
        }
      },
      {
        "id": 4,
        "title": "Active Connections",
        "type": "stat",
        "targets": [
          {
            "expr": "active_connections"
          }
        ]
      }
    ],
    "time": {"from": "now-1h", "to": "now"},
    "refresh": "10s"
  }
}
```

### Dashboard Database

```json
{
  "dashboard": {
    "title": "Database Metrics",
    "panels": [
      {
        "id": 1,
        "title": "Connection Pool",
        "type": "graph",
        "targets": [
          {
            "expr": "sqlserver_connection_pool_active",
            "legendFormat": "Active"
          },
          {
            "expr": "sqlserver_connection_pool_idle",
            "legendFormat": "Idle"
          }
        ]
      },
      {
        "id": 2,
        "title": "Query Duration (p99)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.99, rate(database_query_duration_seconds_bucket[5m]))",
            "legendFormat": "{{query_type}}"
          }
        ]
      },
      {
        "id": 3,
        "title": "Slow Queries (>1s)",
        "type": "table",
        "targets": [
          {
            "expr": "topk(10, sum by (query) (rate(slow_queries_total[5m])))"
          }
        ]
      }
    ]
  }
}
```

---

## 7.4 Alertas Automáticas

### Reglas de Alerta

```yaml
# prometheus/alerts/api-alerts.yml
groups:
  - name: api_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Tasa alta de errores en API"
          description: "{{ $labels.endpoint }} tiene {{ $value }}% de errores"
      
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Latencia alta en API"
          description: "P95 latency es {{ $value }}s en {{ $labels.endpoint }}"
      
      - alert: APIDown
        expr: up{job="backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "API no responde"
          description: "Backend API está caído"
      
      - alert: HighCPU
        expr: rate(process_cpu_seconds_total[5m]) > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "CPU alto en backend"
          description: "CPU usage: {{ $value }}%"
      
      - alert: HighMemory
        expr: process_resident_memory_bytes / 1024 / 1024 > 1024
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Memoria alta en backend"
          description: "Usando {{ $value }}MB de RAM"
      
      - alert: SlowDatabase
        expr: histogram_quantile(0.99, rate(database_query_duration_seconds_bucket[5m])) > 5
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Base de datos lenta"
          description: "P99 query time: {{ $value }}s"
```

### Alertmanager

```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alertas@gob.pa'
  smtp_auth_username: 'alertas@gob.pa'
  smtp_auth_password: 'password'

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
      continue: true
    
    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'default'
    email_configs:
      - to: 'devops@gob.pa'
  
  - name: 'critical-alerts'
    email_configs:
      - to: 'oncall@gob.pa'
        headers:
          Subject: '[CRÍTICO] {{ .GroupLabels.alertname }}'
    
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts-critical'
        title: 'ALERTA CRÍTICA'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
    
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'
  
  - name: 'warning-alerts'
    email_configs:
      - to: 'devops@gob.pa'
    
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts-warning'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

---

## 7.5 ELK Stack (Elasticsearch, Logstash, Kibana)

### Docker Compose ELK

```yaml
# docker-compose.elk.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - elk

  logstash:
    image: docker.elastic.co/logstash/logstash:8.10.0
    container_name: logstash
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logs:/logs:ro
    ports:
      - "5000:5000"
      - "9600:9600"
    networks:
      - elk
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.10.0
    container_name: kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    networks:
      - elk
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:

networks:
  elk:
    driver: bridge
```

### Logstash Pipeline

```ruby
# logstash/pipeline/logstash.conf
input {
  file {
    path => "/logs/app.json"
    start_position => "beginning"
    codec => json
    type => "application"
  }
  
  file {
    path => "/logs/access.log"
    start_position => "beginning"
    type => "nginx"
  }
}

filter {
  if [type] == "application" {
    # Ya viene en JSON
    mutate {
      add_field => { "[@metadata][target_index]" => "app-logs" }
    }
  }
  
  if [type] == "nginx" {
    grok {
      match => { 
        "message" => "%{IPORHOST:client_ip} - - \[%{HTTPDATE:timestamp}\] \"%{WORD:method} %{URIPATHPARAM:request} HTTP/%{NUMBER:http_version}\" %{NUMBER:status} %{NUMBER:bytes} \"%{DATA:referrer}\" \"%{DATA:user_agent}\""
      }
    }
    
    date {
      match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
      target => "@timestamp"
    }
    
    mutate {
      add_field => { "[@metadata][target_index]" => "nginx-logs" }
      convert => {
        "status" => "integer"
        "bytes" => "integer"
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][target_index]}-%{+YYYY.MM.dd}"
  }
  
  stdout {
    codec => rubydebug
  }
}
```

---

## 7.6 Health Checks

### Endpoint de Health Check

```python
from fastapi import APIRouter
from sqlalchemy import text
import redis

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check básico"""
    return {"status": "ok", "service": "tramites-api"}

@router.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """Health check detallado con dependencias"""
    
    health = {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {}
    }
    
    # Check Database
    try:
        db.execute(text("SELECT 1"))
        health["checks"]["database"] = {
            "status": "ok",
            "response_time_ms": 5
        }
    except Exception as e:
        health["status"] = "degraded"
        health["checks"]["database"] = {
            "status": "error",
            "error": str(e)
        }
    
    # Check Redis
    try:
        redis_client = get_redis()
        redis_client.ping()
        health["checks"]["redis"] = {
            "status": "ok"
        }
    except Exception as e:
        health["status"] = "degraded"
        health["checks"]["redis"] = {
            "status": "error",
            "error": str(e)
        }
    
    # Check Disk Space
    import shutil
    disk_usage = shutil.disk_usage("/")
    disk_percent = (disk_usage.used / disk_usage.total) * 100
    
    health["checks"]["disk"] = {
        "status": "ok" if disk_percent < 90 else "warning",
        "usage_percent": round(disk_percent, 2),
        "free_gb": round(disk_usage.free / (1024**3), 2)
    }
    
    if disk_percent >= 90:
        health["status"] = "degraded"
    
    return health
```

---

## Navegación

[← Seguridad](06-seguridad.md) | [Manual Técnico](index.md) | [Troubleshooting →](08-troubleshooting.md)
