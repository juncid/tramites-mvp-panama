/**
 * Templates predefinidos para vistas dinámicas
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Colección de plantillas listas para usar que facilitan
 * la creación de formularios comunes en workflows.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-13
 */

import type { ConfigJson } from '../types/dynamic-view';

/**
 * Template para solicitud básica con datos personales
 */
export const TEMPLATE_SOLICITUD_BASICA: ConfigJson = {
  titulo: 'Solicitud Básica',
  descripcion: 'Formulario simple con datos personales',
  secciones: [
    {
      titulo: 'Información Personal',
      descripcion: 'Datos básicos del solicitante',
      componentes: [
        {
          tipo: 'TEXTO',
          label: 'Nombre Completo',
          pregunta_id: 1,
          obligatorio: true,
          config: {
            placeholder: 'Ingrese su nombre completo'
          }
        },
        {
          tipo: 'NUMERO',
          label: 'Cédula de Identidad',
          pregunta_id: 2,
          obligatorio: true,
          config: {
            placeholder: '0-000-0000'
          }
        },
        {
          tipo: 'FECHA',
          label: 'Fecha de Nacimiento',
          pregunta_id: 3,
          obligatorio: true
        }
      ]
    },
    {
      titulo: 'Documentos',
      descripcion: 'Adjuntar documentos requeridos',
      componentes: [
        {
          tipo: 'ARCHIVO',
          label: 'Cédula (Foto o escaneada)',
          pregunta_id: 4,
          obligatorio: true,
          config: {
            tipos_permitidos: ['pdf', 'jpg', 'png'],
            max_size_mb: 10,
            max_archivos: 2
          }
        }
      ]
    }
  ]
};

/**
 * Template para revisión de documentos
 */
export const TEMPLATE_REVISION_DOCUMENTOS: ConfigJson = {
  titulo: 'Revisión de Documentos',
  descripcion: 'Verificar documentos adjuntos por el solicitante',
  secciones: [
    {
      titulo: 'Documentos a Revisar',
      componentes: [
        {
          tipo: 'SELECT',
          label: 'Estado de la Cédula',
          pregunta_id: 1,
          obligatorio: true,
          config: {
            opciones: [
              { valor: 'APROBADO', etiqueta: 'Aprobado' },
              { valor: 'RECHAZADO', etiqueta: 'Rechazado - Volver a subir' },
              { valor: 'PENDIENTE', etiqueta: 'Pendiente de revisión' }
            ]
          }
        },
        {
          tipo: 'TEXTO',
          label: 'Comentarios',
          pregunta_id: 2,
          obligatorio: false,
          config: {
            multiline: true,
            placeholder: 'Observaciones sobre los documentos...'
          }
        }
      ]
    }
  ]
};

/**
 * Template para aprobación de solicitud
 */
export const TEMPLATE_APROBACION: ConfigJson = {
  titulo: 'Aprobación de Solicitud',
  descripcion: 'Decisión final sobre la solicitud',
  secciones: [
    {
      titulo: 'Decisión',
      componentes: [
        {
          tipo: 'SELECT',
          label: 'Estado Final',
          pregunta_id: 1,
          obligatorio: true,
          config: {
            opciones: [
              { valor: 'APROBADO', etiqueta: '✅ Aprobar Solicitud' },
              { valor: 'RECHAZADO', etiqueta: '❌ Rechazar Solicitud' },
              { valor: 'REVISION', etiqueta: '⚠️ Solicitar Más Información' }
            ]
          }
        },
        {
          tipo: 'TEXTO',
          label: 'Justificación',
          pregunta_id: 2,
          obligatorio: true,
          config: {
            multiline: true,
            placeholder: 'Explique brevemente la decisión...'
          }
        }
      ]
    }
  ]
};

/**
 * Template: Revisión de Requisitos (Basado en diseño de Figma)
 * Vista completa con radio button y checklist de 12 documentos
 */
export const TEMPLATE_REVISION_REQUISITOS: ConfigJson = {
  titulo: 'Revisión requisitos',
  descripcion: 'Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam.',
  secciones: [
    {
      titulo: 'Resultados OCR',
      componentes: [
        {
          tipo: 'RADIO',
          label: 'Obtuvieron los archivos resultados positivos en la revisión OCR',
          pregunta_id: 101,
          obligatorio: true,
          config: {
            opciones: [
              { valor: 'no', etiqueta: 'No' },
              { valor: 'si', etiqueta: 'Sí' }
            ]
          }
        }
      ]
    },
    {
      titulo: 'Revisión manual de documentos',
      componentes: [
        {
          tipo: 'CHECKBOX_LIST',
          label: 'Documentos',
          pregunta_id: 102,
          obligatorio: false,
          config: {
            showOcrColumn: true,
            items: [
              {
                id: 'doc1',
                label: 'Poder y solicitud mediante apoderado legal.',
                disabled: true,
                showIcon: true,
                iconType: 'download'
              },
              {
                id: 'doc2',
                label: 'Dos fotos tamaño carnet, fondo blanco o a color.',
                showIcon: true,
                iconType: 'download'
              },
              {
                id: 'doc3',
                label: 'Copia completa del pasaporte debidamente notariado.',
                showIcon: true,
                iconType: 'download'
              },
              {
                id: 'doc4',
                label: 'Comprobante de domicilio del solicitante.',
                showIcon: true,
                iconType: 'info'
              },
              {
                id: 'doc5',
                label: 'Certificado de antecedentes de su país de origen debidamente autenticado, apostillado, según sea el caso.',
                showIcon: true,
                iconType: 'download'
              },
              {
                id: 'doc6',
                label: 'Declaración jurada de antecedentes personales.',
                showIcon: true,
                iconType: 'download'
              },
              {
                id: 'doc7',
                label: 'Certificado de salud expedido por un profesional idóneo.',
                showIcon: true,
                iconType: 'download'
              },
              {
                id: 'doc8',
                label: 'Copia del registro de mano de obra migrante solicitado ante el Ministerio de Trabajo y Desarrollo Laboral.',
                showIcon: true,
                iconType: 'download'
              },
              {
                id: 'doc9',
                label: 'Cheque certificado o de Gerencia del Banco Nacional, a favor del Servicio Nacional de Migración por un monto de B/.800.00 en concepto de repatriación.',
                disabled: true,
                showIcon: true,
                iconType: 'download'
              },
              {
                id: 'doc10',
                label: 'Cheque certificado o de Gerencia del Banco Nacional, a favor del Servicio Nacional de Migración por un monto de B/.250.00 en concepto de servicio migratorio.',
                disabled: true,
                showIcon: true,
                iconType: 'download'
              },
              {
                id: 'doc11',
                label: 'Pago por la suma de B/.100.00 en concepto de carnet y visa múltiple por el permiso solicitado.',
                disabled: true,
                showIcon: true,
                iconType: 'download'
              },
              {
                id: 'doc12',
                label: 'Cheque certificado o de Gerencia del Banco Nacional de Panamá, a favor del Tesoro Nacional por un monto de cien balboas (B/.100.00), en concepto de Permiso de Trabajo.',
                disabled: true,
                showIcon: true,
                iconType: 'download'
              }
            ]
          }
        }
      ]
    }
  ]
};

/**
 * Colección de todos los templates disponibles
 */
export const TEMPLATES = {
  SOLICITUD_BASICA: TEMPLATE_SOLICITUD_BASICA,
  REVISION_DOCUMENTOS: TEMPLATE_REVISION_DOCUMENTOS,
  APROBACION: TEMPLATE_APROBACION,
  REVISION_REQUISITOS: TEMPLATE_REVISION_REQUISITOS,
};

/**
 * Helper para obtener template por nombre
 * 
 * @param nombre - Nombre del template
 * @returns ConfigJson del template o null si no existe
 */
export function getTemplate(nombre: string): ConfigJson | null {
  return TEMPLATES[nombre as keyof typeof TEMPLATES] || null;
}

