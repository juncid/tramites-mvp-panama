import {
  Paper,
  Box,
  Avatar,
  Typography,
  Divider,
} from '@mui/material';

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
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: '#1F2937' }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Paper
      sx={{
        p: 2.5,
        position: 'sticky',
        top: 24,
        border: '1px solid #E5E7EB',
      }}
    >
      {/* Photo */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Avatar
          src={data.photoUrl}
          sx={{
            width: 120,
            height: 120,
            border: '3px solid #E5E7EB',
          }}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

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
      <InfoRow label="N° de expediente" value={data.expediente} />

      {/* Fecha de nacimiento */}
      <InfoRow label="Fecha de nacimiento" value={data.fechaNacimiento} />
    </Paper>
  );
};
