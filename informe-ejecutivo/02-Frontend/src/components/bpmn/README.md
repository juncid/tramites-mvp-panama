# BPMN Editor Component

Componente React para crear y editar diagramas BPMN usando bpmn-js con MaterialUI.

## 🚀 Características

- **Editor visual BPMN**: Interfaz completa para crear diagramas BPMN
- **Panel de propiedades**: Configuración detallada de elementos BPMN
- **Herramientas de edición**: Zoom, deshacer/rehacer, guardar/cargar
- **MaterialUI integrado**: Diseño consistente con la aplicación
- **TypeScript**: Completamente tipado
- **Responsive**: Adaptable a diferentes tamaños de pantalla

## 📦 Instalación

Los paquetes necesarios ya están incluidos en `package.json`:

```json
{
  "bpmn-js": "^latest",
  "bpmn-js-properties-panel": "^latest"
}
```

## 🎯 Uso Básico

```tsx
import { BpmnEditor } from '../components/bpmn';

function MyComponent() {
  const handleSave = (xml: string) => {
    console.log('Diagrama BPMN guardado:', xml);
    // Enviar al backend o procesar el XML
  };

  const handleChange = (xml: string) => {
    console.log('Diagrama cambió:', xml);
    // Actualizar estado o validar cambios
  };

  return (
    <BpmnEditor
      onSave={handleSave}
      onChange={handleChange}
    />
  );
}
```

## 🔧 Props

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `initialDiagram` | `string` | `undefined` | XML BPMN inicial para cargar |
| `onSave` | `(xml: string) => void` | `undefined` | Callback cuando se guarda el diagrama |
| `onChange` | `(xml: string) => void` | `undefined` | Callback cuando el diagrama cambia |
| `readOnly` | `boolean` | `false` | Modo solo lectura (TODO: implementar) |

## 🎨 Personalización

### Colores y Tema

El componente usa el tema MaterialUI. Para personalizar:

```tsx
// En tu tema MaterialUI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Color del header
    },
  },
});
```

### Estilos CSS

Los estilos se pueden personalizar en `BpmnEditor.css`:

```css
/* Personalizar el header */
.bpmn-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

/* Personalizar botones */
.bpmn-action-button:hover {
  transform: translateY(-1px);
}
```

## 🛠️ Herramientas Disponibles

### Menú Principal (Drawer)
- **Guardar**: Guarda el diagrama actual
- **Descargar BPMN**: Exporta el diagrama como archivo .bpmn
- **Cargar BPMN**: Importa un diagrama desde archivo
- **Deshacer/Rehacer**: Control de historial
- **Zoom**: Controles de zoom (In/Out/Ajustar)

### Panel de Propiedades
- Configuración de elementos BPMN
- Propiedades específicas de cada componente
- Validación en tiempo real

## 📱 Responsive Design

- **Desktop**: Panel de propiedades visible (300px)
- **Tablet**: Panel ajustable
- **Mobile**: Panel oculto, drawer full-width

## 🔄 Estados y Eventos

### Estados
- **Cargando**: Inicialización del editor
- **Editando**: Modo normal de edición
- **Guardando**: Proceso de guardado
- **Error**: Estados de error con notificaciones

### Eventos
- `onChange`: Se dispara cuando el diagrama cambia
- `onSave`: Se dispara cuando se guarda exitosamente
- **Errores**: Notificaciones automáticas vía Snackbar

## 💾 Formatos Soportados

- **Entrada**: XML BPMN 2.0 válido
- **Salida**: XML BPMN 2.0 formateado
- **Archivos**: `.bpmn`, `.xml`

## 🎯 Integración con Backend

### Ejemplo de Guardado

```tsx
const handleSave = async (xml: string) => {
  try {
    const response = await fetch('/api/bpmn/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Mi Flujo BPMN',
        xml: xml,
        processId: 'process_123'
      })
    });

    if (response.ok) {
      setSnackbar({
        open: true,
        message: 'Flujo guardado exitosamente',
        severity: 'success'
      });
    }
  } catch (error) {
    setSnackbar({
      open: true,
      message: 'Error al guardar el flujo',
      severity: 'error'
    });
  }
};
```

### Ejemplo de Carga

```tsx
const loadDiagram = async (diagramId: string) => {
  try {
    const response = await fetch(`/api/bpmn/${diagramId}`);
    const data = await response.json();

    setInitialDiagram(data.xml);
  } catch (error) {
    console.error('Error loading diagram:', error);
  }
};
```

## 🚨 Limitaciones

- **ReadOnly mode**: Aún no implementado
- **Colaboración**: No soporta edición simultánea
- **Versionado**: Sin control de versiones integrado
- **Validación**: Validación básica BPMN

## 🔮 Mejoras Futuras

- [ ] Modo solo lectura
- [ ] Validación BPMN avanzada
- [ ] Colaboración en tiempo real
- [ ] Control de versiones
- [ ] Plantillas predefinidas
- [ ] Exportación a PNG/SVG
- [ ] Simulación de procesos

## 📚 Recursos

- [bpmn-js Documentation](https://github.com/bpmn-io/bpmn-js)
- [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/)
- [MaterialUI Documentation](https://mui.com/)

## 🐛 Troubleshooting

### Error de carga
```tsx
// Verificar que el XML sea válido
try {
  await modeler.importXML(xml);
} catch (error) {
  console.error('XML inválido:', error);
}
```

### Problemas de rendimiento
- Limitar el número de elementos en diagramas grandes
- Usar `maxItems` en breadcrumbs si es necesario
- Optimizar re-renders con `React.memo`

---

**Página BPMN**: `/bpmn`
**Componente**: `BpmnEditor`
**Página contenedora**: `BpmnPage`