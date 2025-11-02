import { Paper, Box, Typography, useTheme } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  trendIcon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendIcon,
  color = 'primary',
}: StatCardProps) => {
  const theme = useTheme();

  const colorMap = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
  };

  const bgColor = colorMap[color];
  const trendColor = trend && trend > 0 ? theme.palette.success.main : theme.palette.error.main;

  return (
    <Paper
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            {value}
          </Typography>
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ color: trendColor, display: 'flex', fontSize: '1.2rem' }}>
                {trendIcon}
              </Box>
              <Typography variant="body2" sx={{ color: trendColor, fontWeight: 500 }}>
                {Math.abs(trend)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs mes anterior
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            color: bgColor,
            backgroundColor: `${bgColor}15`,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};
