import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  FileDownload as FileDownloadIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

/**
 * Interfaz para definir un elemento del breadcrumb
 */
export interface BreadcrumbItem {
  label: string;
  path?: string; // Opcional, si no tiene path es el último elemento
}

/**
 * Interfaz para el botón de acción customizable
 */
export interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'contained' | 'outlined';
  color?: string;
  backgroundColor?: string;
}

/**
 * Interfaz para información adicional con lista de items
 */
export interface AdditionalInfo {
  label: string;
  items: string[];
}

/**
 * Props del componente EtapaInformativa
 */
export interface EtapaInformativaProps {
  // Contenido del header azul
  headerTitle: string;
  
  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[];
  
  // Contenido principal
  contentTitle: string;
  contentDescription: string;
  contentSubtitle?: string;
  
  // Información adicional con lista
  additionalInfo?: AdditionalInfo;
  
  // Contenido personalizado (campos, inputs, etc.) que va después del subtitle
  customContent?: React.ReactNode;
  
  // Botón de acción principal (ej: Descargar)
  actionButton?: ActionButton;
  
  // Modo readonly
  readonly?: boolean;
  
  // Callbacks
  onCancel: () => void;
  onNext?: () => void;
  
  // Personalización de botones
  cancelButtonText?: string;
  nextButtonText?: string;
  nextButtonDisabled?: boolean;
  
  // Estados
  loading?: boolean;
  completing?: boolean;
  error?: string | null;
  
  // Children para modales u otros componentes
  children?: React.ReactNode;
}

/**
 * Componente genérico para etapas informativas de workflow
 * 
 * Renderiza una vista con:
 * - Header azul con título y breadcrumbs
 * - Contenido principal con título, descripción y subtítulo
 * - Botón de acción opcional
 * - Botones de navegación (Cancelar/Volver y Siguiente)
 * 
 * @example
 * ```tsx
 * <EtapaInformativa
 *   headerTitle="Permiso de Protección de Seguridad Humanitaria"
 *   breadcrumbs={[
 *     { label: 'Inicio', path: '/' },
 *     { label: 'Procesos' },
 *     { label: 'PPSH' }
 *   ]}
 *   contentTitle="Requisitos del trámite"
 *   contentDescription="Descripción de los requisitos..."
 *   actionButton={{
 *     label: 'Descargar requisitos',
 *     icon: <FileDownloadIcon />,
 *     onClick: handleDownload
 *   }}
 *   onCancel={handleCancel}
 *   onNext={handleNext}
 * />
 * ```
 */
export const EtapaInformativa: React.FC<EtapaInformativaProps> = ({
  headerTitle,
  breadcrumbs,
  contentTitle,
  contentDescription,
  contentSubtitle,
  additionalInfo,
  customContent,
  actionButton,
  readonly = false,
  onCancel,
  onNext,
  cancelButtonText,
  nextButtonText,
  nextButtonDisabled = false,
  loading = false,
  completing = false,
  error,
  children,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Header azul */}
      <Box
        sx={{
          backgroundColor: '#0e5fa6',
          py: 5,
          px: 15.375,
          position: 'relative',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            color: '#ffffff',
            fontSize: '64px',
            fontWeight: 700,
            lineHeight: 1.1,
            mb: 3,
            maxWidth: '896px',
          }}
        >
          {headerTitle}
        </Typography>

        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: '#ffffff' }} />}
          sx={{ mt: 2 }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            if (isLast || !item.path) {
              return (
                <Typography key={index} sx={{ color: '#ffffff', fontSize: '14px' }}>
                  {item.label}
                </Typography>
              );
            }

            // Breadcrumb con link
            if (item.path === '/') {
              return (
                <Link
                  key={index}
                  underline="hover"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                    '&:hover': { color: '#e0e0e0' },
                  }}
                  onClick={() => navigate(item.path!)}
                >
                  <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
                  {item.label}
                </Link>
              );
            }

            return (
              <Link
                key={index}
                underline="hover"
                sx={{
                  color: '#ffffff',
                  cursor: 'pointer',
                  '&:hover': { color: '#e0e0e0' },
                }}
                onClick={() => navigate(item.path!)}
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ px: 15.375, py: 5 }}>
        <Typography
          variant="h2"
          sx={{
            color: '#333333',
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: 1.5,
            mb: 3,
          }}
        >
          {contentTitle}
        </Typography>

        <Typography
          sx={{
            color: '#333333',
            fontSize: '16px',
            lineHeight: 1.5,
            mb: 4,
            maxWidth: '1167px',
          }}
        >
          {contentDescription}
        </Typography>

        {contentSubtitle && (
          <Typography
            sx={{
              color: '#333333',
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: 1.5,
              mb: 2,
            }}
          >
            {contentSubtitle}
          </Typography>
        )}

        {/* Contenido personalizado (campos de carga de archivo, etc.) */}
        {customContent && (
          <Box sx={{ mb: 6 }}>
            {customContent}
          </Box>
        )}

        {/* Información adicional con lista */}
        {additionalInfo && (
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                color: '#333333',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: 1.5,
                mb: 1,
              }}
            >
              {additionalInfo.label}
            </Typography>
            <Box component="ul" sx={{ pl: 3, m: 0 }}>
              {additionalInfo.items.map((item, index) => (
                <Typography
                  key={index}
                  component="li"
                  sx={{
                    color: '#333333',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    mb: 0.5,
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {/* Botón de acción opcional */}
        {actionButton && (
          <Button
            variant={actionButton.variant || 'outlined'}
            startIcon={actionButton.icon}
            onClick={actionButton.onClick}
            sx={{
              borderColor: actionButton.backgroundColor || '#0e5fa6',
              color: actionButton.color || '#0e5fa6',
              backgroundColor: 'transparent',
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 500,
              borderRadius: '4px',
              mb: 4,
              '&:hover': {
                borderColor: '#0d5494',
                backgroundColor: 'rgba(14, 95, 166, 0.04)',
              },
            }}
          >
            {actionButton.label}
          </Button>
        )}

        {/* Error message */}
        {error && (
          <Box
            sx={{
              mb: 3,
              maxWidth: '1194px',
              p: 2,
              backgroundColor: '#ffebee',
              borderRadius: '4px',
              border: '1px solid #f44336',
            }}
          >
            <Typography sx={{ color: '#c62828', fontSize: '14px' }}>
              {error}
            </Typography>
          </Box>
        )}

        {/* Botones de navegación */}
        {readonly ? (
          /* Modo solo lectura - Solo botón Volver */
          <Box sx={{ maxWidth: '1194px' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onCancel}
              sx={{
                borderColor: '#0e5fa6',
                color: '#0e5fa6',
                px: 2,
                py: 1,
                textTransform: 'none',
                fontSize: '16px',
                borderRadius: '4px',
                '&:hover': {
                  borderColor: '#0d5494',
                  backgroundColor: 'rgba(14, 95, 166, 0.04)',
                },
              }}
            >
              {cancelButtonText || 'Volver'}
            </Button>
          </Box>
        ) : (
          /* Modo edición - Botones Cancelar y Siguiente */
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: '1194px',
            }}
          >
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={completing}
              sx={{
                borderColor: '#0e5fa6',
                color: '#0e5fa6',
                px: 2,
                py: 1,
                textTransform: 'none',
                fontSize: '16px',
                borderRadius: '4px',
                minWidth: '124px',
                '&:hover': {
                  borderColor: '#0d5494',
                  backgroundColor: 'rgba(14, 95, 166, 0.04)',
                },
              }}
            >
              {cancelButtonText || 'Volver'}
            </Button>

            {onNext && (
              <Button
                variant="contained"
                onClick={onNext}
                disabled={completing || nextButtonDisabled}
                sx={{
                  backgroundColor: '#0e5fa6',
                  color: '#ffffff',
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  fontSize: '16px',
                  borderRadius: '4px',
                  minWidth: '124px',
                  '&:hover': {
                    backgroundColor: '#0d5494',
                  },
                }}
              >
                {completing ? <CircularProgress size={24} color="inherit" /> : (nextButtonText || 'Siguiente')}
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Renderizar children (modales, etc.) */}
      {children}
    </Box>
  );
};
