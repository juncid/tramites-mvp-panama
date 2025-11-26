/**
 * Componente FileUpload para vistas dinámicas
 * Sistema de Trámites Migratorios de Panamá
 * 
 * Componente reutilizable para carga de archivos con validación
 * de tipo y tamaño. Soporta procesamiento OCR cuando está configurado.
 * 
 * @author Sistema de Trámites MVP Panamá
 * @date 2025-11-13
 */

import React, { useRef, useState } from 'react';
import type { Componente } from '../../types/dynamic-view';
import { OCRLoadingModal } from '../PPSH/OCRLoadingModal';
import { OCRResultModal } from '../PPSH/OCRResultModal';

interface FileUploadProps {
  componente: Componente;
  value: any; // Array de archivos o IDs
  error?: string;
  onChange: (preguntaId: number, value: any) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  componente, 
  value, 
  error,
  onChange 
}) => {
  const { label, pregunta_id, obligatorio, config } = componente;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [ocrResult, setOcrResult] = useState<'success' | 'error'>('success');
  
  const tiposPermitidos = config?.tipos_permitidos || [];
  const maxSizeMB = config?.max_size_mb || 10;
  const maxArchivos = config?.max_archivos || 1;
  const requiereOCR = config?.requiere_ocr || false;
  
  const archivos = Array.isArray(value) ? value : [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (archivos.length + files.length > maxArchivos) {
      alert(`Máximo ${maxArchivos} archivo(s) permitido(s)`);
      return;
    }

    // Validar tipo y tamaño
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (tiposPermitidos.length > 0 && ext && !tiposPermitidos.includes(ext)) {
        alert(`Tipo de archivo no permitido: ${ext}. Permitidos: ${tiposPermitidos.join(', ')}`);
        return;
      }
      
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Archivo muy grande: ${file.name}. Máximo: ${maxSizeMB} MB`);
        return;
      }
    }

    // Si requiere OCR, procesar con modales
    if (requiereOCR && files.length > 0) {
      await processOCR(files);
    } else {
      // Subida normal sin OCR
      await uploadFiles(files);
    }
  };

  const processOCR = async (files: File[]) => {
    setIsLoadingOCR(true);

    // Simular procesamiento OCR (2-3 segundos)
    await new Promise(resolve => setTimeout(resolve, 2500));

    setIsLoadingOCR(false);

    // Simular resultado aleatorio (80% éxito, 20% error)
    const success = Math.random() > 0.2;
    setOcrResult(success ? 'success' : 'error');
    setShowResult(true);

    if (success) {
      // Si OCR exitoso, guardar archivos
      await uploadFiles(files);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    try {
      // TODO: Implementar upload real
      const nuevosArchivos = files.map(f => ({
        nombre: f.name,
        size: f.size,
        uploaded_at: new Date().toISOString()
      }));
      
      if (pregunta_id) {
        onChange(pregunta_id, [...archivos, ...nuevosArchivos]);
      }
    } catch (err) {
      alert('Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    if (pregunta_id) {
      const nuevos = archivos.filter((_: any, i: number) => i !== index);
      onChange(pregunta_id, nuevos);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {obligatorio && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="space-y-2">
        {/* Lista de archivos */}
        {archivos.length > 0 && (
          <div className="space-y-1">
            {archivos.map((archivo: any, index: number) => (
              <div 
                key={index} 
                className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
              >
                <span className="text-sm text-gray-700 truncate flex-1">
                  📄 {archivo.nombre || archivo}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input de archivo */}
        {archivos.length < maxArchivos && (
          <>
            <input
              ref={inputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept={tiposPermitidos.map(t => `.${t}`).join(',')}
              multiple={maxArchivos > 1}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={`
                w-full px-4 py-2 border-2 border-dashed rounded-md
                ${uploading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}
                ${error ? 'border-red-300' : 'border-gray-300'}
                text-sm text-gray-600
              `}
            >
              {uploading ? '⏳ Subiendo...' : '📎 Seleccionar archivo(s)'}
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {/* Ayuda */}
      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
        {tiposPermitidos.length > 0 && (
          <p>Tipos permitidos: {tiposPermitidos.join(', ')}</p>
        )}
        <p>Tamaño máximo: {maxSizeMB} MB por archivo</p>
        {maxArchivos > 1 && <p>Máximo {maxArchivos} archivos</p>}
        {requiereOCR && <p className="text-blue-600 font-medium">✓ Con validación OCR</p>}
      </div>

      {/* Modales de OCR */}
      <OCRLoadingModal open={isLoadingOCR} />

      <OCRResultModal
        open={showResult}
        tipo={ocrResult}
        onClose={handleCloseResult}
      />
    </div>
  );
};
