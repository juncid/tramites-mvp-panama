import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import { PageHero } from '../components/common/PageHero';
import { GeneralView, FlowView, StatusView, HistoryView } from '../components/PPSH/views';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`proceso-tabpanel-${index}`}
      aria-labelledby={`proceso-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Página de detalle de proceso PPSH con tabs
 * Tabs: General | Flujo | Estado | Historial
 */
export const DetalleProcesoPPSH = () => {
  const { procesoId, solicitudId } = useParams<{ procesoId: string; solicitudId: string }>();
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      {/* Hero con breadcrumb */}
      <PageHero
        title="Permiso de Protección de Seguridad Humanitaria"
        breadcrumbs={[
          { label: 'Inicio', path: '/' },
          { label: 'Procesos', path: '/procesos' },
          { label: 'Permiso de Protección de Seguridad Humanitaria' },
        ]}
        fullWidth={false}
      />

      {/* Tabs de navegación */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="Tabs de proceso PPSH"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 400,
              color: '#666',
              minWidth: { xs: 'auto', sm: 120 },
              px: { xs: 2, sm: 3 },
            },
            '& .Mui-selected': {
              color: '#0e5fa6',
              fontWeight: 600,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#0e5fa6',
              height: 3,
            },
          }}
        >
          <Tab label="General" id="proceso-tab-0" aria-controls="proceso-tabpanel-0" />
          <Tab label="Flujo" id="proceso-tab-1" aria-controls="proceso-tabpanel-1" />
          <Tab label="Estado" id="proceso-tab-2" aria-controls="proceso-tabpanel-2" />
          <Tab label="Historial" id="proceso-tab-3" aria-controls="proceso-tabpanel-3" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <GeneralView procesoId={procesoId} solicitudId={solicitudId} />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <FlowView procesoId={procesoId} solicitudId={solicitudId} />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <StatusView procesoId={procesoId} solicitudId={solicitudId} />
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <HistoryView procesoId={procesoId} solicitudId={solicitudId} />
      </TabPanel>
    </Box>
  );
};
