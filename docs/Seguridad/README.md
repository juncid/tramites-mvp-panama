# 🔐 Seguridad y Acceso - Documentación

> Autenticación, autorización y permisos del sistema

---

## 📋 Índice

| Documento | Tipo | Descripción |
|-----------|------|-------------|
| [USUARIOS_PRUEBA.md](USUARIOS_PRUEBA.md) | 🔑 Credenciales | Usuarios de prueba del sistema |
| [IMPLEMENTACION_ACCESO_PUBLICO.md](IMPLEMENTACION_ACCESO_PUBLICO.md) | ✅ Implementación | Acceso público sin contraseña |
| [IMPLEMENTACION_CODIGO_ACCESO.md](IMPLEMENTACION_CODIGO_ACCESO.md) | ✅ Implementación | Código de acceso corto |
| [IMPLEMENTACION_PERMISOS_ESTADO.md](IMPLEMENTACION_PERMISOS_ESTADO.md) | ✅ Implementación | Permisos por estado PPSH |
| [SOLUCION_PERMISOS_ETAPA_4.md](SOLUCION_PERMISOS_ETAPA_4.md) | 🔧 Solución | Fix de permisos etapa 4 |

---

## 🚀 Inicio Rápido

### Obtener token de acceso (usuarios internos)

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

### Acceso público (ciudadanos)

```bash
curl "http://localhost:8000/api/v1/ppsh/publico/solicitud?codigo=PPSH-A7X9&tipo_documento=PASAPORTE&num_documento=PA1234567"
```

---

## 👥 Roles del Sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `ADMINISTRADOR` | Control total | CRUD completo |
| `INSPECTOR` | Verificación | Lectura + Revisión |
| `ANALISTA` | Análisis de casos | Lectura + Modificación |
| `CONSULTA` | Solo lectura | Lectura |

---

## 🔑 Usuarios de Prueba

| Usuario | Password | Rol |
|---------|----------|-----|
| `admin` | `admin123` | ADMINISTRADOR |
| `inspector01` | `admin123` | INSPECTOR |
| `analista01` | `admin123` | ANALISTA |
| `consulta01` | `admin123` | CONSULTA |

> Ver [USUARIOS_PRUEBA.md](USUARIOS_PRUEBA.md) para detalles completos

---

## 🌐 Acceso Público

El sistema permite acceso sin autenticación para ciudadanos:

1. **Código de acceso corto**: `PPSH-A7X9`
2. **Validación por documento**: Pasaporte o Cédula
3. **Vistas limitadas**: Solo etapas asignadas a CIUDADANO

### Flujo de acceso público

```
Usuario → Código + Documento → Validación → Vista limitada
```

---

## ⚠️ Consideraciones de Seguridad

1. **JWT tokens** expiran en 24 horas
2. **Acceso público** no requiere autenticación pero valida documento
3. **Permisos por etapa** - Cada etapa define quién puede acceder
4. **Logs de auditoría** - Todas las acciones se registran
