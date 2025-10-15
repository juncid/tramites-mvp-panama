import React, { useState } from 'react';
import { BpmnEditor } from '../components/bpmn';
import { BreadCrumbsList, BreadcrumbItem } from '../components/common';
import HomeIcon from '@mui/icons-material/Home';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import { Save as SaveIcon, Download as DownloadIcon } from '@mui/icons-material';

const BpmnPage: React.FC = () => {
  const [currentDiagram, setCurrentDiagram] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Inicio", icon: HomeIcon },
    { label: "Procesos" },
    { label: "Editor BPMN" },
  ];

  const handleDiagramChange = (xml: string) => {
    setCurrentDiagram(xml);
    setHasUnsavedChanges(true);
  };

  const handleSave = (xml: string) => {
    // Aquí puedes implementar la lógica para guardar en el backend
    console.log('Guardando diagrama BPMN:', xml);
    setHasUnsavedChanges(false);

    // Ejemplo: enviar al backend
    // saveBpmnDiagram(xml).then(() => {
    //   setHasUnsavedChanges(false);
    // });
  };

  const handleExport = () => {
    if (currentDiagram) {
      const blob = new Blob([currentDiagram], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flujo-tramite-${new Date().toISOString().split('T')[0]}.bpmn`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header con breadcrumbs */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 0,
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}
      >
        <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
          <BreadCrumbsList
            items={breadcrumbItems}
            separator="/"
            color="inherit"
            separatorColor="rgba(255, 255, 255, 0.7)"
          />

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Editor de Flujos BPMN
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                sx={{
                  color: 'inherit',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                disabled={!currentDiagram}
              >
                Exportar BPMN
              </Button>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSave(currentDiagram)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
                disabled={!hasUnsavedChanges}
              >
                {hasUnsavedChanges ? 'Guardar Cambios' : 'Guardado'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* BPMN Editor */}
      <BpmnEditor
        onChange={handleDiagramChange}
        onSave={handleSave}
      />
    </Box>
  );
};

export default BpmnPage;