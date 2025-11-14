/**
 * Adaptador de Respuestas de Formularios
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Utilidades para convertir datos de formularios dinámicos y tradicionales
 * al formato esperado por el backend (WorkflowRespuesta).
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-14
 */

import type { RespuestaFormulario } from '../types/workflow';

/**
 * Tipo de valores que pueden venir de los formularios
 */
type ValorFormulario = string | number | boolean | Date | File | any[] | null | undefined;

/**
 * Inferir el tipo de valor y asignarlo al campo correcto
 */
const detectarTipoValor = (valor: ValorFormulario): Partial<RespuestaFormulario> => {
  if (valor === null || valor === undefined) {
    return { valor_texto: undefined };
  }

  // String
  if (typeof valor === 'string') {
    return { valor_texto: valor };
  }

  // Number
  if (typeof valor === 'number') {
    return { valor_numero: valor };
  }

  // Boolean
  if (typeof valor === 'boolean') {
    return { valor_booleano: valor };
  }

  // Date
  if (valor instanceof Date) {
    return { valor_fecha: valor.toISOString() };
  }

  // File
  if (valor instanceof File) {
    return { 
      valor_texto: valor.name,
      archivos: [valor]
    };
  }

  // Array o Object complejo
  return { valor_json: valor };
};

/**
 * Formatear respuestas de DynamicRenderer (vistas dinámicas)
 * 
 * @param valores - Objeto con valores del formulario { campoId: valor }
 * @param mapeoOpcional - Mapeo opcional de campoId -> pregunta_id
 * @returns Array de respuestas formateadas
 */
export const formatearRespuestasDinamicas = (
  valores: Record<string, ValorFormulario>,
  mapeoOpcional?: Map<string, number>
): RespuestaFormulario[] => {
  return Object.entries(valores).map(([campoId, valor]) => {
    const preguntaId = mapeoOpcional?.get(campoId);
    const campos = detectarTipoValor(valor);

    return {
      campo_id: campoId,
      pregunta_id: preguntaId,
      ...campos,
    };
  });
};

/**
 * Formatear respuestas de FormularioTradicional (preguntas legacy)
 * 
 * @param valores - Objeto con valores { preguntaId: valor }
 * @returns Array de respuestas formateadas
 */
export const formatearRespuestasTradicionales = (
  valores: Record<string, ValorFormulario>
): RespuestaFormulario[] => {
  return Object.entries(valores).map(([preguntaIdStr, valor]) => {
    const preguntaId = parseInt(preguntaIdStr);
    const campos = detectarTipoValor(valor);

    return {
      pregunta_id: preguntaId,
      ...campos,
    };
  });
};

/**
 * Convertir FileList a array de Files
 */
export const fileListToArray = (fileList: FileList | null): File[] => {
  if (!fileList) return [];
  return Array.from(fileList);
};

/**
 * Normalizar respuestas de cualquier tipo de formulario
 * Detecta automáticamente si viene de vista dinámica o tradicional
 */
export const formatearRespuestasAutomatico = (
  valores: Record<string, ValorFormulario>
): RespuestaFormulario[] => {
  // Detectar si las keys son números (tradicional) o strings (dinámico)
  const primeraClave = Object.keys(valores)[0];
  const esTradicional = !isNaN(Number(primeraClave));

  if (esTradicional) {
    return formatearRespuestasTradicionales(valores);
  } else {
    return formatearRespuestasDinamicas(valores);
  }
};

/**
 * Validar que las respuestas obligatorias estén presentes
 */
export const validarRespuestasObligatorias = (
  respuestas: RespuestaFormulario[],
  camposObligatorios: (string | number)[]
): string[] => {
  const errores: string[] = [];
  const respondidos = new Set(
    respuestas.map((r) => r.pregunta_id || r.campo_id).filter(Boolean)
  );

  camposObligatorios.forEach((campo) => {
    if (!respondidos.has(campo)) {
      errores.push(`Campo obligatorio faltante: ${campo}`);
    }
  });

  return errores;
};

/**
 * Combinar respuestas de múltiples fuentes (útil para formularios complejos)
 */
export const combinarRespuestas = (
  ...respuestasArrays: RespuestaFormulario[][]
): RespuestaFormulario[] => {
  const mapa = new Map<string, RespuestaFormulario>();

  respuestasArrays.flat().forEach((respuesta) => {
    const key = respuesta.pregunta_id?.toString() || respuesta.campo_id || '';
    if (key) {
      mapa.set(key, respuesta);
    }
  });

  return Array.from(mapa.values());
};

/**
 * Extraer valores simples de respuestas (útil para debugging)
 */
export const extraerValoresSimples = (
  respuestas: RespuestaFormulario[]
): Record<string, any> => {
  const valores: Record<string, any> = {};

  respuestas.forEach((respuesta) => {
    const key = respuesta.pregunta_id?.toString() || respuesta.campo_id || '';
    if (!key) return;

    // Prioridad: json > texto > numero > fecha > booleano
    if (respuesta.valor_json !== undefined) {
      valores[key] = respuesta.valor_json;
    } else if (respuesta.valor_texto !== undefined) {
      valores[key] = respuesta.valor_texto;
    } else if (respuesta.valor_numero !== undefined) {
      valores[key] = respuesta.valor_numero;
    } else if (respuesta.valor_fecha !== undefined) {
      valores[key] = respuesta.valor_fecha;
    } else if (respuesta.valor_booleano !== undefined) {
      valores[key] = respuesta.valor_booleano;
    }
  });

  return valores;
};

/**
 * Helper para crear respuesta simple (útil para testing)
 */
export const crearRespuestaSimple = (
  identificador: string | number,
  valor: ValorFormulario,
  esTradicional: boolean = false
): RespuestaFormulario => {
  const campos = detectarTipoValor(valor);

  if (esTradicional && typeof identificador === 'number') {
    return {
      pregunta_id: identificador,
      ...campos,
    };
  } else {
    return {
      campo_id: String(identificador),
      ...campos,
    };
  }
};

export default {
  formatearRespuestasDinamicas,
  formatearRespuestasTradicionales,
  formatearRespuestasAutomatico,
  validarRespuestasObligatorias,
  combinarRespuestas,
  extraerValoresSimples,
  crearRespuestaSimple,
  fileListToArray,
};
