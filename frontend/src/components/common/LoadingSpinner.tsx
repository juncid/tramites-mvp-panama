import { CircularProgress, Box, Typography } from '@mui/material'

interface LoadingSpinnerProps {
  message?: string
}

export const LoadingSpinner = ({ message = 'Cargando...' }: LoadingSpinnerProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
      sx={{ minHeight: '200px' }}
    >
      <CircularProgress size={40} sx={{ color: 'primary.main' }} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  )
}

export default LoadingSpinner