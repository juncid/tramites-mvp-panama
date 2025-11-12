/*
 * Script de Usuarios de Prueba
 * Crea usuarios con diferentes roles para testing
 * 
 * IMPORTANTE: Este script es solo para desarrollo/testing
 * NO ejecutar en producción
 */

USE SIM_PANAMA;
GO

PRINT '==========================================';
PRINT 'CREANDO USUARIOS DE PRUEBA';
PRINT '==========================================';
PRINT '';

-- Verificar que existan los roles
DECLARE @roleCount INT;
SELECT @roleCount = COUNT(*) FROM SEG_TB_ROLES;

IF @roleCount < 4
BEGIN
    PRINT 'ERROR: No se encontraron los roles necesarios';
    PRINT 'Por favor, ejecute primero init_database.sql';
    RETURN;
END

-- ==========================================
-- USUARIO 1: ADMINISTRADOR
-- ==========================================
PRINT '1. Creando usuario ADMINISTRADOR...';

IF NOT EXISTS (SELECT 1 FROM SEG_TB_USUARIOS WHERE USER_ID = 'admin')
BEGIN
    INSERT INTO SEG_TB_USUARIOS (
        USER_ID, CED_USUARIO, NOM_USUARIO, EMAIL_USUARIO, PASSWORD,
        ACTIVO, INTENTOFALLIDO, FECHULTCAMBIOPASS, FEC_ACTUALIZACION,
        CED_ACTUALIZACION, NOM_ACTUALIZACION, LOGIN, RESETPASS
    )
    VALUES (
        'admin',                    -- USER_ID
        '8-123-4567',              -- Cédula
        'Juan Carlos Pérez',       -- Nombre completo
        'admin@migracion.gob.pa',  -- Email
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5/6SJDxFEXBSS', -- Hash de 'admin123'
        1,                         -- Activo
        0,                         -- Intentos fallidos
        GETDATE(),                 -- Última cambio contraseña
        GETDATE(),                 -- Fecha actualización
        'SYSTEM',                  -- Quien actualizó
        'Sistema',                 -- Nombre quien actualizó
        0,                         -- Login
        0                          -- Reset password
    );
    
    -- Asignar rol ADMINISTRADOR (COD_ROLE = 1)
    INSERT INTO SEG_TB_USUA_ROLE (COD_ROLE, USER_ID, FEC_ACTUALIZACION)
    VALUES (1, 'admin', GETDATE());
    
    PRINT '   ✓ Usuario: admin';
    PRINT '   ✓ Password: admin123';
    PRINT '   ✓ Rol: ADMINISTRADOR';
    PRINT '   ✓ Email: admin@migracion.gob.pa';
END
ELSE
BEGIN
    PRINT '   ⚠ Usuario admin ya existe';
END
PRINT '';

-- ==========================================
-- USUARIO 2: INSPECTOR
-- ==========================================
PRINT '2. Creando usuario INSPECTOR...';

IF NOT EXISTS (SELECT 1 FROM SEG_TB_USUARIOS WHERE USER_ID = 'inspector01')
BEGIN
    INSERT INTO SEG_TB_USUARIOS (
        USER_ID, CED_USUARIO, NOM_USUARIO, EMAIL_USUARIO, PASSWORD,
        ACTIVO, INTENTOFALLIDO, FECHULTCAMBIOPASS, FEC_ACTUALIZACION,
        CED_ACTUALIZACION, NOM_ACTUALIZACION, LOGIN, RESETPASS
    )
    VALUES (
        'inspector01',
        '8-234-5678',
        'María González Rodríguez',
        'inspector@migracion.gob.pa',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5/6SJDxFEXBSS', -- Hash de 'admin123'
        1, 0, GETDATE(), GETDATE(), 'SYSTEM', 'Sistema', 0, 0
    );
    
    -- Asignar rol INSPECTOR (COD_ROLE = 2)
    INSERT INTO SEG_TB_USUA_ROLE (COD_ROLE, USER_ID, FEC_ACTUALIZACION)
    VALUES (2, 'inspector01', GETDATE());
    
    PRINT '   ✓ Usuario: inspector01';
    PRINT '   ✓ Password: admin123';
    PRINT '   ✓ Rol: INSPECTOR';
    PRINT '   ✓ Email: inspector@migracion.gob.pa';
END
ELSE
BEGIN
    PRINT '   ⚠ Usuario inspector01 ya existe';
END
PRINT '';

-- ==========================================
-- USUARIO 3: ANALISTA
-- ==========================================
PRINT '3. Creando usuario ANALISTA...';

IF NOT EXISTS (SELECT 1 FROM SEG_TB_USUARIOS WHERE USER_ID = 'analista01')
BEGIN
    INSERT INTO SEG_TB_USUARIOS (
        USER_ID, CED_USUARIO, NOM_USUARIO, EMAIL_USUARIO, PASSWORD,
        ACTIVO, INTENTOFALLIDO, FECHULTCAMBIOPASS, FEC_ACTUALIZACION,
        CED_ACTUALIZACION, NOM_ACTUALIZACION, LOGIN, RESETPASS
    )
    VALUES (
        'analista01',
        '8-345-6789',
        'Pedro Martínez López',
        'analista@migracion.gob.pa',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5/6SJDxFEXBSS', -- Hash de 'admin123'
        1, 0, GETDATE(), GETDATE(), 'SYSTEM', 'Sistema', 0, 0
    );
    
    -- Asignar rol ANALISTA (COD_ROLE = 3)
    INSERT INTO SEG_TB_USUA_ROLE (COD_ROLE, USER_ID, FEC_ACTUALIZACION)
    VALUES (3, 'analista01', GETDATE());
    
    PRINT '   ✓ Usuario: analista01';
    PRINT '   ✓ Password: admin123';
    PRINT '   ✓ Rol: ANALISTA';
    PRINT '   ✓ Email: analista@migracion.gob.pa';
END
ELSE
BEGIN
    PRINT '   ⚠ Usuario analista01 ya existe';
END
PRINT '';

-- ==========================================
-- USUARIO 4: CONSULTA (Solo lectura)
-- ==========================================
PRINT '4. Creando usuario CONSULTA...';

IF NOT EXISTS (SELECT 1 FROM SEG_TB_USUARIOS WHERE USER_ID = 'consulta01')
BEGIN
    INSERT INTO SEG_TB_USUARIOS (
        USER_ID, CED_USUARIO, NOM_USUARIO, EMAIL_USUARIO, PASSWORD,
        ACTIVO, INTENTOFALLIDO, FECHULTCAMBIOPASS, FEC_ACTUALIZACION,
        CED_ACTUALIZACION, NOM_ACTUALIZACION, LOGIN, RESETPASS
    )
    VALUES (
        'consulta01',
        '8-456-7890',
        'Ana Sofía Castillo',
        'consulta@migracion.gob.pa',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5/6SJDxFEXBSS', -- Hash de 'admin123'
        1, 0, GETDATE(), GETDATE(), 'SYSTEM', 'Sistema', 0, 0
    );
    
    -- Asignar rol CONSULTA (COD_ROLE = 4)
    INSERT INTO SEG_TB_USUA_ROLE (COD_ROLE, USER_ID, FEC_ACTUALIZACION)
    VALUES (4, 'consulta01', GETDATE());
    
    PRINT '   ✓ Usuario: consulta01';
    PRINT '   ✓ Password: admin123';
    PRINT '   ✓ Rol: CONSULTA';
    PRINT '   ✓ Email: consulta@migracion.gob.pa';
END
ELSE
BEGIN
    PRINT '   ⚠ Usuario consulta01 ya existe';
END
PRINT '';

-- ==========================================
-- USUARIO 5: ANALISTA SENIOR (Múltiples roles)
-- ==========================================
PRINT '5. Creando usuario ANALISTA SENIOR (múltiples roles)...';

IF NOT EXISTS (SELECT 1 FROM SEG_TB_USUARIOS WHERE USER_ID = 'analista02')
BEGIN
    INSERT INTO SEG_TB_USUARIOS (
        USER_ID, CED_USUARIO, NOM_USUARIO, EMAIL_USUARIO, PASSWORD,
        ACTIVO, INTENTOFALLIDO, FECHULTCAMBIOPASS, FEC_ACTUALIZACION,
        CED_ACTUALIZACION, NOM_ACTUALIZACION, LOGIN, RESETPASS
    )
    VALUES (
        'analista02',
        '8-567-8901',
        'Roberto Silva Méndez',
        'analista.senior@migracion.gob.pa',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5/6SJDxFEXBSS', -- Hash de 'admin123'
        1, 0, GETDATE(), GETDATE(), 'SYSTEM', 'Sistema', 0, 0
    );
    
    -- Asignar múltiples roles: ANALISTA + INSPECTOR
    INSERT INTO SEG_TB_USUA_ROLE (COD_ROLE, USER_ID, FEC_ACTUALIZACION)
    VALUES 
        (3, 'analista02', GETDATE()),  -- ANALISTA
        (2, 'analista02', GETDATE());  -- INSPECTOR
    
    PRINT '   ✓ Usuario: analista02';
    PRINT '   ✓ Password: admin123';
    PRINT '   ✓ Roles: ANALISTA, INSPECTOR';
    PRINT '   ✓ Email: analista.senior@migracion.gob.pa';
END
ELSE
BEGIN
    PRINT '   ⚠ Usuario analista02 ya existe';
END
PRINT '';

-- ==========================================
-- RESUMEN DE USUARIOS CREADOS
-- ==========================================
PRINT '';
PRINT '==========================================';
PRINT 'RESUMEN DE USUARIOS DE PRUEBA';
PRINT '==========================================';
PRINT '';

SELECT 
    u.USER_ID AS 'ID Usuario',
    u.NOM_USUARIO AS 'Nombre Completo',
    u.EMAIL_USUARIO AS 'Email',
    STRING_AGG(r.NOM_ROLE, ', ') AS 'Roles',
    CASE WHEN u.ACTIVO = 1 THEN 'Sí' ELSE 'No' END AS 'Activo'
FROM SEG_TB_USUARIOS u
LEFT JOIN SEG_TB_USUA_ROLE ur ON u.USER_ID = ur.USER_ID
LEFT JOIN SEG_TB_ROLES r ON ur.COD_ROLE = r.COD_ROLE
WHERE u.USER_ID IN ('admin', 'inspector01', 'analista01', 'consulta01', 'analista02')
GROUP BY u.USER_ID, u.NOM_USUARIO, u.EMAIL_USUARIO, u.ACTIVO
ORDER BY u.USER_ID;

PRINT '';
PRINT '==========================================';
PRINT '✅ USUARIOS DE PRUEBA CREADOS';
PRINT '==========================================';
PRINT '';
PRINT '🔐 CREDENCIALES DE ACCESO:';
PRINT '';
PRINT '1. ADMINISTRADOR:';
PRINT '   Usuario: admin';
PRINT '   Password: admin123';
PRINT '   Roles: ADMINISTRADOR';
PRINT '';
PRINT '2. INSPECTOR:';
PRINT '   Usuario: inspector01';
PRINT '   Password: admin123';
PRINT '   Roles: INSPECTOR';
PRINT '';
PRINT '3. ANALISTA:';
PRINT '   Usuario: analista01';
PRINT '   Password: admin123';
PRINT '   Roles: ANALISTA';
PRINT '';
PRINT '4. CONSULTA (Solo lectura):';
PRINT '   Usuario: consulta01';
PRINT '   Password: admin123';
PRINT '   Roles: CONSULTA';
PRINT '';
PRINT '5. ANALISTA SENIOR (Múltiples roles):';
PRINT '   Usuario: analista02';
PRINT '   Password: admin123';
PRINT '   Roles: ANALISTA, INSPECTOR';
PRINT '';
PRINT '⚠️  IMPORTANTE:';
PRINT '   - Estos usuarios son solo para desarrollo/testing';
PRINT '   - Cambiar las contraseñas antes de producción';
PRINT '   - Todas usan el mismo password: admin123';
PRINT '';
PRINT '==========================================';
GO
