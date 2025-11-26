/**
 * Sistema de alias para workflows
 * Permite usar nombres legibles en lugar de IDs numéricos en las URLs
 */

export const WORKFLOW_ALIASES: Record<string, number> = {
  'PPSH': 3011,
  'ppsh': 3011, // Aceptar minúsculas también
};

export const WORKFLOW_IDS_TO_ALIASES: Record<number, string> = {
  3011: 'PPSH',
};

/**
 * Resuelve un alias a su ID numérico
 * Si el valor ya es un número, lo devuelve tal cual
 */
export const resolveWorkflowId = (aliasOrId: string | number): number => {
  if (typeof aliasOrId === 'number') {
    return aliasOrId;
  }
  
  const id = WORKFLOW_ALIASES[aliasOrId];
  if (id !== undefined) {
    return id;
  }
  
  // Si no es un alias, intentar parsearlo como número
  const parsed = parseInt(aliasOrId, 10);
  if (!isNaN(parsed)) {
    return parsed;
  }
  
  throw new Error(`Workflow alias o ID inválido: ${aliasOrId}`);
};

/**
 * Obtiene el alias de un ID de workflow
 * Si no tiene alias, devuelve el ID como string
 */
export const getWorkflowAlias = (id: number): string => {
  return WORKFLOW_IDS_TO_ALIASES[id] || String(id);
};

/**
 * Verifica si un string es un alias válido
 */
export const isWorkflowAlias = (value: string): boolean => {
  return value in WORKFLOW_ALIASES;
};
