/**
 * Componente DynamicRenderer
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Componente orquestador que renderiza vistas dinámicas completas
 * basadas en configuraciones JSON.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-13
 */

import React, { useState, useEffect } from 'react';
import type { ConfigJson, FormData, FormErrors, Componente } from '../../types/dynamic-view';
import { TextInput, NumberInput, DatePicker, SelectSimple, FileUpload, RadioGroup, CheckboxList } from './index';

// Tipo para valores de formulario
type FormValue = string | number | boolean | string[] | Record<string, unknown> | null | undefined;

interface DynamicRendererProps {
  config: ConfigJson;
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
  onCancel?: () => void;
}

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({
  config,
  initialData = {},
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Actualizar cuando cambian los datos iniciales
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Handler genérico para cambios
  const handleChange = (preguntaId: number, value: FormValue) => {
    setFormData(prev => ({
      ...prev,
      [preguntaId]: value
    }));
    
    // Limpiar error si existía
    if (errors[preguntaId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[preguntaId];
        return newErrors;
      });
    }
  };

  // Validación
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    config.secciones.forEach(seccion => {
      seccion.componentes.forEach(componente => {
        if (componente.obligatorio && componente.pregunta_id) {
          const value = formData[componente.pregunta_id];
          
          // Validar campo obligatorio
          if (value === null || value === undefined || value === '') {
            newErrors[componente.pregunta_id] = 'Campo obligatorio';
          }
          
          // Validación específica por tipo
          if (componente.tipo === 'NUMERO' && value !== null && value !== undefined && value !== '') {
            const num = Number(value);
            if (isNaN(num)) {
              newErrors[componente.pregunta_id] = 'Debe ser un número válido';
            } else {
              if (componente.config?.min !== undefined && num < componente.config.min) {
                newErrors[componente.pregunta_id] = `Mínimo: ${componente.config.min}`;
              }
              if (componente.config?.max !== undefined && num > componente.config.max) {
                newErrors[componente.pregunta_id] = `Máximo: ${componente.config.max}`;
              }
            }
          }
          
          // Validación de archivos
          if (componente.tipo === 'ARCHIVO' && Array.isArray(value) && value.length === 0) {
            newErrors[componente.pregunta_id] = 'Debe subir al menos un archivo';
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      alert('Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  // Renderizar componente según tipo
  const renderComponente = (componente: Componente) => {
    const commonProps = {
      componente,
      value: componente.pregunta_id ? formData[componente.pregunta_id] : undefined,
      error: componente.pregunta_id ? errors[componente.pregunta_id] : undefined,
      onChange: handleChange
    };

    switch (componente.tipo) {
      case 'TEXTO':
        return <TextInput key={componente.pregunta_id} {...commonProps} />;
      case 'NUMERO':
        return <NumberInput key={componente.pregunta_id} {...commonProps} />;
      case 'FECHA':
        return <DatePicker key={componente.pregunta_id} {...commonProps} />;
      case 'SELECT':
        return <SelectSimple key={componente.pregunta_id} {...commonProps} />;
      case 'ARCHIVO':
        return <FileUpload key={componente.pregunta_id} {...commonProps} />;
      case 'RADIO':
        return (
          <RadioGroup
            key={componente.pregunta_id}
            id={String(componente.pregunta_id)}
            label={componente.label}
            options={componente.config?.opciones?.map((op: { valor: string | number; etiqueta: string }) => ({
              value: String(op.valor),
              label: op.etiqueta
            })) || []}
            required={componente.obligatorio}
            value={commonProps.value}
            onChange={(_id: string, value: string) => handleChange(componente.pregunta_id!, value)}
            error={commonProps.error}
          />
        );
      case 'CHECKBOX_LIST':
        return (
          <CheckboxList
            key={componente.pregunta_id}
            id={String(componente.pregunta_id)}
            label={componente.label}
            items={componente.config?.items || []}
            required={componente.obligatorio}
            value={commonProps.value}
            onChange={(_id: string, value: string[]) => handleChange(componente.pregunta_id!, value)}
            error={commonProps.error}
            showOcrColumn={componente.config?.showOcrColumn}
          />
        );
      default:
        return (
          <div key={componente.pregunta_id} className="text-red-500 p-2 border border-red-300 rounded">
            ⚠️ Tipo de componente no soportado: {componente.tipo}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      {/* Título y descripción */}
      {config.titulo && (
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{config.titulo}</h2>
      )}
      {config.descripcion && (
        <p className="text-gray-600 mb-6">{config.descripcion}</p>
      )}

      {/* Secciones */}
      {config.secciones.map((seccion, index) => (
        <div key={index} className="mb-8 last:mb-0">
          <div className="border-l-4 border-blue-500 pl-4 mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{seccion.titulo}</h3>
            {seccion.descripcion && (
              <p className="text-sm text-gray-600 mt-1">{seccion.descripcion}</p>
            )}
          </div>
          
          <div className="space-y-3 pl-4">
            {seccion.componentes.map(componente => renderComponente(componente))}
          </div>
        </div>
      ))}

      {/* Acciones */}
      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};
