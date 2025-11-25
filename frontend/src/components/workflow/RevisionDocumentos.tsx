import { Box, Typography } from '@mui/material';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';

interface Documento {
  id: number;
  nombre: string;
  url?: string;
}

interface RevisionDocumentosProps {
  documentos: Documento[];
  onDescargar?: (documento: Documento) => void;
}

/**
 * Componente reutilizable para mostrar lista de documentos con opción de descarga
 * Usado en vistas de workflow para revisión manual de documentos
 */
export const RevisionDocumentos: React.FC<RevisionDocumentosProps> = ({
  documentos,
  onDescargar
}) => {
  const handleDescargar = (documento: Documento) => {
    if (onDescargar) {
      onDescargar(documento);
    } else if (documento.url) {
      window.open(documento.url, '_blank');
    }
  };

  return (
    <Box>
      <Typography sx={{ fontWeight: 500, fontSize: '16px', mb: 1, color: '#333' }}>
        Revisión manual de documentos
      </Typography>
      <Typography sx={{ fontSize: '16px', color: '#333', mb: 2 }}>
        Documento
      </Typography>
      <Box sx={{ height: '4px', bgcolor: '#f3f3f3', mb: 2 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {documentos.map((documento) => (
          <Box
            key={documento.id}
            sx={{
              bgcolor: 'white',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              py: 1,
              cursor: documento.url || onDescargar ? 'pointer' : 'default',
              '&:hover': {
                bgcolor: documento.url || onDescargar ? '#f8f8f8' : 'white',
              },
            }}
            onClick={() => handleDescargar(documento)}
          >
            <FileDownloadIcon sx={{ fontSize: '20px', color: '#333' }} />
            <Typography sx={{ fontSize: '16px', color: '#333', lineHeight: 1.5 }}>
              {documento.nombre}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
