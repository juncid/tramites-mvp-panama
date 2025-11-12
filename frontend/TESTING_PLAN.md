# 🧪 Plan de Testing - Frontend

## 📋 Índice

1. [Estrategia de Testing](#estrategia-de-testing)
2. [Herramientas y Configuración](#herramientas-y-configuración)
3. [Tipos de Tests](#tipos-de-tests)
4. [Cobertura Objetivo](#cobertura-objetivo)
5. [Tests Implementados](#tests-implementados)
6. [Guía de Escritura de Tests](#guía-de-escritura-de-tests)
7. [Comandos](#comandos)
8. [CI/CD Integration](#cicd-integration)

---

## 🎯 Estrategia de Testing

### Pirámide de Testing

```
         /\
        /  \        E2E Tests (10%)
       /────\       - Flujos críticos completos
      /      \      - Integración real con backend
     /────────\     
    /          \    Integration Tests (30%)
   /────────────\   - Interacción entre componentes
  /              \  - Navegación entre páginas
 /────────────────\ 
/                  \ Unit Tests (60%)
\──────────────────/ - Componentes individuales
                     - Funciones utilitarias
                     - Hooks personalizados
```

### Principios

- ✅ **AAA Pattern**: Arrange, Act, Assert
- ✅ **Test Behavior, Not Implementation**: Testear lo que el usuario ve
- ✅ **DRY**: No repetir código en tests
- ✅ **Descriptive Names**: Nombres claros de lo que se testea
- ✅ **Fast**: Tests rápidos (<1s por test)
- ✅ **Independent**: Cada test es independiente
- ✅ **Repeatable**: Mismo resultado cada vez

---

## 🛠️ Herramientas y Configuración

### Stack de Testing

| Herramienta | Propósito | Versión |
|-------------|-----------|---------|
| **Vitest** | Test runner (alternativa moderna a Jest) | ^1.0.4 |
| **React Testing Library** | Testing de componentes React | ^14.1.2 |
| **@testing-library/user-event** | Simulación de eventos de usuario | ^14.5.1 |
| **@testing-library/jest-dom** | Matchers personalizados para DOM | ^6.1.5 |
| **jsdom** | Simulación de DOM en Node.js | ^23.0.1 |

### Configuración

**vite.config.ts:**
```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  css: true,
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [
      'node_modules/',
      'src/test/',
      '**/*.d.ts',
      '**/*.config.*',
      '**/mockData',
      'dist/',
    ],
  },
}
```

**src/test/setup.ts:**
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);
afterEach(() => cleanup());
```

---

## 🧩 Tipos de Tests

### 1️⃣ Unit Tests (60%)

**Qué testear:**
- ✅ Componentes individuales
- ✅ Hooks personalizados
- ✅ Funciones utilitarias
- ✅ Validaciones
- ✅ Transformaciones de datos

**Ejemplo:**

```typescript
// src/test/pages/PublicAccess.test.tsx
describe('PublicAccess Component', () => {
  it('renderiza el formulario correctamente', () => {
    render(<PublicAccess />);
    expect(screen.getByText(/Consulta de Solicitud/i)).toBeInTheDocument();
  });

  it('convierte el número de solicitud a mayúsculas', async () => {
    render(<PublicAccess />);
    const input = screen.getByLabelText(/Número de Solicitud/i);
    fireEvent.change(input, { target: { value: 'ppsh-2025-00001' } });
    
    await waitFor(() => {
      expect(input.value).toBe('PPSH-2025-00001');
    });
  });
});
```

### 2️⃣ Integration Tests (30%)

**Qué testear:**
- ✅ Navegación entre páginas
- ✅ Flujos de formularios multi-paso
- ✅ Interacción entre componentes padre-hijo
- ✅ Context providers
- ✅ Llamadas a API (mockeadas)

**Ejemplo:**

```typescript
// src/test/integration/PublicAccessFlow.test.tsx
describe('Flujo de Acceso Público', () => {
  it('permite navegar desde ingreso hasta vista de solicitud', async () => {
    const { user } = setup(<App />);
    
    // 1. Usuario ingresa datos
    await user.type(screen.getByLabelText(/Número de Solicitud/i), 'PPSH-2025-00001');
    await user.type(screen.getByLabelText(/Número de Pasaporte/i), 'N123456789');
    await user.click(screen.getByRole('button', { name: /Consultar/i }));
    
    // 2. Sistema valida y navega
    await waitFor(() => {
      expect(screen.getByText(/PPSH-2025-00001/i)).toBeInTheDocument();
    });
    
    // 3. Usuario ve estado de su solicitud
    expect(screen.getByText(/Estado del Trámite/i)).toBeInTheDocument();
  });
});
```

### 3️⃣ E2E Tests (10%)

**Qué testear:**
- ✅ Flujos críticos completos
- ✅ Autenticación
- ✅ Carga de documentos
- ✅ Workflows completos

**Herramienta:** Playwright o Cypress (a implementar)

---

## 📊 Cobertura Objetivo

### Metas de Cobertura

| Métrica | Objetivo | Crítico |
|---------|----------|---------|
| **Statements** | ≥ 80% | ≥ 70% |
| **Branches** | ≥ 75% | ≥ 65% |
| **Functions** | ≥ 80% | ≥ 70% |
| **Lines** | ≥ 80% | ≥ 70% |

### Prioridades de Cobertura

**🔴 Prioridad Alta (100% coverage):**
- Lógica de negocio crítica
- Validaciones de formularios
- Transformaciones de datos
- Funciones utilitarias

**🟡 Prioridad Media (80% coverage):**
- Componentes de páginas
- Hooks personalizados
- Context providers

**🟢 Prioridad Baja (60% coverage):**
- Componentes de UI puros
- Layouts
- Estilos

---

## ✅ Tests Implementados

### 📁 Estructura de Archivos de Test

```
frontend/src/test/
├── setup.ts                    # Configuración global de tests
├── utils/                      # Utilidades para tests
│   ├── test-utils.tsx         # Wrappers personalizados
│   └── mockData.ts            # Datos de prueba
├── pages/                     # Tests de páginas
│   ├── PublicAccess.test.tsx
│   ├── PublicSolicitudView.test.tsx
│   ├── Profile.test.tsx
│   ├── Settings.test.tsx
│   ├── CargaDocumentosPPSH.test.tsx
│   └── DetalleProcesoPPSH.test.tsx
├── components/                # Tests de componentes
│   ├── Header.test.tsx
│   ├── MainLayout.test.tsx
│   └── WorkflowEditor.test.tsx
├── hooks/                     # Tests de hooks
│   └── useAuth.test.ts
└── integration/               # Tests de integración
    ├── PublicAccessFlow.test.tsx
    ├── PPSHWorkflow.test.tsx
    └── AuthFlow.test.tsx
```

### 📝 Tests por Componente

#### **1. PublicAccess (Acceso Público)**

✅ **Tests implementados:**
- Renderiza formulario correctamente
- Muestra error cuando campos vacíos
- Habilita botón cuando se llenan campos
- Convierte número de solicitud a mayúsculas
- Cambia label según tipo de documento

**Archivo:** `src/test/pages/PublicAccess.test.tsx`

#### **2. Profile (Perfil de Usuario)**

✅ **Tests implementados:**
- Renderiza información del perfil
- Muestra avatar con iniciales
- Muestra campos del formulario
- Campos deshabilitados por defecto
- Permite editar en modo edición

**Archivo:** `src/test/pages/Profile.test.tsx`

#### **3. Settings (Configuración)**

🚧 **Tests pendientes:**
- [ ] Cambio de contraseña
- [ ] Toggle de notificaciones
- [ ] Cambio de idioma
- [ ] Activación de 2FA

#### **4. CargaDocumentosPPSH**

🚧 **Tests pendientes:**
- [ ] Lista de documentos requeridos
- [ ] Carga de archivo
- [ ] Validación de tipo de archivo
- [ ] Validación de tamaño
- [ ] Eliminación de documento

#### **5. WorkflowEditor**

🚧 **Tests pendientes:**
- [ ] Crear nueva etapa
- [ ] Editar etapa existente
- [ ] Eliminar etapa
- [ ] Reordenar etapas
- [ ] Agregar condiciones

---

## 📖 Guía de Escritura de Tests

### Template de Test

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ComponentName from '../ComponentName';

describe('ComponentName', () => {
  // Setup común
  beforeEach(() => {
    // Reset mocks, etc.
  });

  // Test de renderizado básico
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <ComponentName />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  // Test de interacción
  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<ComponentName />);
    
    const button = screen.getByRole('button', { name: /submit/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  // Test de estados
  it('displays loading state', () => {
    render(<ComponentName loading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  // Test de errores
  it('displays error message', () => {
    render(<ComponentName error="Something went wrong" />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```

### Mejores Prácticas

#### ✅ **DO - Hacer**

```typescript
// ✅ Usar queries de accesibilidad
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)

// ✅ User event para interacciones realistas
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');

// ✅ Esperar cambios asíncronos
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// ✅ Nombres descriptivos
it('muestra mensaje de error cuando el email es inválido', () => {})
```

#### ❌ **DON'T - Evitar**

```typescript
// ❌ No usar queries frágiles
container.querySelector('.my-class')

// ❌ No testear detalles de implementación
expect(component.state.loading).toBe(true)

// ❌ No usar setTimeout
setTimeout(() => expect(...), 100)

// ❌ Nombres vagos
it('works', () => {})
```

### Queries Recomendadas (en orden de preferencia)

1. **getByRole** - Mejor accesibilidad
2. **getByLabelText** - Formularios
3. **getByPlaceholderText** - Inputs
4. **getByText** - Contenido visible
5. **getByDisplayValue** - Valores de inputs
6. **getByAltText** - Imágenes
7. **getByTitle** - Títulos
8. **getByTestId** - Último recurso

---

## 🚀 Comandos

### Ejecutar Tests

```bash
# Modo watch (desarrollo)
npm run test

# UI interactiva
npm run test:ui

# Ejecutar una vez
npm run test:run

# Con cobertura
npm run test:coverage

# Ejecutar un archivo específico
npm run test PublicAccess

# Ejecutar tests que coincidan con patrón
npm run test -- -t "renderiza"
```

### Ver Cobertura

```bash
# Generar reporte de cobertura
npm run test:coverage

# Ver reporte HTML
open coverage/index.html
```

### Debug

```bash
# Modo debug
npm run test -- --inspect-brk

# Con logs detallados
npm run test -- --reporter=verbose
```

---

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        working-directory: frontend
        
      - name: Run tests
        run: npm run test:coverage
        working-directory: frontend
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json
          
      - name: Check coverage threshold
        run: |
          npm run test:coverage -- --coverage.lines=70
        working-directory: frontend
```

---

## 📝 Checklist de Tests por Página

### ✅ PublicAccess
- [x] Renderizado de formulario
- [x] Validación de campos vacíos
- [x] Habilitación de botón
- [x] Conversión a mayúsculas
- [x] Cambio de tipo de documento

### ✅ Profile
- [x] Renderizado de perfil
- [x] Avatar con iniciales
- [x] Campos del formulario
- [x] Estado deshabilitado

### 🚧 Settings
- [ ] Cambio de contraseña
- [ ] Validación de contraseña
- [ ] Toggle de notificaciones
- [ ] Cambio de idioma
- [ ] Activación de 2FA

### 🚧 CargaDocumentosPPSH
- [ ] Lista de documentos
- [ ] Carga de archivo
- [ ] Validación de archivo
- [ ] Progreso de carga
- [ ] Eliminación de documento
- [ ] Vista previa

### 🚧 DetalleProcesoPPSH
- [ ] Información de solicitud
- [ ] Timeline de etapas
- [ ] Documentos adjuntos
- [ ] Observaciones
- [ ] Botones de acción

### 🚧 WorkflowEditor
- [ ] Crear etapa
- [ ] Editar etapa
- [ ] Eliminar etapa
- [ ] Reordenar etapas
- [ ] Agregar transiciones
- [ ] Validar workflow

---

## 🎯 Próximos Pasos

### Fase 1: Setup (Completado ✅)
- [x] Configurar Vitest
- [x] Configurar React Testing Library
- [x] Crear setup.ts
- [x] Crear primeros tests de ejemplo

### Fase 2: Tests Críticos (En Progreso 🚧)
- [x] PublicAccess tests
- [x] Profile tests
- [ ] Settings tests
- [ ] CargaDocumentos tests
- [ ] Authentication flow tests

### Fase 3: Cobertura Completa (Pendiente 📋)
- [ ] Todos los componentes de páginas
- [ ] Todos los componentes reutilizables
- [ ] Todos los hooks
- [ ] Todos los utilities
- [ ] Tests de integración

### Fase 4: E2E (Futuro 🔮)
- [ ] Setup Playwright/Cypress
- [ ] Flujos críticos E2E
- [ ] Tests de regresión visual

---

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

## 🤝 Convenciones del Equipo

1. **Todos los componentes nuevos** deben tener tests
2. **PRs no se aprueban** sin tests
3. **Cobertura mínima** del 70% en archivos modificados
4. **Tests deben pasar** en CI/CD antes de merge
5. **Snapshots** solo para casos muy específicos (evitar en general)

---

**Última actualización:** Noviembre 12, 2025
**Mantenido por:** Equipo de Desarrollo Frontend
