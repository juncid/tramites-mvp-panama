/**
 * RadioGroup Component - Sistema de Vistas Dinámicas
 * Componente para grupos de botones de radio (Si/No, opciones múltiples)
 */

import { useState } from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  id: string;
  label: string;
  options: RadioOption[];
  required?: boolean;
  value?: string;
  onChange: (id: string, value: string) => void;
  error?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  label,
  options,
  required = false,
  value,
  onChange,
  error
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(value || '');

  const handleChange = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange(id, optionValue);
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-800 font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => handleChange(option.value)}
              className="w-4 h-4 text-blue-600 cursor-pointer"
            />
            <span className="text-gray-800 text-base">
              {option.label}
            </span>
          </label>
        ))}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
