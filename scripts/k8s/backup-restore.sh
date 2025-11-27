#!/bin/bash
# Backup and Restore scripts for SQL Server
set -e

NAMESPACE="tramites-staging"
SQLSERVER_POD="sqlserver-0"
BACKUP_DIR="/var/opt/mssql/backup"
DATABASE_NAME="SIM_PANAMA"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

show_help() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  backup              Create a new backup"
    echo "  restore <file>      Restore from a backup file"
    echo "  list                List available backups"
    echo "  download <file>     Download backup to local machine"
    echo ""
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 restore SIM_PANAMA_20241126_020000.bak"
    echo "  $0 list"
    echo "  $0 download SIM_PANAMA_20241126_020000.bak"
}

get_sa_password() {
    kubectl get secret tramites-secrets -n $NAMESPACE -o jsonpath='{.data.SA_PASSWORD}' | base64 -d
}

backup() {
    echo -e "${YELLOW}Creating backup...${NC}"
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="${DATABASE_NAME}_${TIMESTAMP}.bak"
    SA_PASSWORD=$(get_sa_password)
    
    kubectl exec -n $NAMESPACE $SQLSERVER_POD -- /opt/mssql-tools18/bin/sqlcmd \
        -S localhost -U sa -P "$SA_PASSWORD" -C -Q "
        BACKUP DATABASE [$DATABASE_NAME] 
        TO DISK = '${BACKUP_DIR}/${BACKUP_FILE}'
        WITH FORMAT, COMPRESSION, STATS = 10;
    "
    
    echo -e "${GREEN}Backup created: ${BACKUP_FILE}${NC}"
    list
}

restore() {
    local BACKUP_FILE=$1
    
    if [ -z "$BACKUP_FILE" ]; then
        echo -e "${RED}Error: Backup file name required${NC}"
        show_help
        exit 1
    fi
    
    echo -e "${YELLOW}Restoring from ${BACKUP_FILE}...${NC}"
    echo -e "${RED}WARNING: This will overwrite the current database!${NC}"
    read -p "Are you sure? (yes/no) " -r
    
    if [ "$REPLY" != "yes" ]; then
        echo "Aborted."
        exit 0
    fi
    
    SA_PASSWORD=$(get_sa_password)
    
    # Set database to single user mode and restore
    kubectl exec -n $NAMESPACE $SQLSERVER_POD -- /opt/mssql-tools18/bin/sqlcmd \
        -S localhost -U sa -P "$SA_PASSWORD" -C -Q "
        ALTER DATABASE [$DATABASE_NAME] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        
        RESTORE DATABASE [$DATABASE_NAME] 
        FROM DISK = '${BACKUP_DIR}/${BACKUP_FILE}'
        WITH REPLACE, STATS = 10;
        
        ALTER DATABASE [$DATABASE_NAME] SET MULTI_USER;
    "
    
    echo -e "${GREEN}Restore completed!${NC}"
}

list() {
    echo -e "${YELLOW}Available backups:${NC}"
    kubectl exec -n $NAMESPACE $SQLSERVER_POD -- ls -la $BACKUP_DIR/*.bak 2>/dev/null || echo "No backups found"
}

download() {
    local BACKUP_FILE=$1
    
    if [ -z "$BACKUP_FILE" ]; then
        echo -e "${RED}Error: Backup file name required${NC}"
        show_help
        exit 1
    fi
    
    echo -e "${YELLOW}Downloading ${BACKUP_FILE}...${NC}"
    kubectl cp $NAMESPACE/$SQLSERVER_POD:${BACKUP_DIR}/${BACKUP_FILE} ./${BACKUP_FILE}
    echo -e "${GREEN}Downloaded to ./${BACKUP_FILE}${NC}"
}

# Main
case "${1:-help}" in
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    list)
        list
        ;;
    download)
        download "$2"
        ;;
    *)
        show_help
        ;;
esac
