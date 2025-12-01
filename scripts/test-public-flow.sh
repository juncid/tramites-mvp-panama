#!/bin/bash

# Test script for public access flow
# Tests: POST /public/solicitudes/iniciar -> GET token validation -> workflow access

BASE_URL="http://localhost:8000/api/v1"

echo "========================================="
echo "Testing Public Access Flow"
echo "========================================="
echo ""

# Step 1: Iniciar solicitud
echo "1. Creating new public solicitud..."
RESPONSE=$(curl -s -X POST "$BASE_URL/public/solicitudes/iniciar" \
  -H "Content-Type: application/json" \
  -d '{
    "pasaporte": "TEST-FLOW-001",
    "nombres": "María José",
    "apellidos": "González Ramírez",
    "email": "maria.gonzalez@example.com",
    "nacionalidad": "PAN",
    "sexo": "F"
  }')

echo "$RESPONSE" | jq '.'
echo ""

# Extract token and expediente
TOKEN=$(echo "$RESPONSE" | jq -r '.token')
EXPEDIENTE=$(echo "$RESPONSE" | jq -r '.num_expediente')
INSTANCIA_ID=$(echo "$RESPONSE" | jq -r '.instancia_id')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to get token"
  exit 1
fi

echo "✓ Token generated: ${TOKEN:0:20}..."
echo "✓ Expediente: $EXPEDIENTE"
echo "✓ Instancia ID: $INSTANCIA_ID"
echo ""

# Step 2: Validate token
echo "2. Validating token..."
VALIDATION=$(curl -s "$BASE_URL/public/solicitudes/$TOKEN/validar")
echo "$VALIDATION" | jq '.'
echo ""

VALID=$(echo "$VALIDATION" | jq -r '.valid')
if [ "$VALID" != "true" ]; then
  echo "ERROR: Token validation failed"
  exit 1
fi
echo "✓ Token is valid"
echo ""

# Step 3: Get instancia with token
echo "3. Getting instancia with token..."
INSTANCIA=$(curl -s "$BASE_URL/public/solicitudes/$TOKEN/instancia")
echo "$INSTANCIA" | jq '.'
echo ""

# Step 4: Get vista actual with token
echo "4. Getting vista actual with X-Access-Token header..."
VISTA=$(curl -s "$BASE_URL/workflow/instancias/$INSTANCIA_ID/vista-actual?user_perfil=CIUDADANO" \
  -H "X-Access-Token: $TOKEN")

echo "$VISTA" | jq '{
  puede_ver: .puede_ver,
  puede_editar: .puede_editar,
  etapa: .etapa_actual.nombre,
  campos_count: (.campos | length)
}'
echo ""

PUEDE_VER=$(echo "$VISTA" | jq -r '.puede_ver')
if [ "$PUEDE_VER" != "true" ]; then
  echo "ERROR: Cannot see vista with token"
  exit 1
fi
echo "✓ Vista accessible with token"
echo ""

echo "========================================="
echo "✓ All tests passed!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3001/solicitudes/nueva"
echo "2. Fill form and submit"
echo "3. Copy link and open in browser"
echo "4. Complete vistas 1-3"
echo ""
