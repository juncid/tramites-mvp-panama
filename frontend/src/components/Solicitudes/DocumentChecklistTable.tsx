import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface Document {
  id: string;
  name: string;
  hasOcr: boolean;
  isValid: boolean | null;
  ocrUrl?: string;
  documentUrl?: string;
  url?: string;
}

interface DocumentChecklistTableProps {
  documents: Document[];
  selectedDocumentId?: string | null;
  onDocumentSelect?: (id: string) => void;
  showOcrColumn?: boolean; // Si es false, no muestra la columna OCR
  showOcrStatus?: boolean; // Si es false, la columna OCR se muestra vacía (sin iconos)
}

export const DocumentChecklistTable = ({
  documents,
  selectedDocumentId,
  onDocumentSelect,
  showOcrColumn = true,
  showOcrStatus = true,
}: DocumentChecklistTableProps) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
          <TableRow>
            {showOcrColumn && (
              <TableCell sx={{ fontWeight: 600, color: '#374151', width: 80 }}>
                OCR
              </TableCell>
            )}
            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
              Documento
            </TableCell>
          </TableRow>
        </TableHead>
          <TableBody>
            {documents.map((doc) => {
              const isSelected = selectedDocumentId === doc.id;
              const hasError = showOcrColumn && showOcrStatus && !doc.hasOcr; // Solo considerar error si se muestra estado OCR
              
              return (
                <TableRow
                  key={doc.id}
                  onClick={() => onDocumentSelect?.(doc.id)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: hasError 
                      ? '#fbe7e7' // Fondo rojo para documentos con OCR fallido (Figma)
                      : isSelected 
                      ? '#EFF6FF' // Fondo azul claro si está seleccionado y OK
                      : 'transparent',
                    '&:hover': { 
                      backgroundColor: hasError 
                        ? '#f5d5d5' // Hover más oscuro para documentos con error
                        : isSelected 
                        ? '#DBEAFE'
                        : '#F9FAFB' 
                    },
                  }}
                >
                  {showOcrColumn && (
                    <TableCell>
                      {showOcrStatus && (
                        doc.hasOcr ? (
                          <CheckIcon sx={{ color: '#22C55E', fontSize: 20 }} />
                        ) : (
                          <CancelIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                        )
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        sx={{ p: 0.5 }}
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar que se dispare el onClick de la fila
                          const downloadUrl = doc.url || doc.documentUrl;
                          if (downloadUrl) {
                            window.open(downloadUrl, '_blank');
                          }
                        }}
                        disabled={!doc.url && !doc.documentUrl}
                      >
                        <DownloadIcon sx={{ fontSize: 16, color: (doc.url || doc.documentUrl) ? '#3B82F6' : '#9CA3AF' }} />
                      </IconButton>

                      <Typography
                        variant="body2"
                        sx={{ fontSize: '0.875rem', color: '#1F2937', flex: 1 }}
                      >
                        {doc.name}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
  );
};
