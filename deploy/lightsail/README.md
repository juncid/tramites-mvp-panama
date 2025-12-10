# Despliegue en AWS Lightsail - MVP (4GB RAM)

Esta guía describe cómo desplegar el MVP del Sistema de Trámites Migratorios de Panamá en una instancia de AWS Lightsail con 4GB de RAM.

## Requisitos

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| RAM | 4GB | 8GB |
| CPU | 2 vCPU | 2 vCPU |
| Almacenamiento | 40GB SSD | 80GB SSD |
| Sistema Operativo | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Costo Estimado

| Plan Lightsail | Especificaciones | Precio/mes |
|----------------|------------------|------------|
| **$20** | 2 vCPU, 4GB RAM, 80GB SSD | $20 USD |
| $40 | 2 vCPU, 8GB RAM, 160GB SSD | $40 USD |

## Distribución de Memoria (4GB + 4GB Swap)

| Contenedor | RAM Límite | RAM Reservada |
|------------|------------|---------------|
| SQL Server | 2GB | 1GB |
| Backend (FastAPI) | 768MB | 256MB |
| Celery Worker | 768MB | 256MB |
| Celery Beat | 192MB | 64MB |
| Redis | 192MB | 64MB |
| Frontend (Nginx) | 128MB | 32MB |
| **Total** | ~4GB | ~1.7GB |
| **Swap** | 4GB | - |

## Instalación Rápida

### 1. Crear Instancia en Lightsail

1. Ve a [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click "Create instance"
3. Selecciona:
   - Region: La más cercana a tus usuarios
   - Platform: Linux/Unix
   - Blueprint: Ubuntu 22.04 LTS
   - Instance plan: $20/month (4GB RAM)
4. Nombra tu instancia: `tramites-panama-mvp`
5. Click "Create instance"

### 2. Configurar Networking

1. Ve a tu instancia → Networking
2. Crea una IP estática (Static IP)
3. Configura el Firewall:
   - SSH (22) - Ya habilitado
   - HTTP (80) - Agregar
   - HTTPS (443) - Agregar
   - Custom (8000) - Agregar temporalmente para API

### 3. Conectar por SSH

```bash
# Desde la consola de Lightsail, click "Connect using SSH"
# O usa tu propia terminal:
ssh -i ~/.ssh/LightsailDefaultKey-us-east-1.pem ubuntu@YOUR_PUBLIC_IP
```

### 4. Ejecutar Script de Instalación

```bash
# Descargar y ejecutar el script de instalación
curl -fsSL https://raw.githubusercontent.com/juncid/tramites-mvp-panama/main/deploy/lightsail/install.sh -o install.sh
chmod +x install.sh
./install.sh
```

O manualmente:

```bash
# Clonar repositorio
git clone https://github.com/juncid/tramites-mvp-panama.git ~/tramites-panama
cd ~/tramites-panama/deploy/lightsail

# Configurar swap (IMPORTANTE para 4GB RAM)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo sysctl vm.swappiness=10

# Configurar variables de entorno
cp .env.example .env
nano .env  # Editar con tus valores
```

### 5. Iniciar Contenedores

```bash
cd ~/tramites-panama/deploy/lightsail

# Iniciar todos los servicios
docker compose -f docker-compose.lightsail.yml up -d

# Ver estado
docker compose -f docker-compose.lightsail.yml ps

# Ver logs
docker compose -f docker-compose.lightsail.yml logs -f
```

### 6. Inicializar Base de Datos (Primera vez)

```bash
# Esperar a que SQL Server esté listo (puede tardar 1-2 minutos)
docker compose -f docker-compose.lightsail.yml logs sqlserver

# Inicializar BD
docker compose -f docker-compose.lightsail.yml exec backend python /app/scripts/init_database.py

# Aplicar migraciones
docker compose -f docker-compose.lightsail.yml exec backend alembic upgrade head

# (Opcional) Cargar datos de prueba
docker compose -f docker-compose.lightsail.yml exec backend python /app/scripts/seed_test_data.py --all
```

## Verificación

### Endpoints de Health Check

```bash
# Backend API
curl http://YOUR_PUBLIC_IP:8000/health

# Frontend
curl http://YOUR_PUBLIC_IP/
```

### Acceso a la Aplicación

- **Frontend:** http://YOUR_PUBLIC_IP/
- **API Docs:** http://YOUR_PUBLIC_IP:8000/docs
- **API Health:** http://YOUR_PUBLIC_IP:8000/health

## Comandos Útiles

```bash
# Ver estado de contenedores
docker compose -f docker-compose.lightsail.yml ps

# Ver logs de un servicio específico
docker compose -f docker-compose.lightsail.yml logs -f backend
docker compose -f docker-compose.lightsail.yml logs -f celery-worker

# Reiniciar un servicio
docker compose -f docker-compose.lightsail.yml restart backend

# Detener todo
docker compose -f docker-compose.lightsail.yml down

# Detener y eliminar volúmenes (¡CUIDADO! Borra datos)
docker compose -f docker-compose.lightsail.yml down -v

# Ver uso de memoria
free -h
docker stats --no-stream

# Ver uso de disco
df -h
```

## Troubleshooting

### SQL Server no inicia

```bash
# Verificar logs
docker compose -f docker-compose.lightsail.yml logs sqlserver

# Verificar memoria
free -h

# Si no hay suficiente swap:
sudo swapon --show
```

### OCR muy lento

Con 4GB RAM, el OCR puede ser lento. Opciones:
1. Reducir resolución de imágenes antes de OCR
2. Limitar concurrencia de Celery (ya está en 2)
3. Aumentar timeout de OCR

### Contenedor muere por OOM (Out of Memory)

```bash
# Ver logs del kernel
dmesg | grep -i "killed process"

# Aumentar swap si es necesario
sudo swapoff /swapfile
sudo fallocate -l 6G /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Actualización

```bash
cd /opt/tramites-panama

# Obtener últimos cambios
git pull origin main

# Reconstruir y reiniciar
docker compose -f deploy/lightsail/docker-compose.lightsail.yml up -d --build
```

## Backup

```bash
# Backup de SQL Server
docker exec tramites-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YOUR_PASSWORD" -C \
  -Q "BACKUP DATABASE SIM_PANAMA TO DISK = '/var/opt/mssql/backup/sim_panama.bak'"

# Copiar backup a host
docker cp tramites-sqlserver:/var/opt/mssql/backup/sim_panama.bak ./backup/

# Backup de uploads
tar -czf uploads_backup.tar.gz /var/lib/docker/volumes/tramites-uploads-data/
```

## Seguridad (Producción)

Para un entorno más seguro:

1. **Cambiar contraseñas** por defecto en `.env`
2. **Configurar SSL** con Let's Encrypt
3. **Cerrar puerto 8000** y usar Nginx como reverse proxy
4. **Habilitar Redis password**
5. **Configurar backups automáticos**

---

## Soporte

Para problemas o preguntas:
- Crear issue en GitHub
- Revisar logs con `docker compose logs`
