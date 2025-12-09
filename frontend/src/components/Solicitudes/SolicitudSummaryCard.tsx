import {
  Paper,
  Box,
  Typography,
} from '@mui/material';
import { PersonOutline as PersonOutlineIcon } from '@mui/icons-material';

interface SolicitudData {
  solicitud: string;
  ruex: string;
  solicitante: string;
  nacionalidad: string;
  pasaporte: string;
  sexo: string;
  expediente: string;
  fechaNacimiento: string;
  photoUrl?: string;
}

interface SolicitudSummaryCardProps {
  data: SolicitudData;
}

export const SolicitudSummaryCard = ({ data }: SolicitudSummaryCardProps) => {
  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <Box sx={{ mb: 1 }}>
      <Typography 
        sx={{ 
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: 1.5,
          color: '#333333',
        }}
      >
        {label}
      </Typography>
      <Typography 
        sx={{ 
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: 1.5,
          color: '#333333',
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Paper
      sx={{
        width: '378px',
        maxWidth: '100%',
        pt: '34px',
        pb: '24px',
        px: '24px',
        position: 'sticky',
        top: 24,
        border: '1px solid #f0f0f0',
        borderRadius: '0 8px 8px 8px',
        boxShadow: '-4px 4px 8px 0px rgba(216,216,216,0.25), 4px 4px 8px 0px rgba(216,216,216,0.25)',
      }}
    >
      {/* Photo - Cuadrada con bordes redondeados según Figma */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, px: 2 }}>
        {data.photoUrl ? (
          <Box
            component="img"
            src={data.photoUrl}
            alt="Foto del solicitante"
            sx={{
              width: '174px',
              height: '174px',
              borderRadius: '4px',
              objectFit: 'cover',
              backgroundColor: '#f0f0f0',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <Box
            sx={{
              width: '174px',
              height: '174px',
              borderRadius: '4px',
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonOutlineIcon sx={{ fontSize: 80, color: '#9e9e9e' }} />
          </Box>
        )}
      </Box>

      {/* Datos del solicitante */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 2 }}>
        {/* Solicitud */}
        <InfoRow label="Solicitud" value={data.solicitud} />

        {/* RUEX */}
        <InfoRow label="RUEX" value={data.ruex} />

        {/* Solicitante */}
        <InfoRow label="Solicitante" value={data.solicitante} />

        {/* Nacionalidad */}
        <InfoRow label="Nacionalidad" value={data.nacionalidad} />

        {/* Pasaporte */}
        <InfoRow label="Pasaporte" value={data.pasaporte} />

        {/* Sexo */}
        <InfoRow label="Sexo" value={data.sexo} />

        {/* N° de expediente */}
        <InfoRow label="Nº de expediente" value={data.expediente} />

        {/* Fecha de nacimiento */}
        <InfoRow label="Fecha de nacimiento" value={data.fechaNacimiento} />
      </Box>
    </Paper>
  );
};
