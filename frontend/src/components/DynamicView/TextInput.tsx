/**
 * Componente TextInput para vistas dinámicas
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Componente reutilizable para entrada de texto simple o multilínea.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-13
 */

import React from 'react';
import type { Componente } from '../../types/dynamic-view';

interface TextInputProps {
  componente: Componente;
  value: any;
  error?: string;
  onChange: (preguntaId: number, value: any) => void;
}

export const TextInput: React.FC<TextInputProps> = ({ 
  componente, 
  value, 
  error,
  onChange 
}) => {
  const { label, pregunta_id, obligatorio, config } = componente;
  const multiline = config?.multiline || false;
  const placeholder = config?.placeholder || '';
  const maxLength = config?.maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (pregunta_id) {
      onChange(pregunta_id, e.target.value);
    }
  };

  const inputClasses = `
    w-full px-3 py-2 border rounded-md
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
    focus:outline-none focus:ring-2
  `;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {obligatorio && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={4}
          className={inputClasses}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={inputClasses}
        />
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      
      {maxLength && (
        <p className="text-gray-500 text-xs mt-1">
          {(value || '').length}/{maxLength} caracteres
        </p>
      )}
    </div>
  );
};
