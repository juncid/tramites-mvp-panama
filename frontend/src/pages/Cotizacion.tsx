import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  Button as MuiButton,
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { EtapaInformativa } from '../components/workflow/EtapaInformativa';
import { workflowService } from '../services/workflow.service';
import { ppshService } from '../services/ppsh.service';
import { useAuth } from '../context/AuthContext';

interface CotizacionItem {
  id: string;
  codigo: string;
  descripcion: string;
  precio: number;
  checked: boolean;
}

export const Cotizacion = () => {
  const { id: solicitudId, instanciaId } = useParams<{ id?: string; instanciaId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario } = useAuth();
  const [isReadOnly] = useState(searchParams.get('readonly') === 'true');
  const [loading, setLoading] = useState(false);
  const [etapaId, setEtapaId] = useState<number | null>(null);
  const [workflowInstanciaId, setWorkflowInstanciaId] = useState<number | null>(null);

  const [items, setItems] = useState<CotizacionItem[]>([
    {
      id: '1',
      codigo: '832',
      descripcion: 'Carné de Tramite',
      precio: 50.0,
      checked: true,
    },
    {
      id: '2',
      codigo: '770',
      descripcion: 'Cheque de 250',
      precio: 250.0,
      checked: true,
    },
    {
      id: '3',
      codigo: '520',
      descripcion: 'Cheque de 800',
      precio: 800.0,
      checked: true,
    },
    {
      id: '4',
      codigo: '',
      descripcion: 'Visa Múltiple 6M',
      precio: 50.0,
      checked: false,
    },
  ]);

  const [fecha, setFecha] = useState('');
  const [responsable, setResponsable] = useState('');

  useEffect(() => {
    const loadInstancia = async () => {
      try {
        let wInstanciaId: number | null = null;
        
        // Si tenemos instanciaId directamente, usarlo
        if (instanciaId) {
          wInstanciaId = parseInt(instanciaId);
        } 
        // Si tenemos solicitudId, obtener el instanciaId desde la solicitud
        else if (solicitudId) {
          const solicitud = await ppshService.getSolicitud(parseInt(solicitudId));
          if (solicitud.workflow_instancia_id) {
            wInstanciaId = solicitud.workflow_instancia_id;
          }
        }
        
        // Guardar workflowInstanciaId en el estado
        setWorkflowInstanciaId(wInstanciaId);
        
        // Si tenemos un instanciaId válido, cargar la etapa actual
        if (wInstanciaId) {
          const instancia = await workflowService.getInstancia(wInstanciaId);
          if (instancia.etapa_actual_id) {
            setEtapaId(instancia.etapa_actual_id);
          }
        }
      } catch (error) {
        console.error('Error cargando instancia:', error);
      }
    };
    
    loadInstancia();
  }, [instanciaId, solicitudId]);

  // Datos del caso (hardcoded por ahora, luego vendrán del backend)
  const datosCaso = {
    nombre: 'Nombre Nombre Apellido Apellido',
    nacionalidad: 'Costarricense',
    tramite: 'Permiso de Protección de Seguridad Humanitaria',
  };

  const handleToggleItem = (id: string) => {
    if (!isReadOnly) {
      setItems(items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleGuardar = async () => {
    if (!workflowInstanciaId || !etapaId) {
      alert('Error: No se pudo identificar la instancia o etapa');
      return;
    }

    setLoading(true);
    try {
      const userPerfil = usuario?.perfil || 'FUNCIONARIO';

      // Preparar respuestas con los datos de cotización
      const respuestas = {
        items_cotizacion: items.filter((item) => item.checked).map(item => ({
          codigo: item.codigo,
          descripcion: item.descripcion,
          precio: item.precio
        })),
        fecha_cotizacion: fecha,
        responsable_cotizacion: responsable,
        total: items.filter((item) => item.checked).reduce((sum, item) => sum + item.precio, 0)
      };

      await workflowService.completarEtapa(
        workflowInstanciaId,
        etapaId,
        respuestas,
        userPerfil
      );

      alert('Cotización guardada exitosamente');
      
      // Redirigir a la vista de etapas
      const baseRoute = instanciaId ? `/workflows/${instanciaId}` : `/solicitudes/${solicitudId}`;
      navigate(`${baseRoute}/etapas`);
    } catch (error: any) {
      console.error('Error guardando cotización:', error);
      alert(error.response?.data?.detail || 'Error al guardar la cotización');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    const baseRoute = instanciaId ? `/workflows/${instanciaId}` : `/solicitudes/${solicitudId}`;
    navigate(`${baseRoute}/etapas`);
  };

  const total = items
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.precio, 0);

  return (
    <EtapaInformativa
      headerTitle="Permiso de Protección de Seguridad Humanitaria"
      breadcrumbs={[
        { label: 'Inicio', path: '/' },
        { label: 'Solicitudes' },
        { label: 'Etapas' },
      ]}
      contentTitle="Cotización"
      contentDescription="Lorem ipsum dolor sit amet consectetur. Tristique placerat venenatis iaculis imperdiet in. Venenatis quam cursus ut urna vel a ac iaculis. Volutpat tempus urna nullam aliquam."
      readonly={isReadOnly}
      onCancel={handleCancelar}
      onNext={isReadOnly ? undefined : handleGuardar}
      cancelButtonText="Volver"
      nextButtonText="Guardar"
      nextButtonDisabled={loading}
      customContent={
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Data del caso */}
          <Box>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 500,
              color: '#333333',
              mb: 2,
              fontFamily: 'Roboto',
            }}
          >
            Data del caso
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ fontSize: 16, color: '#4d4d4d', fontFamily: 'Roboto' }}>
              <Box component="span" sx={{ fontWeight: 'bold' }}>
                Nombre:
              </Box>{' '}
              {datosCaso.nombre}
            </Typography>
            <Typography sx={{ fontSize: 16, color: '#4d4d4d', fontFamily: 'Roboto' }}>
              <Box component="span" sx={{ fontWeight: 'bold' }}>
                Nacionalidad:
              </Box>{' '}
              {datosCaso.nacionalidad}
            </Typography>
            <Typography sx={{ fontSize: 16, color: '#4d4d4d', fontFamily: 'Roboto' }}>
              <Box component="span" sx={{ fontWeight: 'bold' }}>
                Tramite:
              </Box>{' '}
              {datosCaso.tramite}
            </Typography>
          </Box>
        </Box>

        {/* Cotización */}
        <Box>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 500,
              color: '#333333',
              mb: 2,
              fontFamily: 'Roboto',
            }}
          >
            Cotización
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 793 }}>
            {items.map((item) => (
              <FormControlLabel
                key={item.id}
                control={
                  <Checkbox
                    checked={item.checked}
                    onChange={() => handleToggleItem(item.id)}
                    disabled={isReadOnly}
                    sx={{
                      color: '#333333',
                      '&.Mui-checked': {
                        color: '#0e5fa6',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 16, color: '#4d4d4d', fontFamily: 'Roboto' }}>
                    {item.codigo && `(${item.codigo})`}
                    {item.descripcion}: B/{item.precio.toFixed(2)}
                  </Typography>
                }
                sx={{ margin: 0 }}
              />
            ))}
          </Box>
        </Box>

        {/* Fecha */}
        <Box sx={{ maxWidth: 520 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 500,
              color: '#333333',
              mb: 1,
              fontFamily: 'Roboto',
            }}
          >
            Fecha
          </Typography>
          <TextField
            fullWidth
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            disabled={isReadOnly}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 56,
                borderRadius: '4px',
                fontFamily: 'Roboto',
                fontSize: 16,
                backgroundColor: '#ffffff',
                '& fieldset': {
                  borderColor: '#d0d0d0',
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
              '& .MuiOutlinedInput-input': {
                padding: '16.5px 14px',
                '&::-webkit-calendar-picker-indicator': {
                  cursor: 'pointer',
                  fontSize: '20px',
                },
              },
            }}
          />
        </Box>

        {/* Responsable */}
        <Box sx={{ maxWidth: 520 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 500,
              color: '#333333',
              mb: 1,
              fontFamily: 'Roboto',
            }}
          >
            Responsable
          </Typography>
          <TextField
            fullWidth
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            disabled={isReadOnly}
            placeholder="Ingrese el nombre del responsable"
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 56,
                borderRadius: '4px',
                fontFamily: 'Roboto',
                fontSize: 16,
                backgroundColor: '#ffffff',
                '& fieldset': {
                  borderColor: '#d0d0d0',
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
              '& .MuiOutlinedInput-input': {
                padding: '16.5px 14px',
              },
            }}
          />
        </Box>

        {/* Botón Imprimir */}
        <Box sx={{ mt: 4, mb: 6 }}>
          <MuiButton
            variant="contained"
            startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
            onClick={handleImprimir}
            sx={{
              backgroundColor: '#0e5fa6',
              color: 'white',
              textTransform: 'none',
              fontSize: 16,
              fontFamily: 'Roboto',
              height: 40,
              borderRadius: '4px',
              paddingX: 2,
              '&:hover': {
                backgroundColor: '#0d5095',
              },
            }}
          >
            Imprimir
          </MuiButton>
        </Box>

        {/* Total (para referencia) */}
        <Box sx={{ display: 'none', '@media print': { display: 'block' } }}>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#333333',
              fontFamily: 'Roboto',
            }}
          >
            Total: B/{total.toFixed(2)}
          </Typography>
        </Box>
      </Box>
      }
    />
  );
};
