-- Script para corregir la tabla SIM_FT_TRAMITES
-- Fecha: 2025-10-22

USE SIM_PANAMA;
GO

-- Eliminar la tabla vieja con estructura incorrecta
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'SIM_FT_TRAMITES')
BEGIN
    DROP TABLE SIM_FT_TRAMITES;
    PRINT 'Tabla SIM_FT_TRAMITES antigua eliminada';
END
GO

-- Crear la tabla SIM_FT_TRAMITES con la estructura correcta (catálogo de tipos de trámites)
CREATE TABLE SIM_FT_TRAMITES (
    COD_TRAMITE VARCHAR(10) NOT NULL PRIMARY KEY,
    DESC_TRAMITE VARCHAR(255) NOT NULL,
    PAG_TRAMITE VARCHAR(10),
    IND_ACTIVO VARCHAR(1) NOT NULL DEFAULT 'S',
    ID_USUARIO_CREA VARCHAR(17),
    FEC_CREA_REG DATETIME DEFAULT GETDATE(),
    ID_USUARIO_MODIF VARCHAR(17),
    FEC_MODIF_REG DATETIME
);
PRINT 'Tabla SIM_FT_TRAMITES recreada con estructura correcta';
GO

PRINT '=== SIM_FT_TRAMITES corregida ==='
GO
