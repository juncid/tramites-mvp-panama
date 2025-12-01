#!/bin/bash
set -e

# ===========================================
# Script de Despliegue en Amazon EKS
# ===========================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Iniciando despliegue en EKS...${NC}"

# Variables - MODIFICAR SEGÚN TU CONFIGURACIÓN
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"
EKS_CLUSTER_NAME="${EKS_CLUSTER_NAME:-tramites-cluster}"
ECR_BACKEND_REPO="tramites-backend"
ECR_FRONTEND_REPO="tramites-frontend"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Verificar variables requeridas
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}❌ Error: AWS_ACCOUNT_ID no está configurado${NC}"
    echo "Ejecuta: export AWS_ACCOUNT_ID=<tu-account-id>"
    exit 1
fi

# 1. Verificar conexión a AWS
echo -e "${YELLOW}📡 Verificando credenciales AWS...${NC}"
aws sts get-caller-identity || {
    echo -e "${RED}❌ Error: No se puede conectar a AWS. Verifica tus credenciales.${NC}"
    exit 1
}

# 2. Actualizar kubeconfig para EKS
echo -e "${YELLOW}🔧 Configurando kubectl para EKS...${NC}"
aws eks update-kubeconfig --region "$AWS_REGION" --name "$EKS_CLUSTER_NAME"

# 3. Verificar conexión al cluster
echo -e "${YELLOW}🔍 Verificando conexión al cluster...${NC}"
kubectl cluster-info || {
    echo -e "${RED}❌ Error: No se puede conectar al cluster EKS${NC}"
    exit 1
}

# 4. Login a ECR
echo -e "${YELLOW}🔐 Autenticando en ECR...${NC}"
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# 5. Crear repositorios ECR si no existen
echo -e "${YELLOW}📦 Verificando repositorios ECR...${NC}"
aws ecr describe-repositories --repository-names "$ECR_BACKEND_REPO" --region "$AWS_REGION" 2>/dev/null || \
    aws ecr create-repository --repository-name "$ECR_BACKEND_REPO" --region "$AWS_REGION"

aws ecr describe-repositories --repository-names "$ECR_FRONTEND_REPO" --region "$AWS_REGION" 2>/dev/null || \
    aws ecr create-repository --repository-name "$ECR_FRONTEND_REPO" --region "$AWS_REGION"

# 6. Construir y push imágenes
echo -e "${YELLOW}🏗️  Construyendo imagen del backend...${NC}"
docker build -t "$ECR_BACKEND_REPO:$IMAGE_TAG" -f backend/Dockerfile.prod backend/

echo -e "${YELLOW}🏗️  Construyendo imagen del frontend...${NC}"
docker build -t "$ECR_FRONTEND_REPO:$IMAGE_TAG" -f frontend/Dockerfile frontend/

# Tag y push
echo -e "${YELLOW}📤 Subiendo imágenes a ECR...${NC}"
docker tag "$ECR_BACKEND_REPO:$IMAGE_TAG" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND_REPO:$IMAGE_TAG"
docker tag "$ECR_FRONTEND_REPO:$IMAGE_TAG" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_FRONTEND_REPO:$IMAGE_TAG"

docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND_REPO:$IMAGE_TAG"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_FRONTEND_REPO:$IMAGE_TAG"

# 7. Actualizar kustomization con las imágenes correctas
echo -e "${YELLOW}📝 Actualizando configuración de Kustomize...${NC}"
cd k8s/overlays/eks

# Usar kustomize edit para actualizar las imágenes
kustomize edit set image "backend=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND_REPO:$IMAGE_TAG"
kustomize edit set image "frontend=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_FRONTEND_REPO:$IMAGE_TAG"

cd ../../..

# 8. Crear namespace si no existe
echo -e "${YELLOW}🏷️  Creando namespace...${NC}"
kubectl create namespace tramites-panama --dry-run=client -o yaml | kubectl apply -f -

# 9. Aplicar secretos (si existen)
if [ -f "k8s/base/secrets/secrets.yaml" ]; then
    echo -e "${YELLOW}🔒 Aplicando secretos...${NC}"
    kubectl apply -f k8s/base/secrets/secrets.yaml -n tramites-panama
fi

# 10. Desplegar con Kustomize
echo -e "${YELLOW}🚀 Desplegando aplicación...${NC}"
kubectl apply -k k8s/overlays/eks

# 11. Esperar a que los pods estén listos
echo -e "${YELLOW}⏳ Esperando a que los pods estén listos...${NC}"
kubectl rollout status deployment/backend -n tramites-panama --timeout=300s
kubectl rollout status deployment/frontend -n tramites-panama --timeout=300s

# 12. Mostrar estado
echo -e "${GREEN}✅ Despliegue completado!${NC}"
echo ""
echo -e "${YELLOW}📊 Estado de los pods:${NC}"
kubectl get pods -n tramites-panama

echo ""
echo -e "${YELLOW}🌐 Servicios:${NC}"
kubectl get svc -n tramites-panama

echo ""
echo -e "${YELLOW}🔗 Para obtener la URL del LoadBalancer:${NC}"
echo "kubectl get svc -n tramites-panama -o wide"
