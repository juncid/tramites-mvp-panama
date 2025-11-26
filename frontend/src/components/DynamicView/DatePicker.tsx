/**
 * Componente DatePicker para vistas dinámicas
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Componente reutilizable para selección de fechas.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-13
 */

import React from 'react';
import type { Componente } from '../../types/dynamic-view';

interface DatePickerProps {
  componente: Componente;
  value: any;
  error?: string;
  onChange: (preguntaId: number, value: any) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  componente, 
  value, 
  error,
  onChange 
}) => {
  const { label, pregunta_id, obligatorio, config } = componente;
  const min = config?.min; // Fecha mínima (formato: YYYY-MM-DD)
  const max = config?.max; // Fecha máxima

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (pregunta_id) {
      onChange(pregunta_id, e.target.value);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {obligatorio && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        type="date"
        value={value || ''}
        onChange={handleChange}
        min={min}
        max={max}
        className={`
          w-full px-3 py-2 border rounded-md
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          focus:outline-none focus:ring-2
        `}
      />
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};
