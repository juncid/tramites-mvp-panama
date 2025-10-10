# Guía de Despliegue a Producción

## Preparación

### 1. Configurar Variables de Entorno

Crea un archivo `.env.prod` basado en `.env.prod.example`:

```bash
cp .env.prod.example .env.prod
```

Edita `.env.prod` con valores seguros:
- Cambia todas las contraseñas por valores fuertes y únicos
- Actualiza `API_URL` con tu dominio real

### 2. Configuración SSL/TLS (Recomendado)

Para producción, es altamente recomendable usar HTTPS. Puedes usar:
- **Let's Encrypt** con Certbot
- **Nginx Proxy Manager**
- **Traefik** como reverse proxy
- **Cloudflare** para SSL

## Despliegue con Docker Compose

### Opción 1: Servidor Linux (Ubuntu/Debian)

#### Paso 1: Preparar el Servidor

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

#### Paso 2: Clonar el Repositorio

```bash
# Clonar el proyecto
git clone https://github.com/juncid/tramites-mvp-panama.git
cd tramites-mvp-panama

# Configurar variables de entorno
cp .env.prod.example .env.prod
nano .env.prod  # Editar con valores de producción
```

#### Paso 3: Desplegar

```bash
# Desplegar con Docker Compose en modo producción
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Verificar estado
docker compose -f docker-compose.prod.yml ps

# Ver logs
docker compose -f docker-compose.prod.yml logs -f
```

### Opción 2: Con Nginx Reverse Proxy y SSL

#### Paso 1: Instalar Nginx y Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx
```

#### Paso 2: Configurar Nginx

Crea `/etc/nginx/sites-available/tramites`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Habilitar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/tramites /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Paso 3: Configurar SSL con Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com
```

### Opción 3: Docker Swarm (Alta Disponibilidad)

```bash
# Inicializar Swarm
docker swarm init

# Desplegar stack
docker stack deploy -c docker-compose.prod.yml tramites

# Verificar servicios
docker stack services tramites
```

## Monitoreo y Mantenimiento

### Ver Logs

```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Un servicio específico
docker compose -f docker-compose.prod.yml logs -f backend
```

### Backup de Base de Datos

```bash
# Crear backup
docker compose -f docker-compose.prod.yml exec sqlserver \
  /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "${SQL_PASSWORD}" \
  -Q "BACKUP DATABASE tramites_db TO DISK = N'/var/opt/mssql/backup/tramites_backup.bak'"

# Copiar backup al host
docker cp tramites-sqlserver-prod:/var/opt/mssql/backup/tramites_backup.bak ./backup/
```

### Restaurar Base de Datos

```bash
# Copiar backup al contenedor
docker cp ./backup/tramites_backup.bak tramites-sqlserver-prod:/var/opt/mssql/backup/

# Restaurar
docker compose -f docker-compose.prod.yml exec sqlserver \
  /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "${SQL_PASSWORD}" \
  -Q "RESTORE DATABASE tramites_db FROM DISK = N'/var/opt/mssql/backup/tramites_backup.bak' WITH REPLACE"
```

### Actualizar la Aplicación

```bash
# Pull últimos cambios
git pull origin main

# Reconstruir y reiniciar servicios
docker compose -f docker-compose.prod.yml up -d --build

# Verificar
docker compose -f docker-compose.prod.yml ps
```

## Configuración de Firewall

```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

## Optimizaciones de Producción

### 1. Configurar Límites de Recursos

Edita `docker-compose.prod.yml` para agregar límites:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 2. Configurar Logs Rotation

Crea `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Reinicia Docker:

```bash
sudo systemctl restart docker
```

### 3. Configurar Backup Automático

Crea un script `/root/backup-tramites.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/tramites"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

docker compose -f /path/to/docker-compose.prod.yml exec -T sqlserver \
  /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "${SQL_PASSWORD}" \
  -Q "BACKUP DATABASE tramites_db TO DISK = N'/var/opt/mssql/backup/tramites_${DATE}.bak'"

docker cp tramites-sqlserver-prod:/var/opt/mssql/backup/tramites_${DATE}.bak \
  $BACKUP_DIR/

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "tramites_*.bak" -mtime +7 -delete
```

Agregar a crontab:

```bash
sudo crontab -e
# Agregar: Backup diario a las 2 AM
0 2 * * * /root/backup-tramites.sh
```

## Monitoreo

### Healthchecks

Los servicios tienen healthchecks configurados. Para verificar:

```bash
docker compose -f docker-compose.prod.yml ps
```

### Logs Centralizados (Opcional)

Considera usar herramientas como:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana + Loki**
- **CloudWatch** (AWS)
- **Azure Monitor** (Azure)

## Seguridad en Producción

### Checklist de Seguridad

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Configurar SSL/TLS (HTTPS)
- [ ] Configurar firewall (UFW)
- [ ] Mantener Docker actualizado
- [ ] Configurar backups automáticos
- [ ] Implementar rate limiting en Nginx
- [ ] Configurar CORS apropiadamente
- [ ] Usar secrets management (Docker Secrets o similar)
- [ ] Mantener logs pero con rotación
- [ ] Monitorear recursos del sistema
- [ ] Configurar alertas de disponibilidad
- [ ] Implementar autenticación y autorización
- [ ] Regular security audits

## Escalabilidad

### Escalar Servicios Horizontalmente

```bash
# Escalar backend
docker compose -f docker-compose.prod.yml up -d --scale backend=3

# Escalar con Docker Swarm
docker service scale tramites_backend=3
```

### Load Balancer

Para múltiples instancias del backend, configura Nginx como load balancer:

```nginx
upstream backend {
    server localhost:8001;
    server localhost:8002;
    server localhost:8003;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

## Troubleshooting en Producción

### Contenedor no inicia

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs [servicio]

# Verificar configuración
docker compose -f docker-compose.prod.yml config

# Verificar recursos
docker stats
```

### Base de datos con problemas

```bash
# Verificar conectividad
docker compose -f docker-compose.prod.yml exec backend \
  python -c "from app.database import engine; print(engine.connect())"

# Verificar estado de SQL Server
docker compose -f docker-compose.prod.yml exec sqlserver \
  /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "${SQL_PASSWORD}" \
  -Q "SELECT @@VERSION"
```

### Alto uso de recursos

```bash
# Monitorear recursos
docker stats

# Limpiar recursos no utilizados
docker system prune -a
```

## Rollback

Si algo sale mal:

```bash
# Ver commits
git log --oneline

# Volver a versión anterior
git checkout <commit-hash>

# Reconstruir
docker compose -f docker-compose.prod.yml up -d --build
```

## Soporte

Para problemas en producción:
1. Revisar logs: `docker compose -f docker-compose.prod.yml logs`
2. Verificar recursos: `docker stats`
3. Revisar documentación
4. Crear issue en GitHub con detalles del error
