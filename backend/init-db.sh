#!/bin/bash

echo "════════════════════════════════════════════════════════════════"
echo "  🚀 Inicializador de Base de Datos - SIM Panamá"
echo "════════════════════════════════════════════════════════════════"

# Variables
DB_HOST="sqlserver"
DB_USER="sa"
DB_PASSWORD="YourStrong@Passw0rd"
SQLCMD="/opt/mssql-tools18/bin/sqlcmd"
MAX_RETRIES=30
RETRY_INTERVAL=2

echo ""
echo "📋 Configuración:"
echo "   Host: $DB_HOST"
echo "   Usuario: $DB_USER"
echo "   Script: /scripts/init_database.sql"
echo ""

# Función para verificar conexión
check_connection() {
    $SQLCMD -S $DB_HOST -U $DB_USER -P "$DB_PASSWORD" -C -Q "SELECT 1" -b > /dev/null 2>&1
    return $?
}

# Esperar a que SQL Server esté listo
echo "⏳ Esperando a que SQL Server esté disponible..."
COUNTER=0
until check_connection; do
    COUNTER=$((COUNTER+1))
    if [ $COUNTER -gt $MAX_RETRIES ]; then
        echo "❌ Error: No se pudo conectar a SQL Server después de $MAX_RETRIES intentos"
        exit 1
    fi
    echo "   Intento $COUNTER/$MAX_RETRIES - Esperando $RETRY_INTERVAL segundos..."
    sleep $RETRY_INTERVAL
done

echo "✅ Conexión a SQL Server establecida"
echo ""

# Verificar si la base de datos ya existe
echo "🔍 Verificando si la base de datos SIM_PANAMA ya existe..."
DB_EXISTS=$($SQLCMD -S $DB_HOST -U $DB_USER -P "$DB_PASSWORD" -C -Q "SELECT COUNT(*) FROM sys.databases WHERE name = 'SIM_PANAMA'" -h -1 -W 2>/dev/null | tr -d ' ')

if [ "$DB_EXISTS" -eq "1" ]; then
    echo "ℹ️  La base de datos SIM_PANAMA ya existe"
    
    # Verificar si tiene tablas
    TABLE_COUNT=$($SQLCMD -S $DB_HOST -U $DB_USER -P "$DB_PASSWORD" -C -d SIM_PANAMA -Q "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'" -h -1 -W 2>/dev/null | tr -d ' ')
    
    echo "   Tablas encontradas: $TABLE_COUNT"
    
    if [ "$TABLE_COUNT" -gt "0" ]; then
        echo "✅ Base de datos ya inicializada con $TABLE_COUNT tablas"
        echo ""
        echo "════════════════════════════════════════════════════════════════"
        echo "  ✨ Base de datos lista para usar"
        echo "════════════════════════════════════════════════════════════════"
        exit 0
    else
        echo "⚠️  Base de datos existe pero no tiene tablas. Ejecutando script de inicialización..."
    fi
else
    echo "📝 Base de datos no encontrada. Creando nueva base de datos..."
fi

echo ""
echo "🔧 Ejecutando script de inicialización..."
echo "════════════════════════════════════════════════════════════════"

# Ejecutar el script de inicialización
if $SQLCMD -S $DB_HOST -U $DB_USER -P "$DB_PASSWORD" -C -i /scripts/init_database.sql -e; then
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "✅ Script de inicialización ejecutado exitosamente"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    # Verificar la instalación
    echo "🔍 Verificando instalación..."
    
    # Contar tablas
    TABLE_COUNT=$($SQLCMD -S $DB_HOST -U $DB_USER -P "$DB_PASSWORD" -C -d SIM_PANAMA -Q "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'" -h -1 -W 2>/dev/null | tr -d ' ')
    echo "   ✓ Tablas creadas: $TABLE_COUNT"
    
    # Contar usuarios
    USER_COUNT=$($SQLCMD -S $DB_HOST -U $DB_USER -P "$DB_PASSWORD" -C -d SIM_PANAMA -Q "SELECT COUNT(*) FROM SEG_TB_USUARIOS" -h -1 -W 2>/dev/null | tr -d ' ')
    echo "   ✓ Usuarios: $USER_COUNT"
    
    # Contar trámites
    TRAMITE_COUNT=$($SQLCMD -S $DB_HOST -U $DB_USER -P "$DB_PASSWORD" -C -d SIM_PANAMA -Q "SELECT COUNT(*) FROM tramites" -h -1 -W 2>/dev/null | tr -d ' ')
    echo "   ✓ Trámites de ejemplo: $TRAMITE_COUNT"
    
    # Contar países
    PAIS_COUNT=$($SQLCMD -S $DB_HOST -U $DB_USER -P "$DB_PASSWORD" -C -d SIM_PANAMA -Q "SELECT COUNT(*) FROM SIM_GE_PAIS" -h -1 -W 2>/dev/null | tr -d ' ')
    echo "   ✓ Países: $PAIS_COUNT"
    
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "  🎉 Base de datos SIM_PANAMA inicializada correctamente"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "📊 Resumen:"
    echo "   • Base de datos: SIM_PANAMA"
    echo "   • Tablas: $TABLE_COUNT"
    echo "   • Usuario admin creado (password: admin123)"
    echo "   • Datos de ejemplo cargados"
    echo ""
    echo "⚠️  Importante:"
    echo "   Cambiar la contraseña del usuario admin en producción"
    echo ""
    
    exit 0
else
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "❌ Error ejecutando el script de inicialización"
    echo "════════════════════════════════════════════════════════════════"
    exit 1
fi
