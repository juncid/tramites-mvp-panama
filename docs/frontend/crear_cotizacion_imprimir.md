# Explicación: Sistema de Impresión de Cotizaciones

## Resumen del Sistema

Este sistema permite generar documentos de "Autorización de Cotización" imprimibles donde:
- El usuario selecciona opciones de cotización mediante checkboxes
- Al hacer clic en "Imprimir", se genera un documento con **una tarjeta por cada opción seleccionada**
- Cada tarjeta muestra **solo una opción marcada** (no se permite selección múltiple en la impresión)
- Las tarjetas se organizan en una cuadrícula de 2 columnas

---

## Estructura de Archivos

```
/App.tsx                          # Componente principal con formulario
/components/PrintableQuotation.tsx # Componente de vista de impresión
/imports/svg-h77aj7ski8.ts        # SVGs del logo
```

---

## 1. Estructura de Datos

### Interface QuotationData

```typescript
interface QuotationData {
  nombre: string;
  nacionalidad: string;
  cotizacionNum: string;
  tramite: string;
  fecha: string;
  responsable: string;
  cotizacion: {
    carne: boolean;
    cheque250: boolean;
    cheque800: boolean;
    visaMultiple: boolean;
  };
}
```

**Propósito:** Esta interfaz define todos los datos de una cotización, incluyendo la información del caso y las 4 opciones posibles de cotización.

---

## 2. Componente Principal (App.tsx)

### Estado Inicial

```typescript
const [formData, setFormData] = useState<QuotationData>({
  nombre: 'Nombre Nombre Apellido Apellido',
  nacionalidad: 'Costarricense',
  cotizacionNum: '',
  tramite: 'Permiso de Protección de Seguridad Humanitaria',
  fecha: new Date().toISOString().split('T')[0], // Fecha actual automática
  responsable: 'Sistema',                         // Responsable predeterminado
  cotizacion: {
    carne: true,
    cheque250: true,
    cheque800: true,
    visaMultiple: false,
  },
});
```

**Puntos clave:**
- `fecha`: Se auto-completa con la fecha actual usando `new Date().toISOString().split('T')[0]`
- `responsable`: Valor predeterminado "Sistema"
- `cotizacion`: Objeto con 4 booleanos que representan las opciones seleccionables

### Control de Vista

```typescript
const [showPrint, setShowPrint] = useState(false);
```

**Propósito:** Controla si se muestra la vista normal (formulario) o la vista de impresión.

### Función de Impresión

```typescript
const handlePrint = () => {
  // 1. Validar campos obligatorios
  if (!formData.fecha || !formData.responsable) {
    alert('Por favor complete los campos de Fecha y Responsable');
    return;
  }
  
  // 2. Verificar que al menos una opción esté seleccionada
  const hasSelection = Object.values(formData.cotizacion).some(value => value);
  if (!hasSelection) {
    alert('Por favor seleccione al menos una opción de cotización');
    return;
  }
  
  // 3. Cambiar a vista de impresión
  setShowPrint(true);
  
  // 4. Activar diálogo de impresión después de render
  setTimeout(() => {
    window.print();
  }, 100);
};
```

**Flujo paso a paso:**

1. **Validación de campos obligatorios**: Verifica fecha y responsable
2. **Validación de selección**: Usa `Object.values()` y `.some()` para verificar que al menos un checkbox esté marcado
3. **Cambio de vista**: `setShowPrint(true)` cambia el estado para renderizar `PrintableQuotation`
4. **Delay para render**: `setTimeout` de 100ms asegura que React haya renderizado completamente antes de llamar a `window.print()`

### Renderizado Condicional

```typescript
if (showPrint) {
  return <PrintableQuotation data={formData} />;
}

return (
  <div className="bg-white relative min-h-screen">
    {/* Formulario normal */}
  </div>
);
```

**Lógica:** Si `showPrint` es `true`, renderiza el componente de impresión; de lo contrario, muestra el formulario.

---

## 3. Componente de Impresión (PrintableQuotation.tsx)

### Lógica de Generación Dinámica

Esta es la **parte más importante** del sistema:

```typescript
export function PrintableQuotation({ data }: { data: QuotationData }) {
  // Array que contendrá las cotizaciones individuales
  const selectedQuotations = [];
  
  // Para cada opción seleccionada, crear una cotización separada
  if (data.cotizacion.carne) {
    selectedQuotations.push({
      ...data,  // Copia todos los datos (nombre, fecha, etc.)
      cotizacion: {
        carne: true,      // Solo esta opción está marcada
        cheque250: false,
        cheque800: false,
        visaMultiple: false,
      }
    });
  }
  
  if (data.cotizacion.cheque250) {
    selectedQuotations.push({
      ...data,
      cotizacion: {
        carne: false,
        cheque250: true,  // Solo esta opción está marcada
        cheque800: false,
        visaMultiple: false,
      }
    });
  }
  
  if (data.cotizacion.cheque800) {
    selectedQuotations.push({
      ...data,
      cotizacion: {
        carne: false,
        cheque250: false,
        cheque800: true,  // Solo esta opción está marcada
        visaMultiple: false,
      }
    });
  }
  
  if (data.cotizacion.visaMultiple) {
    selectedQuotations.push({
      ...data,
      cotizacion: {
        carne: false,
        cheque250: false,
        cheque800: false,
        visaMultiple: true,  // Solo esta opción está marcada
      }
    });
  }

  return (
    <div className="print-page">
      <div className="grid grid-cols-2 gap-4 p-4">
        {selectedQuotations.map((quotation, index) => (
          <QuotationCard key={index} data={quotation} />
        ))}
      </div>
    </div>
  );
}
```

**Explicación detallada:**

1. **Crear array vacío**: `selectedQuotations = []` contendrá las cotizaciones a imprimir

2. **Iterar sobre cada opción**: Para cada opción seleccionada (true):
   - Usa spread operator `...data` para copiar todos los datos del formulario
   - Sobrescribe el objeto `cotizacion` con **solo esa opción en true**
   - Agrega este objeto modificado al array

3. **Resultado del array**:
   - Si 1 checkbox está marcado → array con 1 objeto
   - Si 2 checkboxes están marcados → array con 2 objetos
   - Si 3 checkboxes están marcados → array con 3 objetos
   - Si 4 checkboxes están marcados → array con 4 objetos

4. **Renderizado del grid**:
   - `grid-cols-2`: Cuadrícula de 2 columnas
   - `map()`: Renderiza un `QuotationCard` por cada elemento del array
   - Cada tarjeta recibe su propia copia de datos con solo una opción marcada

### Ejemplo Práctico

**Input del usuario:**
```javascript
formData = {
  nombre: "Juan Pérez",
  fecha: "2025-12-09",
  cotizacion: {
    carne: true,      // ✓ Seleccionado
    cheque250: false,
    cheque800: true,  // ✓ Seleccionado
    visaMultiple: false,
  }
}
```

**Array generado:**
```javascript
selectedQuotations = [
  {
    nombre: "Juan Pérez",
    fecha: "2025-12-09",
    cotizacion: {
      carne: true,      // Primera tarjeta: solo carne
      cheque250: false,
      cheque800: false,
      visaMultiple: false,
    }
  },
  {
    nombre: "Juan Pérez",
    fecha: "2025-12-09",
    cotizacion: {
      carne: false,
      cheque250: false,
      cheque800: true,  // Segunda tarjeta: solo cheque800
      visaMultiple: false,
    }
  }
]
```

**Resultado visual:**
```
┌─────────────┬─────────────┐
│  Tarjeta 1  │  Tarjeta 2  │
│   ☑ Carné   │ ☐ Carné     │
│ ☐ Cheque250 │ ☐ Cheque250 │
│ ☐ Cheque800 │ ☑ Cheque800 │
│ ☐ Visa      │ ☐ Visa      │
└─────────────┴─────────────┘
```

---

## 4. Componente QuotationCard

### Estructura de la Tarjeta

```typescript
function QuotationCard({ data }: { data: QuotationData }) {
  return (
    <div className="relative h-[396px] w-[306px]">
      {/* Header con logo */}
      <Frame />
      
      {/* Título */}
      <p>AUTORIZACIÓN DE COTIZACIÓN</p>
      
      {/* Sección Información */}
      <div className="top-[112px]">
        <p>Nombre: {data.nombre}</p>
        <p>Nacionalidad: {data.nacionalidad}</p>
        <p>Cotización N°: {data.cotizacionNum}</p>
        <p className="mb-2">Tramite: {data.tramite}</p>
      </div>
      
      {/* Sección Cotización */}
      <div className="top-[226px]">
        <CheckBox checked={data.cotizacion.carne} />
        <CheckBox checked={data.cotizacion.cheque250} />
        <CheckBox checked={data.cotizacion.cheque800} />
        <CheckBox checked={data.cotizacion.visaMultiple} />
      </div>
      
      {/* Sección Footer */}
      <div className="top-[334px]">
        <p>Fecha: {data.fecha}</p>
        <p>Responsable: {data.responsable}</p>
      </div>
    </div>
  );
}
```

**Nota importante:**
- `mb-2` en el campo "Tramite" crea un margen inferior para separar visualmente las secciones de Información y Cotización

### Componente CheckBox

```typescript
function CheckBox({ checked }: { checked: boolean }) {
  return (
    <div className="relative shrink-0 size-[14px]">
      <svg>
        <path d={checked ? svgPaths.p12fbc700 : svgPaths.p300d3d00} />
      </svg>
    </div>
  );
}
```

**Lógica:** 
- Si `checked` es `true` → usa el path de checkbox marcado
- Si `checked` es `false` → usa el path de checkbox vacío

---

## 5. Estilos de Impresión

### CSS para Media Print

En `App.tsx`, dentro del componente:

```jsx
<style>{`
  @media print {
    /* Ocultar todo excepto el contenido de impresión */
    body * {
      visibility: hidden;
    }
    
    /* Hacer visible solo la página de impresión */
    .print-page, .print-page * {
      visibility: visible;
    }
    
    /* Posicionar la página de impresión */
    .print-page {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    
    /* Configuración de página */
    @page {
      size: A4;
      margin: 10mm;
    }
  }
`}</style>
```

**Explicación:**

1. **Ocultar todo**: `body * { visibility: hidden; }` oculta todo el contenido de la página
2. **Mostrar solo impresión**: `.print-page, .print-page * { visibility: visible; }` hace visible solo el contenido con clase `print-page`
3. **Posicionamiento**: `position: absolute` asegura que la vista de impresión comience desde arriba
4. **Configuración A4**: `@page` define el tamaño de papel y márgenes

---

## 6. Flujo Completo del Sistema

### Diagrama de Flujo

```
Usuario llena formulario
         ↓
Usuario selecciona checkboxes:
  ☑ Carné
  ☑ Cheque de 250
  ☐ Cheque de 800
  ☐ Visa Múltiple
         ↓
Usuario hace clic en "Imprimir"
         ↓
handlePrint() valida:
  - ¿Tiene fecha? ✓
  - ¿Tiene responsable? ✓
  - ¿Al menos 1 selección? ✓
         ↓
setShowPrint(true)
         ↓
React renderiza <PrintableQuotation data={formData} />
         ↓
PrintableQuotation genera array:
  [
    { ...data, cotizacion: { carne: true, ... } },
    { ...data, cotizacion: { cheque250: true, ... } }
  ]
         ↓
Renderiza 2 tarjetas en grid 2x2
         ↓
setTimeout(() => window.print(), 100)
         ↓
Se abre diálogo de impresión del navegador
         ↓
Usuario imprime documento con 2 cotizaciones
```

---

## 7. Cómo Recrear Este Sistema

### Paso 1: Definir la Interfaz de Datos

```typescript
interface QuotationData {
  // Datos del caso
  nombre: string;
  nacionalidad: string;
  cotizacionNum: string;
  tramite: string;
  
  // Datos de autorización
  fecha: string;
  responsable: string;
  
  // Opciones de cotización (las que se seleccionan)
  cotizacion: {
    opcion1: boolean;
    opcion2: boolean;
    opcion3: boolean;
    opcion4: boolean;
  };
}
```

### Paso 2: Crear el Formulario con Estado

```typescript
const [formData, setFormData] = useState<QuotationData>({
  // ... valores iniciales
  fecha: new Date().toISOString().split('T')[0],
  responsable: 'Sistema',
});

const [showPrint, setShowPrint] = useState(false);
```

### Paso 3: Implementar Lógica de Impresión

```typescript
const handlePrint = () => {
  // Validaciones
  if (!formData.fecha || !formData.responsable) {
    alert('Complete campos obligatorios');
    return;
  }
  
  const hasSelection = Object.values(formData.cotizacion).some(v => v);
  if (!hasSelection) {
    alert('Seleccione al menos una opción');
    return;
  }
  
  // Activar vista de impresión
  setShowPrint(true);
  setTimeout(() => window.print(), 100);
};
```

### Paso 4: Crear Componente de Impresión

```typescript
export function PrintableQuotation({ data }: { data: QuotationData }) {
  const selectedQuotations = [];
  
  // Por cada opción seleccionada
  Object.keys(data.cotizacion).forEach(key => {
    if (data.cotizacion[key]) {
      // Crear nueva cotización con solo esa opción
      const newCotizacion = Object.keys(data.cotizacion).reduce((acc, k) => {
        acc[k] = k === key; // true solo para la opción actual
        return acc;
      }, {});
      
      selectedQuotations.push({
        ...data,
        cotizacion: newCotizacion
      });
    }
  });
  
  return (
    <div className="print-page">
      <div className="grid grid-cols-2 gap-4 p-4">
        {selectedQuotations.map((quotation, index) => (
          <QuotationCard key={index} data={quotation} />
        ))}
      </div>
    </div>
  );
}
```

### Paso 5: Agregar Estilos de Impresión

```jsx
<style>{`
  @media print {
    body * { visibility: hidden; }
    .print-page, .print-page * { visibility: visible; }
    .print-page { position: absolute; left: 0; top: 0; width: 100%; }
    @page { size: A4; margin: 10mm; }
  }
`}</style>
```

### Paso 6: Renderizado Condicional

```typescript
if (showPrint) {
  return <PrintableQuotation data={formData} />;
}

return (
  <div>
    {/* Formulario */}
    <button onClick={handlePrint}>Imprimir</button>
  </div>
);
```

---

## 8. Puntos Clave para un Agente IA

### ✅ Conceptos Importantes

1. **Spread Operator (`...data`)**: Copia todos los campos del objeto original
2. **Object.values().some()**: Verifica si al menos un valor cumple la condición
3. **window.print()**: API del navegador para abrir diálogo de impresión
4. **setTimeout**: Necesario para dar tiempo al render de React antes de imprimir
5. **@media print**: CSS específico para vista de impresión
6. **Renderizado Condicional**: Cambiar entre vista de formulario y vista de impresión

### ⚠️ Errores Comunes a Evitar

1. **No usar setTimeout**: Llamar `window.print()` inmediatamente después de `setShowPrint(true)` causará que no se haya renderizado el componente aún
2. **No validar selecciones**: Permitir imprimir sin opciones seleccionadas resulta en array vacío
3. **Mutar el objeto original**: Siempre crear nuevos objetos con `{ ...data }` en lugar de modificar el original
4. **Olvidar estilos de impresión**: Sin `@media print`, se imprimirá todo el formulario también

### 🎯 Características Clave del Sistema

- **1 selección → 1 tarjeta**
- **2 selecciones → 2 tarjetas**
- **3 selecciones → 3 tarjetas**
- **4 selecciones → 4 tarjetas**
- Cada tarjeta muestra **solo una opción marcada**
- Grid de 2 columnas para organización
- Fecha automática y responsable predeterminado
- Validaciones antes de imprimir

---

## 9. Ejemplo de Implementación Alternativa

Si quisieras una versión más genérica y reutilizable:

```typescript
function generateIndividualQuotations(data: QuotationData): QuotationData[] {
  return Object.entries(data.cotizacion)
    .filter(([_, value]) => value)
    .map(([key, _]) => ({
      ...data,
      cotizacion: Object.keys(data.cotizacion).reduce((acc, k) => {
        acc[k] = k === key;
        return acc;
      }, {} as typeof data.cotizacion)
    }));
}

export function PrintableQuotation({ data }: { data: QuotationData }) {
  const quotations = generateIndividualQuotations(data);
  
  return (
    <div className="print-page">
      <div className="grid grid-cols-2 gap-4 p-4">
        {quotations.map((quotation, index) => (
          <QuotationCard key={index} data={quotation} />
        ))}
      </div>
    </div>
  );
}
```

Esta versión es más funcional y evita la repetición de código.

---

## 10. Resumen Final

Este sistema utiliza:

1. **Estado de React** para controlar vista y datos
2. **Validaciones** para asegurar datos completos
3. **Transformación de datos** para generar cotizaciones individuales
4. **Renderizado condicional** para cambiar entre formulario e impresión
5. **CSS @media print** para optimizar la vista de impresión
6. **window.print()** para activar el diálogo de impresión del navegador

La clave está en **generar un array de objetos donde cada objeto representa una cotización individual con solo una opción marcada**, y luego renderizar una tarjeta por cada elemento del array.
