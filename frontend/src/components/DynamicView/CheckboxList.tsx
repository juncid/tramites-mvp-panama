/**
 * CheckboxList Component - Sistema de Vistas Dinámicas
 * Componente para listas de checkboxes (revisión de documentos, tareas)
 * Basado en diseño de Figma
 */

import { useState } from 'react';

interface CheckboxItem {
  id: string;
  label: string;
  disabled?: boolean;
  showIcon?: boolean;
  iconType?: 'download' | 'info';
}

interface CheckboxListProps {
  id: string;
  label?: string;
  items: CheckboxItem[];
  required?: boolean;
  value?: string[];
  onChange: (id: string, value: string[]) => void;
  error?: string;
  showOcrColumn?: boolean;
}

export const CheckboxList: React.FC<CheckboxListProps> = ({
  id,
  label,
  items,
  required = false,
  value = [],
  onChange,
  error,
  showOcrColumn = false
}) => {
  const [checkedItems, setCheckedItems] = useState<string[]>(value);

  const handleToggle = (itemId: string) => {
    const newChecked = checkedItems.includes(itemId)
      ? checkedItems.filter(id => id !== itemId)
      : [...checkedItems, itemId];
    
    setCheckedItems(newChecked);
    onChange(id, newChecked);
  };

  return (
    <div className="mb-4">
      {label && (
        <p className="text-[#333333] text-base font-medium leading-[1.5] mb-4">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </p>
      )}

      {/* Header con columnas OCR y Documento */}
      {showOcrColumn && (
        <>
          <div className="flex mb-2">
            <div className="w-[86px] text-[#333333] text-base font-normal leading-[1.5] pl-4">OCR</div>
            <div className="flex-1 text-[#333333] text-base font-normal leading-[1.5]">Documento</div>
          </div>
          {/* Separador gris grueso */}
          <div className="h-1 bg-[#f3f3f3] mb-0 w-full"></div>
        </>
      )}

      {/* Lista de items */}
      <div className="flex flex-col w-full">
        {items.map((item) => {
          // Calcular altura según longitud del texto
          const isLongText = item.label.length > 90;
          const rowHeight = isLongText ? 'min-h-[64px]' : 'h-[40px]';
          
          return (
            <div
              key={item.id}
              className={`flex items-center bg-white ${rowHeight} ${
                item.disabled ? 'opacity-50' : ''
              } w-full`}
            >
              {/* Columna OCR (checkbox) */}
              {showOcrColumn && (
                <div className="w-[86px] flex items-center justify-start pl-4">
                  <label className="cursor-pointer inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={checkedItems.includes(item.id)}
                      onChange={() => handleToggle(item.id)}
                      disabled={item.disabled}
                      className="w-5 h-5 text-green-600 cursor-pointer border-gray-300 rounded focus:ring-green-500"
                      style={{
                        accentColor: '#10b981'
                      }}
                    />
                  </label>
                </div>
              )}

              {/* Columna Documento */}
              <div className="flex items-center gap-1.5 flex-1 pr-4 py-2">
                {/* Ícono de descarga (20px x 20px) */}
                {item.showIcon && item.iconType === 'download' && (
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="#0e5fa6"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                )}

                {/* Texto del documento */}
                <span className="text-[#333333] text-base font-normal leading-[1.5] flex-1">
                  {item.label}
                </span>

                {/* Ícono de info (16px x 16px) */}
                {item.showIcon && item.iconType === 'info' && (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="#666666"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <path strokeLinecap="round" d="M12 16v-4M12 8h.01"/>
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
