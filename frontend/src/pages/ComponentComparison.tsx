import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Stack,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import { CloudUpload as UploadIcon, Add as AddIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import {
  IndicacionesField,
  CargaArchivoFields,
  CargaArchivoConPreguntaFields,
  OpcionesFields,
  RespuestaTextoFields,
} from '../components/Workflow/PreguntaFields';
import type { WorkflowPregunta } from '../types/workflow';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const ComponentComparison: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [preguntaDemo, setPreguntaDemo] = useState<WorkflowPregunta>({
    codigo: 'PREGUNTA_1',
    texto: '',
    pregunta: '',
    tipo: 'CARGA_ARCHIVO',
    tipo_pregunta: 'CARGA_ARCHIVO',
    orden: 0,
    es_obligatoria: false,
    es_visible: true,
    activo: true,
    ayuda: '',
    max_archivos: 1,
    max_size_mb: 100,
  });

  const handleChange = (field: keyof WorkflowPregunta, value: any) => {
    setPreguntaDemo((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Comparación de Componentes: WorkflowEditor vs WorkflowEditorFigma
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Esta página muestra los componentes reutilizables extraídos de <strong>EtapaConfigPanel</strong> que 
        usa el WorkflowEditor normal. Estos mismos componentes ahora se usan en WorkflowEditorFigma.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="IndicacionesField" />
          <Tab label="CargaArchivoFields" />
          <Tab label="CargaArchivoConPreguntaFields" />
          <Tab label="OpcionesFields" />
          <Tab label="RespuestaTextoFields" />
        </Tabs>
      </Box>

      {/* Tab 1: IndicacionesField */}
      <TabPanel value={tabValue} index={0}>
        <Stack direction="row" spacing={4}>
          <Paper sx={{ flex: 1, p: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#0e5fa6', mb: 3 }}>
              Componente: <code>IndicacionesField</code>
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Campo de Indicaciones con texto de ayuda pegado usando <code>variant="caption"</code> y <code>mt: 0.5</code>
            </Typography>
            <Stack spacing={3}>
              <IndicacionesField
                value={preguntaDemo.ayuda || ''}
                onChange={(value) => handleChange('ayuda', value)}
              />
            </Stack>
          </Paper>

          <Paper sx={{ flex: 1, p: 3, bgcolor: '#fff3e0' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#e65100', mb: 3 }}>
              Descripción
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Ubicación:</strong> <code>frontend/src/components/Workflow/PreguntaFields.tsx</code>
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Usado en:</strong>
              <br />• WorkflowEditorFigma para tipos OPCIONES y RESPUESTA_TEXTO
              <br />• EtapaConfigPanel (WorkflowEditor normal)
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Props:</strong>
              <br />• <code>value: string</code>
              <br />• <code>onChange: (value: string) =&gt; void</code>
            </Typography>
            <Typography variant="body2">
              <strong>Características:</strong>
              <br />• TextField multiline (2 filas)
              <br />• Placeholder: "Documento apostillado lorem ipsum"
              <br />• Texto de ayuda con <code>variant="caption"</code>
              <br />• Gap de 4px entre campo y texto (mt: 0.5)
              <br />• Color gris (#788093) para texto de ayuda
              <br />• Font weight 300 (Roboto Light)
            </Typography>
          </Paper>
        </Stack>
      </TabPanel>

      {/* Tab 2: CargaArchivoFields */}
      <TabPanel value={tabValue} index={1}>
        <Stack direction="row" spacing={4}>
          <Paper sx={{ flex: 1, p: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#0e5fa6', mb: 3 }}>
              Componente: <code>CargaArchivoFields</code>
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Campos para CARGA_ARCHIVO cuando <strong>NO</strong> hay pregunta configurada
            </Typography>
            <Stack spacing={5}>
              <CargaArchivoFields
                pregunta={preguntaDemo}
                onChange={(field, value) => handleChange(field, value)}
              />
            </Stack>
          </Paper>

          <Paper sx={{ flex: 1, p: 3, bgcolor: '#fff3e0' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#e65100', mb: 3 }}>
              Descripción
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Ubicación:</strong> <code>frontend/src/components/Workflow/PreguntaFields.tsx</code>
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Usado en:</strong>
              <br />• WorkflowEditorFigma cuando tipo === 'CARGA_ARCHIVO' && !pregunta
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Props:</strong>
              <br />• <code>pregunta: WorkflowPregunta</code>
              <br />• <code>onChange: (field, value) =&gt; void</code>
              <br />• <code>uploadedFileName?: string</code>
              <br />• <code>onFileUpload?: (fileName) =&gt; void</code>
            </Typography>
            <Typography variant="body2">
              <strong>Incluye:</strong>
              <br />• Campo "Pregunta"
              <br />• Campo "Descripción" (multiline 3 filas)
              <br />• Texto "Información adicional opcional"
              <br />• Campo "Documento"
              <br />• Botón "Cargar archivo" con icono
              <br />• Texto de ayuda pegado al botón
            </Typography>
          </Paper>
        </Stack>
      </TabPanel>

      {/* Tab 3: CargaArchivoConPreguntaFields */}
      <TabPanel value={tabValue} index={2}>
        <Stack direction="row" spacing={4}>
          <Paper sx={{ flex: 1, p: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#0e5fa6', mb: 3 }}>
              Componente: <code>CargaArchivoConPreguntaFields</code>
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Campos completos para CARGA_ARCHIVO cuando <strong>SÍ</strong> hay pregunta configurada
            </Typography>
            <Stack spacing={5}>
              <CargaArchivoConPreguntaFields
                pregunta={preguntaDemo}
                onChange={(field, value) => handleChange(field, value)}
              />
            </Stack>
          </Paper>

          <Paper sx={{ flex: 1, p: 3, bgcolor: '#fff3e0' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#e65100', mb: 3 }}>
              Descripción
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Ubicación:</strong> <code>frontend/src/components/Workflow/PreguntaFields.tsx</code>
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Usado en:</strong>
              <br />• WorkflowEditorFigma cuando tipo === 'CARGA_ARCHIVO' && pregunta existe
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Props:</strong>
              <br />• <code>pregunta: WorkflowPregunta</code>
              <br />• <code>onChange: (field, value) =&gt; void</code>
              <br />• <code>uploadedFileName?: string</code>
              <br />• <code>onFileUpload?: (fileName) =&gt; void</code>
            </Typography>
            <Typography variant="body2">
              <strong>Incluye:</strong>
              <br />• IndicacionesField (reutilizado)
              <br />• Select "Número máximo de archivos" (1, 2, 3, 5, 10)
              <br />• Select "Tamaño máximo" (10MB, 25MB, 50MB, 100MB, 200MB)
              <br />• Campo "Documento" (disabled)
              <br />• Botón "Cargar archivo" con input file oculto
              <br />• Texto de ayuda pegado debajo del botón
            </Typography>
          </Paper>
        </Stack>
      </TabPanel>

      {/* Tab 4: OpcionesFields */}
      <TabPanel value={tabValue} index={3}>
        <Stack direction="row" spacing={4}>
          <Paper sx={{ flex: 1, p: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#0e5fa6', mb: 3 }}>
              Componente: <code>OpcionesFields</code>
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Campos para tipo de pregunta OPCIONES
            </Typography>
            <Stack spacing={5}>
              <OpcionesFields
                pregunta={preguntaDemo}
                onChange={(field, value) => handleChange(field, value)}
              />
            </Stack>
          </Paper>

          <Paper sx={{ flex: 1, p: 3, bgcolor: '#fff3e0' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#e65100', mb: 3 }}>
              Descripción
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Ubicación:</strong> <code>frontend/src/components/Workflow/PreguntaFields.tsx</code>
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Usado en:</strong>
              <br />• WorkflowEditorFigma cuando tipo === 'OPCIONES'
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Props:</strong>
              <br />• <code>pregunta: WorkflowPregunta</code>
              <br />• <code>onChange: (field, value) =&gt; void</code>
            </Typography>
            <Typography variant="body2">
              <strong>Incluye:</strong>
              <br />• IndicacionesField (reutilizado)
              <br />• Campo "Opción 1" (placeholder: "Sí")
              <br />• Campo "Opción 2" (placeholder: "No")
              <br />• Botón "Añadir opción" (text button con icono +)
            </Typography>
          </Paper>
        </Stack>
      </TabPanel>

      {/* Tab 5: RespuestaTextoFields */}
      <TabPanel value={tabValue} index={4}>
        <Stack direction="row" spacing={4}>
          <Paper sx={{ flex: 1, p: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#0e5fa6', mb: 3 }}>
              Componente: <code>RespuestaTextoFields</code>
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Campos para tipo de pregunta RESPUESTA_TEXTO
            </Typography>
            <Stack spacing={5}>
              <RespuestaTextoFields
                pregunta={preguntaDemo}
                onChange={(field, value) => handleChange(field, value)}
              />
            </Stack>
          </Paper>

          <Paper sx={{ flex: 1, p: 3, bgcolor: '#fff3e0' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#e65100', mb: 3 }}>
              Descripción
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Ubicación:</strong> <code>frontend/src/components/Workflow/PreguntaFields.tsx</code>
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Usado en:</strong>
              <br />• WorkflowEditorFigma cuando tipo === 'RESPUESTA_TEXTO'
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Props:</strong>
              <br />• <code>pregunta: WorkflowPregunta</code>
              <br />• <code>onChange: (field, value) =&gt; void</code>
            </Typography>
            <Typography variant="body2">
              <strong>Incluye:</strong>
              <br />• IndicacionesField (reutilizado)
              <br />• Es el componente más simple, solo muestra las indicaciones
            </Typography>
          </Paper>
        </Stack>
      </TabPanel>

      {/* Resumen Final */}
      <Paper sx={{ mt: 4, p: 3, bgcolor: '#e3f2fd' }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#0d47a1', fontWeight: 600 }}>
          📋 Resumen de Implementación
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ mt: 2 }}>
          <strong>Archivo de Componentes:</strong> <code>/frontend/src/components/Workflow/PreguntaFields.tsx</code>
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Usado en WorkflowEditorFigma:</strong>
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li><code>IndicacionesField</code> - Base para todos los campos con texto de ayuda</li>
          <li><code>CargaArchivoFields</code> - Cuando tipo === 'CARGA_ARCHIVO' && !pregunta</li>
          <li><code>CargaArchivoConPreguntaFields</code> - Cuando tipo === 'CARGA_ARCHIVO' && pregunta</li>
          <li><code>OpcionesFields</code> - Cuando tipo === 'OPCIONES'</li>
          <li><code>RespuestaTextoFields</code> - Cuando tipo === 'RESPUESTA_TEXTO'</li>
        </Box>

        <Typography variant="body1" paragraph sx={{ mt: 2 }}>
          <strong>Características clave:</strong>
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>Extraídos directamente de <code>EtapaConfigPanel.tsx</code> (WorkflowEditor normal)</li>
          <li>Usan <code>variant="caption"</code> para textos de ayuda</li>
          <li>Gap de 4px (mt: 0.5) entre campo y texto de ayuda</li>
          <li>Estilos pixel-perfect de Figma aplicados</li>
          <li>Completamente reutilizables entre WorkflowEditor y WorkflowEditorFigma</li>
        </Box>

        <Typography variant="body1" sx={{ mt: 2, fontWeight: 600, color: '#0d47a1' }}>
          ✅ Todos estos componentes están activos en WorkflowEditorFigma
        </Typography>
      </Paper>
    </Container>
  );
};

export default ComponentComparison;
