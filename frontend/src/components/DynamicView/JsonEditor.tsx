/**
 * Componente JsonEditor para vistas dinámicas
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Editor simple para crear/modificar configuraciones JSON de vistas dinámicas.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-13
 */

import React, { useState } from 'react';
import { validateConfigJson } from '../../hooks/useDynamicView';
import { TEMPLATES } from '../../templates/vista-templates';
import type { ConfigJson } from '../../types/dynamic-view';

interface JsonEditorProps {
  initialValue?: ConfigJson;
  onSave: (config: ConfigJson) => void;
  onCancel: () => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  initialValue,
  onSave,
  onCancel
}) => {
  const [jsonText, setJsonText] = useState(
    initialValue ? JSON.stringify(initialValue, null, 2) : ''
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Cargar template
  const loadTemplate = (templateName: string) => {
    const template = TEMPLATES[templateName as keyof typeof TEMPLATES];
    if (template) {
      setJsonText(JSON.stringify(template, null, 2));
      setErrors([]);
    }
  };

  // Validar y guardar
  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const validation = validateConfigJson(parsed);
      
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }

      setSaving(true);
      onSave(parsed);
    } catch (err: any) {
      setErrors([`JSON inválido: ${err.message}`]);
    } finally {
      setSaving(false);
    }
  };

  // Formatear JSON
  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setErrors([]);
    } catch (err: any) {
      setErrors([`No se puede formatear: ${err.message}`]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Editor de Vista JSON</h3>
        <p className="text-sm text-gray-600 mt-1">
          Edita la configuración JSON de la vista dinámica
        </p>
      </div>

      {/* Templates */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cargar Template:
        </label>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadTemplate('SOLICITUD_BASICA')}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
          >
            📝 Solicitud Básica
          </button>
          <button
            type="button"
            onClick={() => loadTemplate('REVISION_DOCUMENTOS')}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
          >
            🔍 Revisión
          </button>
          <button
            type="button"
            onClick={() => loadTemplate('APROBACION')}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
          >
            ✅ Aprobación
          </button>
          <button
            type="button"
            onClick={() => loadTemplate('REVISION_REQUISITOS')}
            className="px-3 py-1 bg-white border border-orange-300 rounded hover:bg-orange-50 text-sm"
          >
            📋 Requisitos (Figma)
          </button>
          <button
            type="button"
            onClick={formatJson}
            className="px-3 py-1 bg-blue-50 border border-blue-300 rounded hover:bg-blue-100 text-sm ml-auto"
          >
            ✨ Formatear
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 overflow-auto">
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="w-full h-full font-mono text-sm border border-gray-300 rounded p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`{
  "titulo": "Mi Vista",
  "descripcion": "Descripción...",
  "secciones": [
    {
      "titulo": "Sección 1",
      "componentes": [
        {
          "tipo": "TEXTO",
          "label": "Nombre",
          "pregunta_id": 1,
          "obligatorio": true
        }
      ]
    }
  ]
}`}
        />
      </div>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <h4 className="text-sm font-semibold text-red-800 mb-2">❌ Errores de Validación:</h4>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, i) => (
              <li key={i} className="text-sm text-red-700">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !jsonText.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
};
