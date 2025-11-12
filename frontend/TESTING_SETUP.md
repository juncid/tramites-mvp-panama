# 🧪 Testing Setup - Guía de Instalación

## 📦 Instalación de Dependencias

### 1. Instalar paquetes de testing

```bash
cd frontend
npm install --save-dev \
  vitest@^1.0.4 \
  @testing-library/react@^14.1.2 \
  @testing-library/user-event@^14.5.1 \
  @testing-library/jest-dom@^6.1.5 \
  @types/jest@^29.5.11 \
  jsdom@^23.0.1
```

### 2. Verificar instalación

```bash
npm list vitest @testing-library/react
```

Deberías ver:
```
tramites-mvp-panama-frontend@1.0.0
├── @testing-library/react@14.1.2
└── vitest@1.0.4
```

---

## ⚙️ Configuración

### 1. Actualizar `vite.config.ts`

El archivo ya está configurado con:

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  css: true,
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
  },
}
```

### 2. Archivo de setup (`src/test/setup.ts`)

Ya creado con:
- Matchers de jest-dom
- Cleanup automático
- Mocks de window.matchMedia
- Mocks de IntersectionObserver
- Mocks de ResizeObserver

---

## 🚀 Ejecutar Tests

### Comandos disponibles

```bash
# Modo watch (recomendado para desarrollo)
npm run test

# UI interactiva de Vitest
npm run test:ui

# Ejecutar una vez (para CI/CD)
npm run test:run

# Con reporte de cobertura
npm run test:coverage
```

### Ejemplos de uso

```bash
# Ejecutar un test específico
npm run test PublicAccess

# Ejecutar tests que coincidan con patrón
npm run test -- -t "renderiza"

# Ver cobertura en HTML
npm run test:coverage
open coverage/index.html
```

---

## 📁 Estructura de Archivos

```
frontend/
├── src/
│   ├── test/
│   │   ├── setup.ts                 # Configuración global
│   │   ├── utils/
│   │   │   ├── test-utils.tsx       # Helpers para tests
│   │   │   └── mockData.ts          # Datos mock
│   │   ├── pages/
│   │   │   ├── PublicAccess.test.tsx
│   │   │   ├── Profile.test.tsx
│   │   │   └── Settings.test.tsx
│   │   ├── components/
│   │   │   └── Header.test.tsx
│   │   └── integration/
│   │       └── PublicAccessFlow.test.tsx
│   └── pages/
│       ├── PublicAccess.tsx
│       └── ...
├── package.json
├── vite.config.ts
└── TESTING_PLAN.md
```

---

## ✅ Verificar que todo funciona

### Test de prueba

Crea un archivo temporal `src/test/example.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('Example Test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Ejecuta:
```bash
npm run test
```

Deberías ver:
```
✓ src/test/example.test.ts (1)
  ✓ Example Test (1)
    ✓ should work

Test Files  1 passed (1)
     Tests  1 passed (1)
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'vitest'"

**Solución:**
```bash
npm install --save-dev vitest
```

### Error: "Cannot find module '@testing-library/react'"

**Solución:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### Error: "ReferenceError: document is not defined"

**Solución:** Asegúrate de que `vite.config.ts` tiene:
```typescript
test: {
  environment: 'jsdom'
}
```

### Tests pasan en local pero fallan en CI

**Solución:** Verifica que:
1. Todas las dependencias están en `package.json`
2. No hay referencias a archivos fuera del proyecto
3. Los paths son relativos, no absolutos

---

## 📊 Configurar CI/CD

### GitHub Actions

Crea `.github/workflows/test.yml`:

```yaml
name: Frontend Tests

on:
  push:
    branches: [main, develop, implementar-vistas]
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
          cache-dependency-path: frontend/package-lock.json
          
      - name: Install dependencies
        working-directory: frontend
        run: npm ci
        
      - name: Run tests
        working-directory: frontend
        run: npm run test:coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json
          flags: frontend
          
      - name: Check coverage threshold
        working-directory: frontend
        run: |
          npm run test:coverage -- --coverage.lines=70
```

---

## 📖 Próximos Pasos

1. ✅ Instalar dependencias
2. ✅ Verificar configuración
3. ✅ Ejecutar tests de ejemplo
4. 📝 Escribir tests para componentes existentes
5. 📝 Configurar CI/CD
6. 📝 Establecer cobertura mínima

---

## 🔗 Recursos

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Plan de Testing Completo](./TESTING_PLAN.md)

---

**¿Problemas?** Abre un issue o contacta al equipo de desarrollo.
