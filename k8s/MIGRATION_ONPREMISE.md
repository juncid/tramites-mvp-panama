# Migrating to On-Premise

This guide covers migrating from EKS staging to an on-premise Kubernetes cluster.

## Prerequisites

### On-Premise Cluster Requirements
- Kubernetes 1.25+ cluster
- Minimum 3 nodes with:
  - 8GB RAM per node
  - 4 vCPU per node
  - 100GB storage per node
- Container runtime (containerd or Docker)
- kubectl access configured

### Infrastructure Requirements
- NFS server for persistent storage
- Harbor registry or another private registry
- Network access between nodes
- (Optional) Load balancer for production

## Step 1: Set Up Private Registry (Harbor)

### Option A: Deploy Harbor in Kubernetes

```bash
# Add Harbor Helm repo
helm repo add harbor https://helm.goharbor.io
helm repo update

# Install Harbor
helm install harbor harbor/harbor \
  --namespace harbor --create-namespace \
  --set expose.type=nodePort \
  --set expose.tls.auto.commonName=harbor.local \
  --set persistence.enabled=true \
  --set persistence.persistentVolumeClaim.registry.size=50Gi
```

### Option B: Use External Harbor

Configure your existing Harbor instance and note:
- Registry URL (e.g., `harbor.company.com`)
- Project name (e.g., `tramites`)
- Credentials

## Step 2: Transfer Docker Images

### From ECR to Harbor

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY

# Login to Harbor
docker login harbor.local -u admin

# Pull from ECR
docker pull $ECR_REGISTRY/tramites-backend:latest
docker pull $ECR_REGISTRY/tramites-frontend:latest

# Tag for Harbor
docker tag $ECR_REGISTRY/tramites-backend:latest harbor.local/tramites/backend:v1.0.0
docker tag $ECR_REGISTRY/tramites-frontend:latest harbor.local/tramites/frontend:v1.0.0

# Push to Harbor
docker push harbor.local/tramites/backend:v1.0.0
docker push harbor.local/tramites/frontend:v1.0.0
```

### Using Release Package

If you have the release package from GitHub:

```bash
# Extract package
tar -xzvf tramites-v1.0.0-onpremise.tar.gz

# Images are listed in the package
cat release-package/VERSION
```

## Step 3: Set Up NFS Storage

### On NFS Server

```bash
# Install NFS server (Ubuntu/Debian)
sudo apt-get install nfs-kernel-server

# Create export directory
sudo mkdir -p /exports/k8s/tramites
sudo chown nobody:nogroup /exports/k8s/tramites
sudo chmod 777 /exports/k8s/tramites

# Configure exports
echo "/exports/k8s *(rw,sync,no_subtree_check,no_root_squash)" | sudo tee -a /etc/exports

# Restart NFS
sudo exportfs -ra
sudo systemctl restart nfs-kernel-server
```

### Install NFS Provisioner in Cluster

```bash
helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
helm repo update

helm install nfs-subdir-external-provisioner nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
  --set nfs.server=<NFS_SERVER_IP> \
  --set nfs.path=/exports/k8s/tramites \
  --set storageClass.name=nfs-client \
  --set storageClass.defaultClass=false
```

## Step 4: Install Cluster Dependencies

```bash
# Run the installation script with on-premise flags
./scripts/k8s/install-cluster-addons.sh --with-ingress
```

This installs:
- metrics-server (for HPA)
- sealed-secrets (for secret management)
- cert-manager (for TLS certificates)
- nginx-ingress (for routing)

## Step 5: Configure Secrets

Create and seal secrets for on-premise:

```bash
# Create secret file (use strong passwords!)
cat > /tmp/secrets.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: tramites-secrets
  namespace: tramites-staging
type: Opaque
stringData:
  DATABASE_USER: "sa"
  DATABASE_PASSWORD: "$(openssl rand -base64 24)"
  SA_PASSWORD: "$(openssl rand -base64 24)"
  REDIS_PASSWORD: ""
EOF

# Seal it for the on-premise cluster
kubeseal --format yaml < /tmp/secrets.yaml > k8s/base/secrets/sealedsecret-onpremise.yaml

# IMPORTANT: Save the passwords somewhere secure!
cat /tmp/secrets.yaml

# Clean up
rm /tmp/secrets.yaml
```

## Step 6: Update Image References

Edit `k8s/overlays/onpremise/kustomization.yaml`:

```yaml
images:
  - name: tramites-backend
    newName: harbor.local/tramites/backend  # Your Harbor URL
    newTag: v1.0.0                           # Your version
  - name: tramites-frontend
    newName: harbor.local/tramites/frontend
    newTag: v1.0.0
```

## Step 7: Configure Ingress

Edit `k8s/overlays/onpremise/ingress.yaml`:

```yaml
spec:
  tls:
    - hosts:
        - tramites.yourcompany.com  # Your domain
      secretName: tramites-tls
  rules:
    - host: tramites.yourcompany.com
```

## Step 8: Deploy

```bash
./scripts/k8s/deploy.sh onpremise
```

## Step 9: Migrate Data

### Export from Staging

```bash
# On EKS staging cluster
kubectl config use-context eks-staging

# Create backup
./scripts/k8s/backup-restore.sh backup

# Download backup
./scripts/k8s/backup-restore.sh download SIM_PANAMA_latest.bak
```

### Import to On-Premise

```bash
# Switch to on-premise cluster
kubectl config use-context onpremise

# Copy backup to pod
kubectl cp SIM_PANAMA_latest.bak tramites-staging/sqlserver-0:/var/opt/mssql/backup/

# Restore
./scripts/k8s/backup-restore.sh restore SIM_PANAMA_latest.bak
```

## Step 10: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n tramites-staging

# Check services
kubectl get svc -n tramites-staging

# Check ingress
kubectl get ingress -n tramites-staging

# Test health endpoint
curl -k https://tramites.yourcompany.com/health
```

## Post-Migration Checklist

- [ ] All pods are Running
- [ ] Database connection works
- [ ] Redis connection works
- [ ] Celery workers processing tasks
- [ ] File uploads working
- [ ] OCR processing working
- [ ] Backups configured and tested
- [ ] SSL certificate valid
- [ ] DNS configured (or /etc/hosts)
- [ ] Firewall rules configured
- [ ] Monitoring set up

## Rollback Plan

If migration fails:

1. Switch back to EKS staging:
   ```bash
   kubectl config use-context eks-staging
   ```

2. Verify EKS is still working:
   ```bash
   kubectl get pods -n tramites-staging
   ```

3. Update DNS/load balancer to point back to EKS

## Support

For issues during migration:

1. Check pod logs:
   ```bash
   kubectl logs -n tramites-staging -l app=backend
   ```

2. Check events:
   ```bash
   kubectl get events -n tramites-staging --sort-by='.lastTimestamp'
   ```

3. Describe problematic resources:
   ```bash
   kubectl describe pod <pod-name> -n tramites-staging
   ```
