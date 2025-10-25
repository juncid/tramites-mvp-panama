from fastapi import APIRouter

router = APIRouter()

# ============================================================
# ⚠️ ENDPOINTS LEGACY /tramites ELIMINADOS
# ============================================================
# Los endpoints de la tabla TRAMITE (legacy) han sido eliminados.
# Usar los endpoints oficiales en /sim-ft/tramites
# que utilizan las tablas SIM_FT_TRAMITE_E
# 
# Migración:
# - GET    /tramites              -> GET    /sim-ft/tramites
# - GET    /tramites/{id}         -> GET    /sim-ft/tramites/{año}/{num}/{reg}
# - POST   /tramites              -> POST   /sim-ft/tramites
# - PUT    /tramites/{id}         -> PUT    /sim-ft/tramites/{año}/{num}/{reg}
# - DELETE /tramites/{id}         -> DELETE /sim-ft/tramites/{año}/{num}/{reg}
# ============================================================
