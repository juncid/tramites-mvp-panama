# EtapaInformativa - Componente Genérico de Workflow

Componente reutilizable para crear etapas informativas de workflow con diseño consistente basado en Figma.

## 📦 Ubicación

```
frontend/src/components/workflow/EtapaInformativa.tsx
```

## 🎯 Características

- ✅ Header azul con título personalizable
- ✅ Breadcrumbs dinámicos
- ✅ Contenido principal con título, descripción y subtítulo
- ✅ Botón de acción opcional (ej: descargar, ver info)
- ✅ Modo readonly para visualizar etapas completadas
- ✅ Botones de navegación (Cancelar/Volver y Siguiente)
- ✅ Estados de carga y error
- ✅ Diseño responsive y accesible

## 🚀 Uso Básico

```tsx
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { FileDownloadIcon } from '@mui/icons-material';

export const MiEtapa: React.FC = () => {
  return (
    <EtapaInformativa
      headerTitle="Título del Proceso"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Procesos' },
        { label: 'Mi Proceso' },
        { label: 'Etapa Actual' },
      ]}
      contentTitle="Título de la Etapa"
      contentDescription="Descripción detallada de la etapa..."
      onCancel={() => navigate('/workflows/123/etapas')}
      onNext={handleSiguiente}
    />
  );
};
```

## 📋 Props

### Obligatorias

| Prop | Tipo | Descripción |
|------|------|-------------|
| `headerTitle` | `string` | Título mostrado en el header azul |
| `breadcrumbs` | `BreadcrumbItem[]` | Array de breadcrumbs para navegación |
| `contentTitle` | `string` | Título del contenido principal |
| `contentDescription` | `string` | Descripción o texto principal |
| `onCancel` | `() => void` | Callback al hacer clic en Cancelar/Volver |

### Opcionales

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `contentSubtitle` | `string` | - | Subtítulo adicional antes del botón de acción |
| `actionButton` | `ActionButton` | - | Botón de acción personalizado |
| `readonly` | `boolean` | `false` | Modo solo lectura (muestra "Volver" en vez de "Cancelar/Siguiente") |
| `onNext` | `() => void` | - | Callback al hacer clic en Siguiente |
| `loading` | `boolean` | `false` | Muestra spinner de carga |
| `completing` | `boolean` | `false` | Deshabilita botones durante operación |
| `error` | `string \| null` | - | Mensaje de error a mostrar |

## 🎨 Interfaces

### BreadcrumbItem

```tsx
interface BreadcrumbItem {
  label: string;      // Texto del breadcrumb
  path?: string;      // Ruta de navegación (opcional, si no tiene es el último)
}
```

### ActionButton

```tsx
interface ActionButton {
  label: string;                          // Texto del botón
  icon?: React.ReactNode;                 // Icono opcional
  onClick: () => void;                    // Callback al hacer clic
  variant?: 'contained' | 'outlined';     // Estilo del botón
  color?: string;                         // Color del texto
  backgroundColor?: string;               // Color de fondo
}
```

## 📝 Ejemplos Completos

### Ejemplo 1: Etapa Simple Sin Botón de Acción

```tsx
export const EtapaSimple: React.FC = () => {
  const { instanciaId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const readonly = searchParams.get('readonly') === 'true';

  return (
    <EtapaInformativa
      headerTitle="Verificación de Datos"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Trámites' },
        { label: 'Verificación' },
      ]}
      contentTitle="Revise sus datos"
      contentDescription="Por favor revise cuidadosamente toda la información antes de continuar."
      readonly={readonly}
      onCancel={() => navigate(`/workflows/${instanciaId}/etapas`)}
      onNext={handleSiguiente}
    />
  );
};
```

### Ejemplo 2: Etapa con Botón de Descarga

```tsx
export const EtapaDescarga: React.FC = () => {
  const { instanciaId } = useParams();
  const navigate = useNavigate();
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDescargar = () => {
    // Lógica de descarga
    window.open('/api/documentos/requisitos.pdf', '_blank');
  };

  const handleSiguiente = async () => {
    setCompleting(true);
    try {
      await workflowService.completarEtapa(
        parseInt(instanciaId),
        etapaId,
        { DESCARGA_REALIZADA: 'SI' },
        'CIUDADANO'
      );
      navigate(`/workflows/${instanciaId}/etapas`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <EtapaInformativa
      headerTitle="Descarga de Documentos"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Documentos' },
        { label: 'Descarga' },
      ]}
      contentTitle="Documentos Requeridos"
      contentDescription="Descargue los documentos necesarios para completar su trámite."
      contentSubtitle="Haga clic en el botón para descargar el archivo PDF"
      actionButton={{
        label: 'Descargar PDF',
        icon: <FileDownloadIcon />,
        onClick: handleDescargar,
      }}
      onCancel={() => navigate(`/workflows/${instanciaId}/etapas`)}
      onNext={handleSiguiente}
      completing={completing}
      error={error}
    />
  );
};
```

### Ejemplo 3: Etapa con Múltiples Breadcrumbs

```tsx
export const EtapaNiveles: React.FC = () => {
  return (
    <EtapaInformativa
      headerTitle="Proceso de Aprobación Multinivel"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Mis Trámites', path: '/tramites' },
        { label: 'Solicitud #12345', path: '/tramites/12345' },
        { label: 'Aprobación Nivel 1' },
      ]}
      contentTitle="Revisión de Nivel 1"
      contentDescription="Esta etapa requiere aprobación del supervisor directo."
      onCancel={() => navigate('/tramites/12345')}
      onNext={handleAprobar}
    />
  );
};
```

### Ejemplo 4: Modo Readonly

```tsx
export const EtapaReadonly: React.FC = () => {
  const [searchParams] = useSearchParams();
  const readonly = searchParams.get('readonly') === 'true';

  return (
    <EtapaInformativa
      headerTitle="Etapa Completada"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Historial' },
      ]}
      contentTitle="Esta etapa ya fue completada"
      contentDescription="Puede revisar la información pero no editarla."
      readonly={readonly}
      onCancel={() => navigate('/workflows/123/etapas')}
      // onNext no se pasa en modo readonly
    />
  );
};
```

## 🎭 Personalización de Estilos

El componente usa los siguientes colores por defecto (puedes cambiarlos en el componente):

- **Header**: `#0e5fa6` (azul)
- **Hover**: `#0d5494` (azul oscuro)
- **Texto principal**: `#333333`
- **Blanco**: `#ffffff`

Si necesitas estilos completamente diferentes, puedes:
1. Modificar el componente base
2. Crear un wrapper que sobrescriba los estilos
3. Crear un componente nuevo basado en este

## 🔄 Flujo de Navegación

```
WorkflowEtapas
    ↓
    Ver/Editar Etapa
    ↓
EtapaInformativa
    ↓
    Siguiente → Completa etapa → Vuelve a WorkflowEtapas
    Cancelar → Vuelve a WorkflowEtapas
    Volver (readonly) → Vuelve a WorkflowEtapas
```

## 📂 Estructura de Archivos Recomendada

```
frontend/src/
├── components/
│   └── workflow/
│       └── EtapaInformativa.tsx       # Componente genérico
├── pages/
│   ├── DescargaRequisitos.tsx         # Usa EtapaInformativa
│   ├── EtapaVerificacion.tsx          # Usa EtapaInformativa
│   └── EtapaPago.tsx                  # Usa EtapaInformativa
└── routes/
    └── AppRouter.tsx                   # Define las rutas
```

## 🔗 Integración con AppRouter

```tsx
// En AppRouter.tsx
import { DescargaRequisitos } from '../pages/DescargaRequisitos';

<Route
  path="/workflows/:instanciaId/descarga-requisitos"
  element={<MainLayout><DescargaRequisitos /></MainLayout>}
/>
```

## ✅ Checklist para Nueva Etapa

- [ ] Crear nuevo archivo en `pages/` basado en el ejemplo
- [ ] Definir props de EtapaInformativa (título, breadcrumbs, contenido)
- [ ] Implementar lógica de `handleSiguiente` con las respuestas correctas
- [ ] Agregar ruta en `AppRouter.tsx`
- [ ] Modificar `WorkflowEtapas.tsx` para navegar a esta etapa condicionalmente
- [ ] Probar en modo edición
- [ ] Probar en modo readonly
- [ ] Verificar responsividad

## 🐛 Solución de Problemas

### El botón "Siguiente" no aparece
- Verifica que `onNext` prop esté definido
- Verifica que `readonly` sea `false`

### Los breadcrumbs no navegan
- Asegúrate de que los breadcrumbs con `path` tengan rutas válidas
- El primer breadcrumb con `path: '/'` incluye automáticamente el icono de Home

### Error al completar etapa
- Verifica que las respuestas enviadas coincidan con las preguntas obligatorias de la etapa
- Revisa el backend para ver qué códigos de pregunta son requeridos

## 📚 Referencias

- **Figma Design**: Node 378-1996
- **Componente original**: `DescargaRequisitos.tsx`
- **Servicio backend**: `workflowService.completarEtapa()`
