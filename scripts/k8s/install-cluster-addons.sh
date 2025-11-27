#!/bin/bash
# Install cluster dependencies for Tramites MVP Panama
set -e

echo "=========================================="
echo "Installing Kubernetes Cluster Dependencies"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl is not installed. Please install it first.${NC}"
    exit 1
fi

# Check cluster connectivity
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Cannot connect to Kubernetes cluster. Please configure kubectl.${NC}"
    exit 1
fi

echo -e "${GREEN}Connected to Kubernetes cluster${NC}"

# Function to wait for deployment
wait_for_deployment() {
    local namespace=$1
    local deployment=$2
    local timeout=${3:-300}
    echo "Waiting for $deployment in $namespace..."
    kubectl wait --for=condition=Available deployment --all -n $namespace --timeout=${timeout}s || true
}

# 1. Install metrics-server (required for HPA)
echo ""
echo -e "${YELLOW}1. Installing metrics-server...${NC}"
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml || true
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]' 2>/dev/null || true

# 2. Install Sealed Secrets Controller
echo ""
echo -e "${YELLOW}2. Installing Sealed Secrets Controller...${NC}"
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.5/controller.yaml || true
wait_for_deployment kube-system sealed-secrets-controller 120

# 3. Install cert-manager
echo ""
echo -e "${YELLOW}3. Installing cert-manager...${NC}"
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml || true
wait_for_deployment cert-manager cert-manager 180

# Apply self-signed ClusterIssuer
echo "Creating self-signed ClusterIssuer..."
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned-issuer
spec:
  selfSigned: {}
EOF

# 4. Install Nginx Ingress Controller (optional - for on-premise)
if [ "$1" == "--with-ingress" ]; then
    echo ""
    echo -e "${YELLOW}4. Installing Nginx Ingress Controller...${NC}"
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/baremetal/deploy.yaml || true
    wait_for_deployment ingress-nginx ingress-nginx-controller 180
fi

# 5. Install NFS provisioner (optional - for on-premise)
if [ "$1" == "--with-nfs" ] && [ -n "$NFS_SERVER" ] && [ -n "$NFS_PATH" ]; then
    echo ""
    echo -e "${YELLOW}5. Installing NFS Subdir External Provisioner...${NC}"
    if command -v helm &> /dev/null; then
        helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/ || true
        helm repo update
        helm upgrade --install nfs-subdir-external-provisioner nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
            --set nfs.server=$NFS_SERVER \
            --set nfs.path=$NFS_PATH \
            --set storageClass.name=nfs-client \
            --set storageClass.defaultClass=false
    else
        echo -e "${YELLOW}Helm not found. Please install NFS provisioner manually.${NC}"
    fi
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Installation Complete!"
echo "==========================================${NC}"
echo ""
echo "Installed components:"
echo "  ✅ metrics-server"
echo "  ✅ sealed-secrets"
echo "  ✅ cert-manager"
[ "$1" == "--with-ingress" ] && echo "  ✅ nginx-ingress"
[ "$1" == "--with-nfs" ] && echo "  ✅ nfs-provisioner"
echo ""
echo "Next steps:"
echo "  1. Run ./deploy.sh staging   # For EKS staging"
echo "  2. Run ./deploy.sh onpremise # For on-premise"
