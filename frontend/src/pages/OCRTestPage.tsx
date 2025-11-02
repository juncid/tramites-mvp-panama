/**
 * Página de Pruebas OCR
 * Sistema de Trámites Migratorios de Panamá
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material';
import { ocrApi, OCRRequest, OCRStatus, OCRResultado, OCREstadisticas } from '../api/ocrApi';

const OCRTestPage: React.FC = () => {
  // Estado del formulario
  const [idDocumento, setIdDocumento] = useState<string>('');
  const [userId, setUserId] = useState<string>('admin');
  
  // Configuración OCR
  const [config, setConfig] = useState<OCRRequest>({
    idioma: 'spa+eng',
    prioridad: 'normal',
    binarizar: true,
    denoise: true,
    mejorar_contraste: true,
    deskew: true,
    extraer_datos_estructurados: true,
  });

  // Estado del procesamiento
  const [taskId, setTaskId] = useState<string>('');
  const [estado, setEstado] = useState<OCRStatus | null>(null);
  const [resultado, setResultado] = useState<OCRResultado | null>(null);
  const [estadisticas, setEstadisticas] = useState<OCREstadisticas | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [polling, setPolling] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  // Polling del estado
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (polling && taskId) {
      interval = setInterval(async () => {
        try {
          const status = await ocrApi.consultarEstado(taskId);
          setEstado(status);

          // Si terminó, detener polling
          if (status.estado === 'COMPLETADO' || status.estado === 'ERROR' || status.estado === 'CANCELADO') {
            setPolling(false);
            
            // Si completó, obtener resultado
            if (status.estado === 'COMPLETADO' && status.id_documento) {
              const res = await ocrApi.obtenerResultado(status.id_documento);
              setResultado(res);
            }
          }
        } catch (err: any) {
          console.error('Error consultando estado:', err);
          setError(err.response?.data?.detail || err.message);
          setPolling(false);
        }
      }, 2000); // Cada 2 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [polling, taskId]);

  /**
   * Procesar documento
   */
  const handleProcesar = async () => {
    if (!idDocumento) {
      setError('Ingrese un ID de documento');
      return;
    }

    setLoading(true);
    setError('');
    setEstado(null);
    setResultado(null);

    try {
      const response = await ocrApi.procesarDocumento(
        parseInt(idDocumento),
        userId,
        config
      );

      setTaskId(response.task_id);
      setEstado({
        task_id: response.task_id,
        estado: response.estado as any,
        porcentaje_completado: 0,
        mensaje: response.mensaje,
        id_documento: response.id_documento,
      });
      setPolling(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Consultar estado manualmente
   */
  const handleConsultarEstado = async () => {
    if (!taskId) {
      setError('No hay una tarea activa');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const status = await ocrApi.consultarEstado(taskId);
      setEstado(status);

      if (status.estado === 'COMPLETADO' && status.id_documento) {
        const res = await ocrApi.obtenerResultado(status.id_documento);
        setResultado(res);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancelar tarea
   */
  const handleCancelar = async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      await ocrApi.cancelarTarea(taskId);
      setPolling(false);
      setEstado(prev => prev ? { ...prev, estado: 'CANCELADO' } : null);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener estadísticas
   */
  const handleObtenerEstadisticas = async () => {
    setLoading(true);
    try {
      const stats = await ocrApi.obtenerEstadisticas(true);
      setEstadisticas(stats);
      setShowStatsDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener color del chip según estado
   */
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADO': return 'success';
      case 'ERROR': return 'error';
      case 'PROCESANDO': return 'info';
      case 'PENDIENTE': return 'warning';
      case 'CANCELADO': return 'default';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          🔍 Pruebas de Servicio OCR
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sistema de extracción de texto con reconocimiento óptico de caracteres
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Panel de Configuración */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              ⚙️ Configuración
            </Typography>

            <TextField
              fullWidth
              label="ID Documento"
              type="number"
              value={idDocumento}
              onChange={(e) => setIdDocumento(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Ej: 1"
            />

            <TextField
              fullWidth
              label="Usuario"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Idioma</InputLabel>
              <Select
                value={config.idioma}
                label="Idioma"
                onChange={(e) => setConfig({ ...config, idioma: e.target.value })}
              >
                <MenuItem value="spa">Español</MenuItem>
                <MenuItem value="eng">Inglés</MenuItem>
                <MenuItem value="spa+eng">Español + Inglés</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={config.prioridad}
                label="Prioridad"
                onChange={(e) => setConfig({ ...config, prioridad: e.target.value as any })}
              >
                <MenuItem value="baja">Baja</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="alta">Alta</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Preprocesamiento
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={config.binarizar}
                  onChange={(e) => setConfig({ ...config, binarizar: e.target.checked })}
                />
              }
              label="Binarizar"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={config.denoise}
                  onChange={(e) => setConfig({ ...config, denoise: e.target.checked })}
                />
              }
              label="Reducir ruido"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={config.mejorar_contraste}
                  onChange={(e) => setConfig({ ...config, mejorar_contraste: e.target.checked })}
                />
              }
              label="Mejorar contraste"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={config.deskew}
                  onChange={(e) => setConfig({ ...config, deskew: e.target.checked })}
                />
              }
              label="Corrección inclinación"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={config.extraer_datos_estructurados}
                  onChange={(e) => setConfig({ ...config, extraer_datos_estructurados: e.target.checked })}
                />
              }
              label="Extraer datos estructurados"
            />

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleProcesar}
                disabled={loading || polling}
              >
                Procesar Documento
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<StatsIcon />}
                onClick={handleObtenerEstadisticas}
                disabled={loading}
              >
                Ver Estadísticas
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Panel de Estado */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                📊 Estado del Procesamiento
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleConsultarEstado}
                  disabled={!taskId || loading}
                >
                  Actualizar
                </Button>
                {polling && (
                  <Button
                    size="small"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelar}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                )}
              </Stack>
            </Box>

            {estado ? (
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Task ID: {estado.task_id}
                      </Typography>
                      <Chip
                        label={estado.estado}
                        color={getEstadoColor(estado.estado)}
                        size="small"
                      />
                    </Box>

                    {estado.porcentaje_completado !== undefined && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">
                            {estado.mensaje}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {estado.porcentaje_completado}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={estado.porcentaje_completado}
                        />
                      </Box>
                    )}

                    {estado.paso_actual && estado.total_pasos && (
                      <Typography variant="body2" color="text.secondary">
                        Paso {estado.paso_actual} de {estado.total_pasos}
                      </Typography>
                    )}

                    {estado.confianza_promedio && (
                      <Typography variant="body2">
                        Confianza: {estado.confianza_promedio.toFixed(2)}%
                      </Typography>
                    )}

                    {estado.tiempo_procesamiento_ms && (
                      <Typography variant="body2">
                        Tiempo: {(estado.tiempo_procesamiento_ms / 1000).toFixed(2)}s
                      </Typography>
                    )}

                    {estado.codigo_error && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Error:</strong> {estado.codigo_error}
                        </Typography>
                        <Typography variant="caption">
                          {estado.mensaje}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="info">
                Configure los parámetros y presione "Procesar Documento" para iniciar
              </Alert>
            )}
          </Paper>

          {/* Resultado */}
          {resultado && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                ✅ Resultado
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Confianza
                  </Typography>
                  <Typography variant="h6">
                    {typeof resultado.texto_confianza === 'string' 
                      ? parseFloat(resultado.texto_confianza).toFixed(2)
                      : resultado.texto_confianza?.toFixed(2) || 'N/A'}%
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Caracteres
                  </Typography>
                  <Typography variant="h6">
                    {resultado.num_caracteres}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Palabras
                  </Typography>
                  <Typography variant="h6">
                    {resultado.num_palabras}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Tiempo
                  </Typography>
                  <Typography variant="h6">
                    {(resultado.tiempo_procesamiento_ms / 1000).toFixed(2)}s
                  </Typography>
                </Grid>
              </Grid>

              {resultado.datos_estructurados && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>📋 Datos Estructurados</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <pre style={{ overflow: 'auto', fontSize: '12px' }}>
                      {JSON.stringify(
                        typeof resultado.datos_estructurados === 'string'
                          ? JSON.parse(resultado.datos_estructurados)
                          : resultado.datos_estructurados,
                        null,
                        2
                      )}
                    </pre>
                  </AccordionDetails>
                </Accordion>
              )}

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>📄 Texto Extraído</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    value={resultado.texto_extraido}
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                  />
                </AccordionDetails>
              </Accordion>

              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const blob = new Blob([resultado.texto_extraido], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ocr_resultado_${resultado.id_documento}.txt`;
                    a.click();
                  }}
                >
                  Descargar Texto
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Dialog de Estadísticas */}
      <Dialog
        open={showStatsDialog}
        onClose={() => setShowStatsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>📊 Estadísticas del Sistema OCR</DialogTitle>
        <DialogContent>
          {estadisticas ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Total Procesados
                    </Typography>
                    <Typography variant="h4">
                      {estadisticas.total_procesados}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'success.light' }}>
                  <CardContent>
                    <Typography variant="caption">
                      Completados
                    </Typography>
                    <Typography variant="h4">
                      {estadisticas.total_completados}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'error.light' }}>
                  <CardContent>
                    <Typography variant="caption">
                      Errores
                    </Typography>
                    <Typography variant="h4">
                      {estadisticas.total_errores}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'info.light' }}>
                  <CardContent>
                    <Typography variant="caption">
                      Procesando
                    </Typography>
                    <Typography variant="h4">
                      {estadisticas.total_procesando}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'warning.light' }}>
                  <CardContent>
                    <Typography variant="caption">
                      Pendientes
                    </Typography>
                    <Typography variant="h4">
                      {estadisticas.total_pendientes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Confianza Promedio
                    </Typography>
                    <Typography variant="h4">
                      {estadisticas.confianza_promedio?.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Tiempo Promedio de Procesamiento
                    </Typography>
                    <Typography variant="h5">
                      {estadisticas.tiempo_promedio_ms
                        ? (estadisticas.tiempo_promedio_ms / 1000).toFixed(2)
                        : 'N/A'}s
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatsDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OCRTestPage;
