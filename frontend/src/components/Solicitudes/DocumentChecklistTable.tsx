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
  HelpOutline as HelpIcon,
} from '@mui/icons-material';

interface Document {
  id: string;
  name: string;
  hasOcr: boolean;
  isValid: boolean | null;
  ocrUrl?: string;
  documentUrl?: string;
}

interface DocumentChecklistTableProps {
  documents: Document[];
  selectedDocumentId?: string | null;
  onDocumentSelect?: (id: string) => void;
}

export const DocumentChecklistTable = ({
  documents,
  selectedDocumentId,
  onDocumentSelect,
}: DocumentChecklistTableProps) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Revisión manual de documentos
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#374151', width: 80 }}>
                OCR
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                Documento
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => {
              const isSelected = selectedDocumentId === doc.id;
              const hasError = !doc.hasOcr; // Documento con OCR fallido
              
              return (
                <TableRow
                  key={doc.id}
                  onClick={() => onDocumentSelect?.(doc.id)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: isSelected 
                      ? (hasError ? '#FEF2F2' : '#EFF6FF') // Rosado si tiene error, azul si está OK
                      : 'transparent', // Sin color si no está seleccionado
                    '&:hover': { 
                      backgroundColor: isSelected 
                        ? (hasError ? '#FEE2E2' : '#DBEAFE')
                        : '#F9FAFB' 
                    },
                  }}
                >
                  <TableCell>
                    {doc.hasOcr ? (
                      <CheckIcon sx={{ color: '#22C55E', fontSize: 20 }} />
                    ) : (
                      <CancelIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small" sx={{ p: 0.5 }}>
                        <DownloadIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
                      </IconButton>

                      <Typography
                        variant="body2"
                        sx={{ fontSize: '0.875rem', color: '#1F2937', flex: 1 }}
                      >
                        {doc.name}
                      </Typography>

                      {doc.name.includes('domicilio') && (
                        <IconButton size="small" sx={{ p: 0.5 }}>
                          <HelpIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
