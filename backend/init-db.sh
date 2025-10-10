#!/bin/bash

# Script to initialize and verify the database setup

echo "Creating database tramites_db..."
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'tramites_db') CREATE DATABASE tramites_db"

echo "Database setup completed successfully!"
