/**
 * Componente NumberInput para vistas dinámicas
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Componente reutilizable para entrada numérica con validación de rango.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-13
 */

import React from 'react';
import type { Componente } from '../../types/dynamic-view';

interface NumberInputProps {
  componente: Componente;
  value: any;
  error?: string;
  onChange: (preguntaId: number, value: any) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({ 
  componente, 
  value, 
  error,
  onChange 
}) => {
  const { label, pregunta_id, obligatorio, config } = componente;
  const min = config?.min;
  const max = config?.max;
  const step = config?.step || 1;
  const placeholder = config?.placeholder || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (pregunta_id) {
      const numValue = e.target.value === '' ? null : parseFloat(e.target.value);
      onChange(pregunta_id, numValue);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {obligatorio && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        type="number"
        value={value ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`
          w-full px-3 py-2 border rounded-md
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          focus:outline-none focus:ring-2
        `}
      />
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      
      {(min !== undefined || max !== undefined) && (
        <p className="text-gray-500 text-xs mt-1">
          {min !== undefined && max !== undefined && `Rango: ${min} - ${max}`}
          {min !== undefined && max === undefined && `Mínimo: ${min}`}
          {min === undefined && max !== undefined && `Máximo: ${max}`}
        </p>
      )}
    </div>
  );
};
