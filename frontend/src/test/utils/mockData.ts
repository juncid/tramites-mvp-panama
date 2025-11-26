/**
 * Mock data para tests
 */

export const mockUser = {
  userId: '1',
  nombres: 'Juan',
  apellidos: 'Pérez',
  email: 'juan.perez@migracion.gob.pa',
  telefono: '+507 6123-4567',
  cargo: 'Analista PPSH',
  departamento: 'Departamento de PPSH',
  agencia: 'Oficina Central',
  roles: ['PPSH_ANALISTA', 'USUARIO'],
  fechaCreacion: '2025-01-01T00:00:00',
  ultimoAcceso: '2025-11-12T10:30:00',
};

export const mockSolicitudPublica = {
  numeroSolicitud: 'PPSH-2025-00001',
  tipoTramite: 'Permiso Provisional de Salida Humanitaria (PPSH)',
  fechaSolicitud: '2025-01-15T10:30:00',
  estadoActual: 'EN_REVISION',
  solicitante: {
    nombreCompleto: 'Juan Carlos Pérez González',
    numeroDocumento: 'N123456789',
  },
  workflow: {
    etapaActual: 'Revisión de Documentos',
    etapas: [
      {
        nombre: 'Recepción de Solicitud',
        estado: 'COMPLETADO',
        fechaInicio: '2025-01-15T10:30:00',
        fechaFin: '2025-01-15T11:00:00',
        orden: 1,
      },
      {
        nombre: 'Revisión de Documentos',
        estado: 'EN_PROCESO',
        fechaInicio: '2025-01-16T09:00:00',
        orden: 2,
      },
      {
        nombre: 'Evaluación Técnica',
        estado: 'PENDIENTE',
        orden: 3,
      },
      {
        nombre: 'Aprobación Final',
        estado: 'PENDIENTE',
        orden: 4,
      },
    ],
  },
  documentosRequeridos: [
    {
      nombre: 'Pasaporte',
      cargado: true,
      fechaCarga: '2025-01-15T10:30:00',
      requerido: true,
    },
    {
      nombre: 'Fotografía',
      cargado: true,
      fechaCarga: '2025-01-15T10:30:00',
      requerido: true,
    },
    {
      nombre: 'Comprobante de Pago',
      cargado: false,
      requerido: true,
    },
  ],
  observaciones: 'Se requiere completar la carga del comprobante de pago.',
  proximoPaso: 'Cargar el comprobante de pago de la tasa administrativa.',
};

export const mockWorkflow = {
  workflowId: 1,
  nombre: 'PPSH - Flujo Estándar',
  descripcion: 'Flujo para solicitudes de PPSH',
  activo: true,
  etapas: [
    {
      etapaId: 1,
      nombre: 'Recepción de Solicitud',
      descripcion: 'Primera etapa del proceso',
      orden: 1,
      requiereAprobacion: false,
      visiblePublico: true,
    },
    {
      etapaId: 2,
      nombre: 'Revisión de Documentos',
      descripcion: 'Validación de documentos',
      orden: 2,
      requiereAprobacion: true,
      visiblePublico: true,
    },
  ],
};

export const mockDocumentos = [
  {
    documentoId: 1,
    nombre: 'Pasaporte.pdf',
    tipo: 'application/pdf',
    tamaño: 1024000,
    fechaCarga: '2025-01-15T10:30:00',
    estado: 'APROBADO',
  },
  {
    documentoId: 2,
    nombre: 'Foto.jpg',
    tipo: 'image/jpeg',
    tamaño: 512000,
    fechaCarga: '2025-01-15T10:35:00',
    estado: 'PENDIENTE',
  },
];

export const mockNotifications = {
  email: true,
  push: false,
  solicitudes: true,
  tramites: true,
  recordatorios: false,
};

export const mockPreferences = {
  darkMode: false,
  twoFactorAuth: false,
  language: 'es',
};
