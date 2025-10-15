#!/usr/bin/env python3
"""
Sistema de Monitoreo y Alertas para Logs
Revisa archivos de log y detecta errores críticos
"""

import os
import sys
import time
import re
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional
from collections import defaultdict
import redis
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class LogMonitor:
    """Monitor de logs con detección de errores y alertas"""
    
    def __init__(
        self,
        log_dir: str = "/app/logs",
        redis_host: str = "redis",
        redis_port: int = 6379,
        redis_db: int = 1,  # DB diferente para no interferir con la app
        check_interval: int = 300,  # 5 minutos
        error_threshold: int = 10,  # Alertar si hay más de 10 errores en 5 min
    ):
        self.log_dir = Path(log_dir)
        self.check_interval = check_interval
        self.error_threshold = error_threshold
        
        # Conectar a Redis para tracking
        try:
            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                decode_responses=True
            )
            self.redis_client.ping()
            print(f"✅ Conectado a Redis ({redis_host}:{redis_port}/DB{redis_db})")
        except Exception as e:
            print(f"⚠️  Redis no disponible: {e}")
            self.redis_client = None
        
        # Patrones de error a detectar
        self.error_patterns = [
            (r"ERROR", "error"),
            (r"CRITICAL", "critical"),
            (r"Exception", "exception"),
            (r"Traceback", "traceback"),
            (r"Failed to connect", "connection_error"),
            (r"500 Internal Server Error", "http_500"),
            (r"Database connection failed", "db_error"),
            (r"Redis connection failed", "redis_error"),
        ]
        
        # Estado de archivos monitoreados
        self.file_positions: Dict[str, int] = {}
        
    def scan_logs(self) -> Dict[str, List[Dict]]:
        """Escanea archivos de log y detecta errores"""
        errors_found = defaultdict(list)
        
        if not self.log_dir.exists():
            print(f"⚠️  Directorio de logs no existe: {self.log_dir}")
            return errors_found
        
        # Buscar archivos .log
        log_files = list(self.log_dir.glob("*.log"))
        
        if not log_files:
            print(f"ℹ️  No se encontraron archivos de log en {self.log_dir}")
            return errors_found
        
        print(f"🔍 Escaneando {len(log_files)} archivos de log...")
        
        for log_file in log_files:
            try:
                # Obtener posición anterior (para leer solo nuevas líneas)
                last_position = self.file_positions.get(str(log_file), 0)
                
                with open(log_file, 'r', encoding='utf-8', errors='ignore') as f:
                    # Ir a la última posición leída
                    f.seek(last_position)
                    
                    # Leer nuevas líneas
                    new_lines = f.readlines()
                    
                    # Guardar nueva posición
                    self.file_positions[str(log_file)] = f.tell()
                
                # Analizar líneas
                for line_num, line in enumerate(new_lines, start=1):
                    for pattern, error_type in self.error_patterns:
                        if re.search(pattern, line, re.IGNORECASE):
                            errors_found[error_type].append({
                                "file": log_file.name,
                                "line": line.strip(),
                                "timestamp": datetime.now().isoformat(),
                                "type": error_type
                            })
                            break
                
                if new_lines:
                    print(f"   📄 {log_file.name}: {len(new_lines)} nuevas líneas analizadas")
                    
            except Exception as e:
                print(f"❌ Error leyendo {log_file}: {e}")
        
        return errors_found
    
    def save_errors_to_redis(self, errors: Dict[str, List[Dict]]):
        """Guarda errores detectados en Redis para tracking"""
        if not self.redis_client:
            return
        
        try:
            timestamp = datetime.now().isoformat()
            
            # Guardar resumen de errores
            for error_type, error_list in errors.items():
                key = f"monitor:errors:{error_type}"
                
                # Incrementar contador
                self.redis_client.hincrby("monitor:error_counts", error_type, len(error_list))
                
                # Guardar últimos errores (max 100)
                for error in error_list[-100:]:
                    self.redis_client.lpush(key, json.dumps(error))
                    self.redis_client.ltrim(key, 0, 99)  # Mantener solo últimos 100
                
                # Agregar a series temporal (para gráficos)
                time_key = f"monitor:errors:timeseries:{error_type}"
                self.redis_client.zadd(
                    time_key,
                    {timestamp: len(error_list)}
                )
                # Limpiar datos antiguos (> 24 horas)
                cutoff = (datetime.now() - timedelta(hours=24)).isoformat()
                self.redis_client.zremrangebyscore(time_key, '-inf', cutoff)
            
            # Actualizar timestamp de última verificación
            self.redis_client.set("monitor:last_check", timestamp)
            
            print(f"✅ Errores guardados en Redis")
            
        except Exception as e:
            print(f"❌ Error guardando en Redis: {e}")
    
    def check_thresholds(self, errors: Dict[str, List[Dict]]) -> List[str]:
        """Verifica si se superaron umbrales de error"""
        alerts = []
        
        total_errors = sum(len(errors[t]) for t in errors)
        
        if total_errors >= self.error_threshold:
            alerts.append(
                f"⚠️  ALERTA: {total_errors} errores detectados en los últimos {self.check_interval}s "
                f"(umbral: {self.error_threshold})"
            )
        
        # Alertas específicas por tipo
        critical_types = ["critical", "db_error", "http_500"]
        for error_type in critical_types:
            if error_type in errors and len(errors[error_type]) > 0:
                alerts.append(
                    f"🚨 CRÍTICO: {len(errors[error_type])} errores de tipo '{error_type}'"
                )
        
        return alerts
    
    def send_alert(self, alerts: List[str], errors: Dict[str, List[Dict]]):
        """Envía alertas (por ahora solo imprime, puede extenderse a email/Slack)"""
        if not alerts:
            return
        
        print("\n" + "="*60)
        print("🚨 ALERTAS DETECTADAS")
        print("="*60)
        
        for alert in alerts:
            print(alert)
        
        print("\nDetalles de errores:")
        for error_type, error_list in errors.items():
            if error_list:
                print(f"\n{error_type.upper()} ({len(error_list)}):")
                for error in error_list[:5]:  # Mostrar solo primeros 5
                    print(f"  - [{error['file']}] {error['line'][:100]}")
                if len(error_list) > 5:
                    print(f"  ... y {len(error_list) - 5} más")
        
        print("="*60 + "\n")
        
        # Guardar alerta en Redis
        if self.redis_client:
            try:
                alert_data = {
                    "timestamp": datetime.now().isoformat(),
                    "alerts": alerts,
                    "total_errors": sum(len(errors[t]) for t in errors)
                }
                self.redis_client.lpush("monitor:alerts", json.dumps(alert_data))
                self.redis_client.ltrim("monitor:alerts", 0, 99)  # Últimos 100
            except Exception as e:
                print(f"❌ Error guardando alerta: {e}")
    
    def get_statistics(self) -> Dict:
        """Obtiene estadísticas desde Redis"""
        if not self.redis_client:
            return {}
        
        try:
            stats = {
                "last_check": self.redis_client.get("monitor:last_check"),
                "error_counts": self.redis_client.hgetall("monitor:error_counts"),
                "total_alerts": self.redis_client.llen("monitor:alerts"),
            }
            return stats
        except Exception as e:
            print(f"❌ Error obteniendo estadísticas: {e}")
            return {}
    
    def run_once(self):
        """Ejecuta una iteración de monitoreo"""
        print(f"\n🔍 Iniciando monitoreo de logs - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Escanear logs
        errors = self.scan_logs()
        
        if errors:
            total = sum(len(errors[t]) for t in errors)
            print(f"⚠️  {total} errores detectados")
            
            # Guardar en Redis
            self.save_errors_to_redis(errors)
            
            # Verificar umbrales
            alerts = self.check_thresholds(errors)
            
            # Enviar alertas si es necesario
            if alerts:
                self.send_alert(alerts, errors)
        else:
            print("✅ No se detectaron errores")
        
        # Mostrar estadísticas
        stats = self.get_statistics()
        if stats.get("error_counts"):
            print("\n📊 Estadísticas acumuladas:")
            for error_type, count in stats["error_counts"].items():
                print(f"   {error_type}: {count}")
    
    def run_forever(self):
        """Ejecuta monitoreo continuo"""
        print("🚀 Monitor de logs iniciado")
        print(f"   Directorio: {self.log_dir}")
        print(f"   Intervalo: {self.check_interval}s")
        print(f"   Umbral de alerta: {self.error_threshold} errores")
        print()
        
        try:
            while True:
                self.run_once()
                print(f"⏳ Esperando {self.check_interval}s hasta próxima verificación...\n")
                time.sleep(self.check_interval)
        except KeyboardInterrupt:
            print("\n👋 Monitor detenido por usuario")
        except Exception as e:
            print(f"\n❌ Error fatal: {e}")
            raise


def main():
    """Función principal"""
    # Configuración desde variables de entorno
    log_dir = os.getenv("LOG_DIR", "/app/logs")
    redis_host = os.getenv("REDIS_HOST", "redis")
    redis_port = int(os.getenv("REDIS_PORT", "6379"))
    check_interval = int(os.getenv("MONITOR_INTERVAL", "300"))  # 5 minutos
    error_threshold = int(os.getenv("MONITOR_THRESHOLD", "10"))
    
    # Modo de ejecución
    mode = sys.argv[1] if len(sys.argv) > 1 else "run"
    
    monitor = LogMonitor(
        log_dir=log_dir,
        redis_host=redis_host,
        redis_port=redis_port,
        check_interval=check_interval,
        error_threshold=error_threshold,
    )
    
    if mode == "once":
        # Ejecutar una sola vez (útil para cron)
        monitor.run_once()
    elif mode == "stats":
        # Mostrar estadísticas
        stats = monitor.get_statistics()
        print(json.dumps(stats, indent=2))
    else:
        # Ejecutar continuamente
        monitor.run_forever()


if __name__ == "__main__":
    main()
