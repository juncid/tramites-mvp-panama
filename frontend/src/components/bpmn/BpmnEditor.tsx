import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

// Tipos básicos para bpmn-js (ya que no hay tipos oficiales)
interface BpmnCanvas {
  zoom(level?: number | string): number;
}

interface CommandStack {
  undo(): void;
  redo(): void;
}

interface BpmnEditorProps {
  initialDiagram?: string;
  onSave?: (xml: string) => void;
  onChange?: (xml: string) => void;
  readOnly?: boolean;
}

export type { BpmnEditorProps };

const BpmnEditor: React.FC<BpmnEditorProps> = ({
  initialDiagram,
  onSave,
  onChange,
  // readOnly = false, // TODO: Implementar modo solo lectura
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnModeler | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const [currentXml, setCurrentXml] = useState<string>('');

  // BPMN XML template inicial - diagrama vacío para empezar desde cero
  const initialBpmnXml = useMemo(() => `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`, []);

  // Usar ref para el callback para evitar recrear el modeler
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);

  // Actualizar las refs cuando cambien las props
  useEffect(() => {
    onChangeRef.current = onChange;
    onSaveRef.current = onSave;
  }, [onChange, onSave]);

  // Usar useCallback sin dependencias para estabilidad
  const handleDiagramChange = useCallback((xml: string) => {
    setCurrentXml(xml);
    onChangeRef.current?.(xml);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !propertiesPanelRef.current) return;

    // Pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      initializeModeler();
    }, 100);

    function initializeModeler() {
      if (!containerRef.current || !propertiesPanelRef.current) {
        console.error('Container or properties panel not ready');
        return;
      }

      console.log('Initializing BPMN Modeler...');

      // Crear instancia del modeler con configuración básica
      const modeler = new BpmnModeler({
        container: containerRef.current,
        propertiesPanel: {
          parent: propertiesPanelRef.current,
        },
      });

      modelerRef.current = modeler;
      console.log('BpmnModeler created successfully');

      // Cargar diagrama inicial
      const xmlToLoad = initialDiagram || initialBpmnXml;
      console.log('Loading initial diagram:', xmlToLoad.substring(0, 200) + '...');

      modeler.importXML(xmlToLoad).then(({ warnings }) => {
        console.log('Diagram imported successfully');
        if (warnings.length) {
          console.warn('Warnings during import:', warnings);
        }

        // Ajustar zoom para ver todo el diagrama
        const canvas = modeler.get('canvas') as BpmnCanvas;
        canvas.zoom('fit-viewport');
        console.log('Zoom adjusted to fit viewport');

        // Obtener XML inicial
        modeler.saveXML({ format: true }).then(({ xml }) => {
          setCurrentXml(xml || '');
          console.log('Initial XML saved');
        });
      }).catch((err) => {
        console.error('Error importing BPMN diagram:', err);
        setSnackbar({
          open: true,
          message: 'Error al cargar el diagrama BPMN',
          severity: 'error',
        });
      });

      // Escuchar cambios
      modeler.on('commandStack.changed', () => {
        console.log('Command stack changed - diagram modified');
        modeler.saveXML({ format: true }).then(({ xml }) => {
          const newXml = xml || '';
          handleDiagramChange(newXml);
        });
      });

      // Verificar que el modeler esté listo para edición
      setTimeout(() => {
        console.log('Modeler ready for editing');
        console.log('Container dimensions:', containerRef.current?.clientWidth, 'x', containerRef.current?.clientHeight);
      }, 500);
    }

    return () => {
      clearTimeout(timer);
      if (modelerRef.current) {
        modelerRef.current.destroy();
      }
    };
  }, [initialDiagram]); // Solo depender de initialDiagram

  const handleSave = async () => {
    if (!modelerRef.current) return;

    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      if (xml) {
        onSaveRef.current?.(xml);
        setSnackbar({
          open: true,
          message: 'Diagrama guardado exitosamente',
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Error saving BPMN diagram:', error);
      setSnackbar({
        open: true,
        message: 'Error al guardar el diagrama',
        severity: 'error',
      });
    }
  };

  const handleDownload = async () => {
    if (!modelerRef.current && !currentXml) return;

    try {
      let xmlToDownload = currentXml;

      if (!xmlToDownload && modelerRef.current) {
        const { xml } = await modelerRef.current.saveXML({ format: true });
        xmlToDownload = xml || '';
      }

      if (xmlToDownload) {
        const blob = new Blob([xmlToDownload], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.bpmn';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSnackbar({
          open: true,
          message: 'Diagrama descargado',
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Error downloading BPMN diagram:', error);
      setSnackbar({
        open: true,
        message: 'Error al descargar el diagrama',
        severity: 'error',
      });
    }
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !modelerRef.current) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const xml = e.target?.result as string;
      try {
        await modelerRef.current!.importXML(xml);
        const canvas = modelerRef.current!.get('canvas') as BpmnCanvas;
        canvas.zoom('fit-viewport');

        setSnackbar({
          open: true,
          message: 'Diagrama cargado exitosamente',
          severity: 'success',
        });
      } catch (error) {
        console.error('Error importing BPMN file:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar el archivo BPMN',
          severity: 'error',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleUndo = () => {
    if (modelerRef.current) {
      const commandStack = modelerRef.current.get('commandStack') as CommandStack;
      commandStack.undo();
    }
  };

  const handleRedo = () => {
    if (modelerRef.current) {
      const commandStack = modelerRef.current.get('commandStack') as CommandStack;
      commandStack.redo();
    }
  };

  const handleZoomIn = () => {
    if (modelerRef.current) {
      const canvas = modelerRef.current.get('canvas') as BpmnCanvas;
      canvas.zoom(canvas.zoom() * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (modelerRef.current) {
      const canvas = modelerRef.current.get('canvas') as BpmnCanvas;
      canvas.zoom(canvas.zoom() / 1.2);
    }
  };

  const handleZoomFit = () => {
    if (modelerRef.current) {
      const canvas = modelerRef.current.get('canvas') as BpmnCanvas;
      canvas.zoom('fit-viewport');
    }
  };

  const menuItems = [
    { text: 'Guardar', icon: <SaveIcon />, action: handleSave },
    { text: 'Descargar BPMN', icon: <DownloadIcon />, action: handleDownload },
    {
      text: 'Cargar BPMN',
      icon: <UploadIcon />,
      action: () => document.getElementById('bpmn-file-input')?.click()
    },
    { text: 'Deshacer', icon: <UndoIcon />, action: handleUndo },
    { text: 'Rehacer', icon: <RedoIcon />, action: handleRedo },
    { text: 'Zoom In', icon: <ZoomInIcon />, action: handleZoomIn },
    { text: 'Zoom Out', icon: <ZoomOutIcon />, action: handleZoomOut },
    { text: 'Ajustar Zoom', icon: <PlayIcon />, action: handleZoomFit },
  ];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Bar */}
      <AppBar position="static" color="primary" className="bpmn-header">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setIsDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <SettingsIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Editor BPMN - Flujos de Trámites
          </Typography>
          <Button
            color="inherit"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ mr: 1 }}
          >
            Guardar
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex' }}>
        {/* BPMN Canvas */}
        <Box
          ref={containerRef}
          className="bpmn-editor-container"
          sx={{
            flex: 1,
            position: 'relative',
            '& .djs-container': {
              height: '100%',
            },
          }}
        />

        {/* Properties Panel */}
        <Paper
          ref={propertiesPanelRef}
          className="bpmn-properties-panel"
          sx={{
            width: 300,
            borderLeft: 1,
            borderColor: 'divider',
            overflow: 'auto',
          }}
        />
      </Box>

      {/* Hidden file input */}
      <input
        id="bpmn-file-input"
        type="file"
        accept=".bpmn,.xml"
        style={{ display: 'none' }}
        onChange={handleUpload}
      />

      {/* Drawer Menu */}
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        classes={{ paper: 'bpmn-tools-drawer' }}
      >
        <Box sx={{ width: 250 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Herramientas BPMN
          </Typography>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => {
                  item.action();
                  setIsDrawerOpen(false);
                }}>
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        className="bpmn-snackbar"
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BpmnEditor;