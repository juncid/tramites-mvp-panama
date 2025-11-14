/**
 * Hook personalizado useDynamicView
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Hook para cargar y gestionar configuraciones de vistas dinámicas.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-13
 */

import { useState, useEffect } from 'react';
import { vistaConfigService } from '../services/vista-config.service';
import type { ConfigJson } from '../types/dynamic-view';

interface UseDynamicViewReturn {
  config: ConfigJson | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar configuración de vista por etapa.
 * 
 * @param etapaId - ID de la etapa de workflow
 * @returns Estado de la configuración de vista
 */
export function useDynamicView(etapaId: number | null): UseDynamicViewReturn {
  const [config, setConfig] = useState<ConfigJson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    if (!etapaId) {
      setConfig(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const vistaConfig = await vistaConfigService.getByEtapaId(etapaId);
      
      if (vistaConfig) {
        setConfig(vistaConfig.config_json);
      } else {
        // No hay configuración, usar vista por defecto
        setConfig(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar configuración');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [etapaId]);

  return {
    config,
    loading,
    error,
    refetch: fetchConfig
  };
}

/**
 * Helper para validar estructura de ConfigJson.
 * 
 * @param config - Configuración JSON a validar
 * @returns Resultado de validación con errores si existen
 */
export function validateConfigJson(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    errors.push('Configuración debe ser un objeto');
    return { valid: false, errors };
  }

  if (!Array.isArray(config.secciones)) {
    errors.push('Debe tener array "secciones"');
    return { valid: false, errors };
  }

  config.secciones.forEach((seccion: any, i: number) => {
    if (!seccion.titulo) {
      errors.push(`Sección ${i + 1}: falta título`);
    }
    if (!Array.isArray(seccion.componentes)) {
      errors.push(`Sección ${i + 1}: falta array "componentes"`);
    } else {
      seccion.componentes.forEach((comp: any, j: number) => {
        if (!comp.tipo) {
          errors.push(`Sección ${i + 1}, Componente ${j + 1}: falta tipo`);
        }
        if (!comp.label) {
          errors.push(`Sección ${i + 1}, Componente ${j + 1}: falta label`);
        }
      });
    }
  });

  return { valid: errors.length === 0, errors };
}
