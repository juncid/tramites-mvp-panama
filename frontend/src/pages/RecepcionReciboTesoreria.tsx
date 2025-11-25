import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, TextField, Typography, Button } from '@mui/material';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { workflowService } from '../services/workflow.service';
import { ppshService } from '../services/ppsh.service';
import { useAuth } from '../context/AuthContext';

/**
 * Vista 10: Recepción recibo Tesorería
 * 
 * Permite cargar archivo de recibo de tesorería con indicaciones adicionales
 */
export const RecepcionReciboTesoreria = () => {
  const { id: solicitudId, instanciaId } = useParams<{ id?: string; instanciaId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario } = useAuth();
  const readonly = searchParams.get('readonly') === 'true';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);
  const [etapaId, setEtapaId] = useState<number | null>(null);
  const [reciboTesoreria, setReciboTesoreria] = useState('');
  const [archivoRecibo, setArchivoRecibo] = useState<File | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let wInstanciaId: number | null = null;

        if (instanciaId) {
          wInstanciaId = parseInt(instanciaId);
        } else if (solicitudId) {
          const solicitud = await ppshService.getSolicitud(parseInt(solicitudId));
          if (!solicitud.workflow_instancia_id) {
            throw new Error('La solicitud no tiene workflow asociado');
          }
          wInstanciaId = solicitud.workflow_instancia_id;
        }

        setWorkflowInstanciaId(wInstanciaId);

        if (wInstanciaId) {
          const instancia = await workflowService.getInstancia(wInstanciaId);
          if (instancia.etapa_actual_id) {
            setEtapaId(instancia.etapa_actual_id);
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [instanciaId, solicitudId]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArchivoRecibo(file);
    }
  };

  const handleCancelar = () => {
    const baseParam = solicitudId || instanciaId || workflowInstanciaId;
    const basePath = solicitudId ? `/solicitudes/${solicitudId}` : `/workflows/${baseParam}`;
    navigate(`${basePath}/etapas`);
  };

  const handleGuardar = async () => {
    if (!workflowInstanciaId || !etapaId) {
      alert('Error: No se pudo identificar la instancia');
      return;
    }

    setLoading(true);
    try {
      const userPerfil = usuario?.perfil || 'FUNCIONARIO';

      const respuestas = {
        RECIBO_TESORERIA: reciboTesoreria
      };

      // TODO: Implementar subida de archivo si es necesario
      const archivos = archivoRecibo ? {
        ARCHIVO_RECIBO_TESORERIA: archivoRecibo.name
      } : {};

      await workflowService.completarEtapa(
        workflowInstanciaId,
        etapaId,
        respuestas,
        userPerfil
      );

      const baseRoute = instanciaId ? `/workflows/${instanciaId}` : `/solicitudes/${solicitudId}`;
      navigate(`${baseRoute}/etapas`);
    } catch (error: any) {
      console.error('Error al guardar:', error);
      alert(error.response?.data?.detail || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const customContent = (
    <Box>
      {/* Campo Recibo Tesorería */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 500, fontSize: '16px', mb: 1, color: '#333' }}>
          Recibo Tesorería
        </Typography>
        <TextField
          fullWidth
          value={reciboTesoreria}
          onChange={(e) => setReciboTesoreria(e.target.value)}
          disabled={readonly}
          sx={{
            width: '520px',
            '& .MuiOutlinedInput-root': {
              height: 56,
              borderRadius: '4px',
              fontFamily: 'Roboto',
              fontSize: 16,
              backgroundColor: '#ffffff',
              '& fieldset': {
                borderColor: '#333333',
                borderWidth: '1px',
                borderRadius: '4px',
              },
              '&:hover fieldset': {
                borderColor: '#333333',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#0e5fa6',
                borderWidth: '2px',
              },
            },
          }}
        />
      </Box>

      {/* Botón Cargar archivo */}
      <Box sx={{ mb: 1 }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={readonly}
        />
        <Button
          variant="contained"
          onClick={handleFileClick}
          disabled={readonly}
          startIcon={<AttachFileIcon />}
          sx={{
            bgcolor: '#0e5fa6',
            color: 'white',
            textTransform: 'none',
            fontFamily: 'Roboto',
            fontSize: '16px',
            fontWeight: 400,
            borderRadius: '2px',
            height: '32px',
            px: 2,
            '&:hover': {
              bgcolor: '#0a4a80',
            },
            '&.Mui-disabled': {
              bgcolor: '#ccc',
              color: '#666',
            },
          }}
        >
          Cargar archivo
        </Button>
      </Box>

      {/* Indicaciones extra */}
      <Typography sx={{ fontSize: '14px', fontWeight: 300, color: '#333', mb: 2 }}>
        Indicaciones extra
      </Typography>

      {/* Mostrar archivo seleccionado */}
      {archivoRecibo && (
        <Box
          sx={{
            p: 2,
            bgcolor: '#e3f2fd',
            borderRadius: '4px',
            border: '1px solid #1976d2',
            mt: 2,
          }}
        >
          <Typography sx={{ fontSize: '14px', color: '#1976d2', fontWeight: 500 }}>
            Archivo seleccionado
          </Typography>
          <Typography sx={{ fontSize: '16px', color: '#1976d2', mt: 0.5 }}>
            {archivoRecibo.name}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <EtapaInformativa
      headerTitle="Permiso de Protección de Seguridad Humanitaria"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Solicitudes' },
        { label: 'Etapas' },
        { label: 'Recepción recibo Tesorería' },
      ]}
      contentTitle="Recepción recibo Tesorería"
      contentDescription="Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam."
      readonly={readonly}
      onCancel={handleCancelar}
      onNext={readonly ? undefined : handleGuardar}
      cancelButtonText="Cancelar"
      nextButtonText="Guardar"
      loading={loading}
      error={error}
      customContent={customContent}
    />
  );
};
