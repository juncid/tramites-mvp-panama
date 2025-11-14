import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import { JsonEditor } from '../DynamicView/JsonEditor';
import { DynamicRenderer } from '../DynamicView/DynamicRenderer';
import { useDynamicView } from '../../hooks/useDynamicView';
import { vistaConfigService } from '../../services/vista-config.service';
import type { ConfigJson, FormData } from '../../types/dynamic-view';

interface VistaConfiguratorPanelProps {
  etapaId?: number;
  onSave?: () => void;
}

export const VistaConfiguratorPanel: React.FC<VistaConfiguratorPanelProps> = ({
  etapaId,
  onSave,
}) => {
  const { config: existingConfig, loading: loadingConfig } = useDynamicView(etapaId || null);
  const [config, setConfig] = useState<ConfigJson | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (existingConfig) {
      setConfig(existingConfig);
    }
  }, [existingConfig]);

  const handleSaveConfig = async (newConfig: ConfigJson) => {
    if (!etapaId) {
      setError('La etapa debe ser guardada primero');
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      await vistaConfigService.createOrUpdate(etapaId, newConfig);

      setConfig(newConfig);
      setEditMode(false);
      setSuccess('Vista dinámica guardada exitosamente');
      onSave?.();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error guardando vista dinámica:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar la vista dinámica');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setError(null);
  };

  const handlePreviewSubmit = (data: FormData) => {
    console.log('Preview form data:', data);
    setPreviewOpen(false);
  };

  if (!etapaId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Guardar etapa primero</strong>
          </Typography>
          <Typography variant="caption">
            La etapa debe ser guardada antes de configurar una vista dinámica.
            Haz clic en "Guardar" en la parte inferior para crear la etapa.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (loadingConfig) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Cargando configuración...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Modo edición
  if (editMode) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          Editar Vista Dinámica
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <JsonEditor
            initialValue={config || undefined}
            onSave={handleSaveConfig}
            onCancel={handleCancel}
          />
        </Box>
      </Box>
    );
  }

  // Modo vista
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header con información */}
      <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            🎨 Vista Dinámica
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID de Etapa: {etapaId} | {config ? 'Configuración activa' : 'Sin configurar'}
          </Typography>
        </Stack>
      </Box>

      {/* Mensajes de estado */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2, mb: 0 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ m: 2, mb: 0 }}>
          {success}
        </Alert>
      )}

      {/* Contenido principal */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {config ? (
          <Stack spacing={2}>
            <Alert severity="success" sx={{ alignItems: 'center' }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">
                  ✓ Vista dinámica configurada
                </Typography>
                <Typography variant="caption">
                  Esta etapa usa un formulario personalizado con {config.secciones?.length || 0} sección(es).
                </Typography>
              </Stack>
            </Alert>

            {/* Resumen de configuración */}
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Resumen de configuración:
              </Typography>
              {config.secciones?.map((seccion, i) => (
                <Typography key={i} variant="caption" display="block" color="text.secondary">
                  • {seccion.titulo}: {seccion.componentes?.length || 0} componentes
                </Typography>
              ))}
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={() => setPreviewOpen(true)}
                fullWidth
              >
                Vista Previa
              </Button>
              <Button
                variant="contained"
                onClick={() => setEditMode(true)}
                fullWidth
              >
                Editar
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No hay vista dinámica configurada
            </Typography>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Crea una configuración personalizada para esta etapa
            </Typography>
            <Button
              variant="contained"
              onClick={() => setEditMode(true)}
              sx={{ mt: 2 }}
            >
              Crear Vista Dinámica
            </Button>
          </Stack>
        )}
      </Box>

      {/* Dialog de Vista Previa */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Vista Previa del Formulario
          <Typography variant="caption" display="block" color="text.secondary">
            Así se verá el formulario para los usuarios
          </Typography>
        </DialogTitle>
        <DialogContent>
          {config && (
            <Box sx={{ py: 2 }}>
              <DynamicRenderer
                config={config}
                onSubmit={handlePreviewSubmit}
                onCancel={() => setPreviewOpen(false)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VistaConfiguratorPanel;
