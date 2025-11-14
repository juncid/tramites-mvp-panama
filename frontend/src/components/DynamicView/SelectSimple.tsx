/**
 * Componente SelectSimple para vistas dinámicas
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Componente reutilizable para selección de opciones desde un dropdown.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-13
 */

import React from 'react';
import type { Componente } from '../../types/dynamic-view';

interface SelectSimpleProps {
  componente: Componente;
  value: any;
  error?: string;
  onChange: (preguntaId: number, value: any) => void;
}

export const SelectSimple: React.FC<SelectSimpleProps> = ({ 
  componente, 
  value, 
  error,
  onChange 
}) => {
  const { label, pregunta_id, obligatorio, config } = componente;
  const opciones = config?.opciones || [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (pregunta_id) {
      // Convertir a número si la opción es numérica
      const selectedValue = e.target.value;
      const opcion = opciones.find(o => String(o.valor) === selectedValue);
      onChange(pregunta_id, opcion?.valor ?? selectedValue);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {obligatorio && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        value={value ?? ''}
        onChange={handleChange}
        className={`
          w-full px-3 py-2 border rounded-md
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          focus:outline-none focus:ring-2
          bg-white
        `}
      >
        <option value="">-- Seleccione una opción --</option>
        {opciones.map((opcion, index) => (
          <option key={index} value={String(opcion.valor)}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};
