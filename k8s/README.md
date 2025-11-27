# Kubernetes Deployment Guide

## Overview

This guide covers deploying Tramites MVP Panama to Kubernetes, both for EKS staging and on-premise production environments.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Kubernetes Cluster                            │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    tramites-staging namespace                    │ │
│  │                                                                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │ │
│  │  │ Frontend │  │ Backend  │  │  Celery  │  │  Celery Worker   │ │ │
│  │  │ (nginx)  │  │ (FastAPI)│  │   Beat   │  │  (OCR tasks)     │ │ │
│  │  │  x2      │  │   x2     │  │   x1     │  │  x2-5 (HPA)      │ │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │ │
│  │       │             │             │                 │           │ │
│  │       │             └─────┬───────┴─────────────────┘           │ │
│  │       │                   │                                     │ │
│  │  ┌────▼─────┐       ┌─────▼────┐      ┌─────────────────────┐  │ │
│  │  │ NodePort │       │  Redis   │      │    SQL Server       │  │ │
│  │  │  :30080  │       │  (cache  │      │    (database)       │  │ │
│  │  │  :30800  │       │  +broker)│      │    + Backup CronJob │  │ │
│  │  └──────────┘       └──────────┘      └─────────────────────┘  │ │
│  │                                                                  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

### For EKS Staging
- AWS CLI configured with appropriate permissions
- kubectl configured for EKS cluster
- ECR repositories created:
  - `tramites-backend`
  - `tramites-frontend`

### For On-Premise
- Kubernetes cluster (1.25+)
- kubectl configured
- Harbor registry or private registry
- NFS server (for persistent storage)

## Quick Start

### 1. Install Cluster Dependencies

```bash
# For EKS (minimal)
./scripts/k8s/install-cluster-addons.sh

# For On-Premise (with Ingress and NFS)
NFS_SERVER=192.168.1.100 NFS_PATH=/exports/k8s ./scripts/k8s/install-cluster-addons.sh --with-ingress --with-nfs
```

### 2. Configure Secrets

Create a sealed secret for database credentials:

```bash
# Create secret file
cat > /tmp/secrets.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: tramites-secrets
  namespace: tramites-staging
type: Opaque
stringData:
  DATABASE_USER: "sa"
  DATABASE_PASSWORD: "YourSecurePassword123!"
  SA_PASSWORD: "YourSecurePassword123!"
  REDIS_PASSWORD: ""
EOF

# Seal it (requires kubeseal)
kubeseal --format yaml < /tmp/secrets.yaml > k8s/base/secrets/sealedsecret.yaml

# Clean up
rm /tmp/secrets.yaml
```

### 3. Deploy

```bash
# Deploy to EKS staging
./scripts/k8s/deploy.sh staging

# Deploy to on-premise
./scripts/k8s/deploy.sh onpremise
```

## Directory Structure

```
k8s/
├── base/                           # Base manifests (shared)
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets/
│   │   └── secrets-template.yaml   # Template for sealed secrets
│   ├── sqlserver/
│   │   ├── statefulset.yaml        # SQL Server deployment
│   │   ├── backup-cronjob.yaml     # Daily backup job
│   │   └── kustomization.yaml
│   ├── redis/
│   │   ├── statefulset.yaml
│   │   └── kustomization.yaml
│   ├── backend/
│   │   ├── deployment.yaml
│   │   └── kustomization.yaml
│   ├── celery/
│   │   ├── deployment.yaml         # Worker, Beat, Flower
│   │   ├── hpa.yaml                # Autoscaler for workers
│   │   └── kustomization.yaml
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   └── kustomization.yaml
│   └── kustomization.yaml
├── overlays/
│   ├── staging/                    # EKS staging overlay
│   │   ├── kustomization.yaml      # ECR images, EBS storage
│   │   └── nodeport-services.yaml  # NodePort access
│   └── onpremise/                  # On-premise overlay
│       ├── kustomization.yaml      # Harbor images, NFS storage
│       ├── ingress.yaml            # Nginx Ingress
│       └── nfs-storageclass.yaml
└── infrastructure/                 # Cluster addons (optional)
    ├── nginx-ingress.yaml
    ├── cert-manager.yaml
    └── sealed-secrets.yaml
```

## Configuration

### Environment Variables

All application configuration is in `k8s/base/configmap.yaml`:

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_HOST | SQL Server hostname | sqlserver |
| DATABASE_PORT | SQL Server port | 1433 |
| DATABASE_NAME | Database name | SIM_PANAMA |
| REDIS_HOST | Redis hostname | redis |
| REDIS_PORT | Redis port | 6379 |
| ENVIRONMENT | Environment name | staging |
| LOG_LEVEL | Logging level | INFO |
| MAX_UPLOAD_SIZE_MB | Max upload size | 100 |
| OCR_TIMEOUT_SECONDS | OCR processing timeout | 60 |

### Resource Allocation

| Component | Memory (Request/Limit) | CPU (Request/Limit) | Replicas |
|-----------|------------------------|---------------------|----------|
| Backend | 256Mi / 512Mi | 250m / 500m | 2 |
| Celery Worker | 1Gi / 2Gi | 500m / 1000m | 2-5 (HPA) |
| Celery Beat | 128Mi / 256Mi | 100m / 200m | 1 |
| Frontend | 64Mi / 128Mi | 50m / 100m | 2 |
| SQL Server | 2Gi / 3Gi | 500m / 1000m | 1 |
| Redis | 128Mi / 256Mi | 100m / 250m | 1 |

**Total minimum**: ~6Gi RAM, ~3 vCPU
**Recommended**: 8-10Gi RAM, 4 vCPU

## Backup & Restore

### Automated Backups

SQL Server backups run daily at 2:00 AM via CronJob:
- Location: `/var/opt/mssql/backup/`
- Retention: 7 days
- Compression: Enabled

### Manual Backup

```bash
./scripts/k8s/backup-restore.sh backup
```

### List Backups

```bash
./scripts/k8s/backup-restore.sh list
```

### Restore from Backup

```bash
./scripts/k8s/backup-restore.sh restore SIM_PANAMA_20241126_020000.bak
```

### Download Backup Locally

```bash
./scripts/k8s/backup-restore.sh download SIM_PANAMA_20241126_020000.bak
```

## Accessing the Application

### EKS Staging (NodePort)

Get the node IP:
```bash
kubectl get nodes -o wide
```

Access URLs:
- Frontend: `http://<NODE_IP>:30080`
- Backend API: `http://<NODE_IP>:30800/api/v1`
- Flower: `http://<NODE_IP>:30555`

### On-Premise (Ingress)

Add to `/etc/hosts`:
```
<INGRESS_IP>  tramites.local
```

Access URL: `https://tramites.local`

## Monitoring

### View Pods
```bash
kubectl get pods -n tramites-staging -w
```

### View Logs
```bash
# Backend logs
kubectl logs -n tramites-staging -l app=backend -f

# Celery worker logs
kubectl logs -n tramites-staging -l app=celery-worker -f
```

### Check HPA Status
```bash
kubectl get hpa -n tramites-staging
```

## Troubleshooting

### Pod not starting
```bash
kubectl describe pod <pod-name> -n tramites-staging
kubectl logs <pod-name> -n tramites-staging
```

### Database connection issues
```bash
# Test connection from backend pod
kubectl exec -it deployment/backend -n tramites-staging -- \
  python -c "from app.database import engine; print(engine.execute('SELECT 1').scalar())"
```

### Celery not processing tasks
```bash
# Check Celery worker status
kubectl exec -it deployment/celery-worker -n tramites-staging -- \
  celery -A celery_app inspect active
```

## CI/CD Workflows

### CI Pipeline (`.github/workflows/ci.yml`)
- Triggered on: PRs and pushes to main/develop
- Jobs: Backend tests, Frontend tests, Build images, Security scan

### Deploy Staging (`.github/workflows/deploy-staging.yml`)
- Triggered on: Push to main
- Jobs: Build & push to ECR, Deploy to EKS, Run migrations, Smoke tests

### Release (`.github/workflows/release.yml`)
- Triggered on: GitHub Release or manual
- Jobs: Build & push to Harbor, Create release package

## GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| AWS_ACCESS_KEY_ID | AWS access key |
| AWS_SECRET_ACCESS_KEY | AWS secret key |
| AWS_ACCOUNT_ID | AWS account ID (for ECR) |
| HARBOR_REGISTRY | Harbor registry URL |
| HARBOR_USERNAME | Harbor username |
| HARBOR_PASSWORD | Harbor password |
