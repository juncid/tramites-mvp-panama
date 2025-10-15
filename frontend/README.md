# Frontend - Trámites MVP Panamá

Frontend moderno desarrollado con React, TypeScript y Material UI para el sistema de gestión de trámites del SNMP (Sistema Nacional de Migración de Panamá).

## 🚀 Tecnologías Utilizadas

- **React 18** - Librería para interfaces de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Material UI v5** - Sistema de diseño y componentes
- **Vite** - Herramienta de build y desarrollo
- **React Hook Form** - Manejo de formularios
- **Yup** - Validación de esquemas
- **Axios** - Cliente HTTP
- **ESLint + Prettier** - Linting y formateo de código

## 📁 Estructura del Proyecto

```
src/
├── api/                # Clientes API y servicios
├── components/         # Componentes reutilizables
│   ├── common/        # Componentes comunes (LoadingSpinner, ErrorAlert)
│   └── tramites/      # Componentes específicos de trámites
├── hooks/             # Hooks personalizados
├── pages/             # Páginas de la aplicación
├── theme/             # Configuración del tema de Material UI
├── types/             # Definiciones de tipos TypeScript
├── utils/             # Utilidades y helpers
├── App.tsx            # Componente principal
└── main.tsx           # Punto de entrada
```

## 🛠️ Configuración y Desarrollo

### Prerrequisitos

- Node.js >= 18
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# El servidor estará disponible en http://localhost:3000
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
npm run lint:fix

# Formateo de código
npm run format
npm run format:check
```

## 🎨 Características del Diseño

### Tema Personalizado

- **Colores**: Paleta adaptada para el gobierno de Panamá
- **Tipografía**: Roboto como fuente principal
- **Componentes**: Estilos personalizados para Material UI

### Responsive Design

- Diseño móvil-primero
- Breakpoints optimizados para diferentes dispositivos
- Grid system de Material UI

### Accesibilidad

- Componentes con etiquetas ARIA apropiadas
- Contraste de colores optimizado
- Navegación por teclado

## 🔧 Buenas Prácticas Implementadas

### Arquitectura

- **Separación de responsabilidades**: Componentes, hooks, servicios separados
- **Composición sobre herencia**: Componentes pequeños y reutilizables
- **Custom hooks**: Lógica de negocio extraída en hooks reutilizables

### Código

- **TypeScript estricto**: Tipado fuerte en toda la aplicación
- **ESLint + Prettier**: Estilo de código consistente
- **Convenciones de nombres**: PascalCase para componentes, camelCase para funciones

### Performance

- **Code splitting**: Chunks separados para vendor y Material UI
- **Lazy loading**: Componentes cargados bajo demanda
- **Optimización de bundle**: Configuración Vite optimizada

## 🚦 Manejo de Estados

### Estados Locales
- `useState` para estados simples de componentes
- `useReducer` para estados más complejos (cuando sea necesario)

### Estados Globales
- Custom hooks para compartir lógica entre componentes
- Context API para estados verdaderamente globales (si se requiere)

## 📱 Componentes Principales

### TramiteForm
- Formulario con validación usando react-hook-form + yup
- Feedback visual en tiempo real
- Manejo de estados de carga

### TramiteCard
- Tarjeta responsive para mostrar información del trámite
- Acciones inline (cambio de estado, eliminar)
- Estados visuales con chips de colores

### TramiteList
- Grid responsive de tarjetas
- Estado vacío con mensaje informativo
- Optimizado para múltiples elementos

## 🔐 Variables de Entorno

```bash
# .env.local
VITE_API_URL=http://localhost:8000/api/v1
```

## 🐛 Debugging

### DevTools Recomendadas
- React Developer Tools
- Redux DevTools (si se implementa Redux)
- Material-UI DevTools

### Logging
- `console.error` para errores
- Información de debug en desarrollo únicamente

## 📦 Build y Deployment

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

### Docker
El proyecto incluye configuración Docker optimizada para desarrollo y producción.

## 🧪 Testing (Preparado para)

La estructura está preparada para agregar:
- Jest + Testing Library para unit tests
- Cypress para E2E testing
- Storybook para component documentation

## 📋 TODOs y Mejoras Futuras

- [ ] Implementar testing suite completa
- [ ] Agregar internacionalización (i18n)
- [ ] Implementar Progressive Web App (PWA)
- [ ] Agregar modo oscuro
- [ ] Implementar caching con React Query
- [ ] Agregar documentación con Storybook

## 🤝 Contribución

1. Seguir las convenciones de código establecidas
2. Ejecutar linting antes de commits
3. Usar commits descriptivos siguiendo Conventional Commits
4. Probar cambios localmente antes de push

## 📄 Licencia

Este proyecto es parte del MVP para el Sistema Nacional de Migración de Panamá.