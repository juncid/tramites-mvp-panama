#!/bin/bash
# Deploy Tramites MVP Panama to Kubernetes
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(cd "$SCRIPT_DIR/../../k8s" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default environment
ENVIRONMENT=${1:-staging}

echo "=========================================="
echo "Deploying Tramites MVP Panama"
echo "Environment: $ENVIRONMENT"
echo "=========================================="

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "onpremise" ]; then
    echo -e "${RED}Invalid environment. Use 'staging' or 'onpremise'${NC}"
    exit 1
fi

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl is not installed${NC}"
    exit 1
fi

# Check if kustomize is available
if ! command -v kustomize &> /dev/null; then
    echo -e "${YELLOW}kustomize not found, using kubectl kustomize${NC}"
    KUSTOMIZE_CMD="kubectl kustomize"
else
    KUSTOMIZE_CMD="kustomize build"
fi

# Apply manifests
echo ""
echo -e "${YELLOW}Applying Kubernetes manifests...${NC}"

cd "$K8S_DIR/overlays/$ENVIRONMENT"

# Dry run first
echo "Running dry-run..."
$KUSTOMIZE_CMD . | kubectl apply --dry-run=client -f -

# Confirm
read -p "Apply these changes? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Apply
echo ""
echo "Applying changes..."
$KUSTOMIZE_CMD . | kubectl apply -f -

# Wait for deployments
echo ""
echo -e "${YELLOW}Waiting for deployments to be ready...${NC}"

NAMESPACE="tramites-staging"

# Wait for stateful services first
echo "Waiting for SQL Server..."
kubectl rollout status statefulset/sqlserver -n $NAMESPACE --timeout=300s || true

echo "Waiting for Redis..."
kubectl rollout status statefulset/redis -n $NAMESPACE --timeout=120s || true

# Wait for app deployments
echo "Waiting for Backend..."
kubectl rollout status deployment/backend -n $NAMESPACE --timeout=180s || true

echo "Waiting for Celery Worker..."
kubectl rollout status deployment/celery-worker -n $NAMESPACE --timeout=180s || true

echo "Waiting for Frontend..."
kubectl rollout status deployment/frontend -n $NAMESPACE --timeout=120s || true

# Show status
echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Pods:"
kubectl get pods -n $NAMESPACE
echo ""
echo "Services:"
kubectl get svc -n $NAMESPACE
echo ""

# Show access URLs
if [ "$ENVIRONMENT" == "staging" ]; then
    NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}' 2>/dev/null || \
              kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
    echo "Access URLs (NodePort):"
    echo "  Frontend:    http://${NODE_IP}:30080"
    echo "  Backend API: http://${NODE_IP}:30800/api/v1"
    echo "  Flower:      http://${NODE_IP}:30555"
else
    echo "Access URL (Ingress):"
    echo "  https://tramites.local"
    echo ""
    echo "Note: Add 'tramites.local' to /etc/hosts pointing to ingress IP"
fi
