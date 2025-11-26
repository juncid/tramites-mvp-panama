import { Grid, Paper, Typography, Box } from '@mui/material';
import { StatCard } from '../components/Dashboard/StatCard';
import { RecentActivityCard } from '../components/Dashboard/RecentActivityCard';
import {
  TrendingUp,
  TrendingDown,
  Description,
  CheckCircle,
  PendingActions,
  Error,
} from '@mui/icons-material';

export const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Dashboard
      </Typography>

      {/* Estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Trámites"
            value="1,245"
            icon={<Description />}
            trend={12}
            trendIcon={<TrendingUp />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completados"
            value="856"
            icon={<CheckCircle />}
            trend={8}
            trendIcon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En Proceso"
            value="324"
            icon={<PendingActions />}
            trend={-5}
            trendIcon={<TrendingDown />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rechazados"
            value="65"
            icon={<Error />}
            trend={-3}
            trendIcon={<TrendingDown />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Gráficos y actividad */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Solicitudes por Mes
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                color: 'text.secondary',
              }}
            >
              Gráfico - Integrar Chart.js aquí
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <RecentActivityCard />
        </Grid>
      </Grid>
    </Box>
  );
};
