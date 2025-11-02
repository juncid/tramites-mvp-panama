import { Paper, Typography, List, ListItem, ListItemText, Chip, Box } from '@mui/material';

interface Activity {
  id: number;
  title: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const activities: Activity[] = [
  { id: 1, title: 'Solicitud #1245 aprobada', time: 'Hace 5 minutos', status: 'success' },
  { id: 2, title: 'Documento escaneado con OCR', time: 'Hace 15 minutos', status: 'info' },
  { id: 3, title: 'Solicitud #1244 en revisión', time: 'Hace 1 hora', status: 'warning' },
  { id: 4, title: 'Solicitud #1243 rechazada', time: 'Hace 2 horas', status: 'error' },
  { id: 5, title: 'Nuevo documento cargado', time: 'Hace 3 horas', status: 'info' },
];

export const RecentActivityCard = () => {
  const getStatusColor = (status: Activity['status']) => {
    const colors = {
      success: 'success',
      warning: 'warning',
      error: 'error',
      info: 'info',
    };
    return colors[status] as 'success' | 'warning' | 'error' | 'info';
  };

  return (
    <Paper sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Actividad Reciente
      </Typography>
      <List sx={{ overflow: 'auto', flex: 1 }}>
        {activities.map((activity) => (
          <ListItem
            key={activity.id}
            sx={{
              px: 0,
              '&:hover': { backgroundColor: 'action.hover' },
              borderRadius: 1,
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">{activity.title}</Typography>
                  <Chip
                    label={activity.status}
                    size="small"
                    color={getStatusColor(activity.status)}
                    sx={{ ml: 1 }}
                  />
                </Box>
              }
              secondary={activity.time}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
