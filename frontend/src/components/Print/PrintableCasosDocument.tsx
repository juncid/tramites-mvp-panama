import React, { forwardRef } from 'react';
import { Box, Typography } from '@mui/material';

// Escudo de Panamá como SVG inline
const EscudoPanama = () => (
  <svg width="27" height="23" viewBox="0 0 27 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="13.5" cy="11.5" rx="13.5" ry="11.5" fill="#FFD700"/>
    <path d="M13.5 2C8 2 4 6 4 11.5C4 17 8 21 13.5 21C19 21 23 17 23 11.5C23 6 19 2 13.5 2Z" fill="#0066B3"/>
    <path d="M13.5 4C9 4 6 7.5 6 11.5C6 15.5 9 19 13.5 19C18 19 21 15.5 21 11.5C21 7.5 18 4 13.5 4Z" fill="#FFFFFF"/>
    <circle cx="13.5" cy="11.5" r="4" fill="#D4AF37"/>
  </svg>
);

export interface CasoParaImpresion {
  id_solicitud: number;
  num_expediente: string;
  nombre: string;
  nacionalidad: string;
}

interface PrintableCasosDocumentProps {
  casos: CasoParaImpresion[];
  sede?: string;
}

/**
 * Componente de documento imprimible para 6 casos
 * Layout: 3 columnas x 2 filas en una página tamaño carta (612x792 px)
 * Cada tarjeta tiene texto rotado 90° según el diseño de Figma
 */
export const PrintableCasosDocument = forwardRef<HTMLDivElement, PrintableCasosDocumentProps>(
  ({ casos, sede = 'SEDE CENTRAL' }, ref) => {
    // Asegurar que siempre tengamos 6 casos (rellenar con vacíos si es necesario)
    const casosCompletos = [...casos];
    while (casosCompletos.length < 6) {
      casosCompletos.push({
        id_solicitud: 0,
        num_expediente: '',
        nombre: '',
        nacionalidad: '',
      });
    }

    return (
      <Box
        ref={ref}
        sx={{
          width: '612px',
          height: '792px',
          backgroundColor: '#ffffff',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 204px)',
          gridTemplateRows: 'repeat(2, 396px)',
          '@media print': {
            width: '8.5in',
            height: '11in',
            margin: 0,
            padding: 0,
            pageBreakAfter: 'always',
          },
        }}
      >
        {casosCompletos.slice(0, 6).map((caso, index) => (
          <TarjetaCaso key={index} caso={caso} sede={sede} />
        ))}
      </Box>
    );
  }
);

PrintableCasosDocument.displayName = 'PrintableCasosDocument';

interface TarjetaCasoProps {
  caso: CasoParaImpresion;
  sede: string;
}

/**
 * Tarjeta individual de un caso para impresión
 * Diseño basado en Figma con texto rotado 90°
 */
const TarjetaCaso: React.FC<TarjetaCasoProps> = ({ caso, sede }) => {
  return (
    <Box
      sx={{
        width: '204px',
        height: '396px',
        position: 'relative',
        border: '4px solid #000000',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        // Borde doble efecto
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '3px',
          left: '3px',
          right: '3px',
          bottom: '3px',
          border: '2px solid #000000',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Encabezado institucional - rotado 90° */}
      <Box
        sx={{
          position: 'absolute',
          left: '165px',
          top: '84px',
          width: '56px',
          height: '222px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            transform: 'rotate(90deg)',
            transformOrigin: 'center center',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            color: '#333333',
            textAlign: 'center',
            whiteSpace: 'pre-line',
            lineHeight: 1.2,
            letterSpacing: '-0.56px',
          }}
        >
          REPÚBLICA DE PANAMÁ{'\n'}
          MINISTERIO DE SEGURIDAD PÚBLICA{'\n'}
          SERVICIO NACIONAL DE MIGRACIÓN{'\n'}
          {sede}
        </Typography>
      </Box>

      {/* Escudo de Panamá */}
      <Box
        sx={{
          position: 'absolute',
          left: '169px',
          top: '183px',
          width: '27px',
          height: '23px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(90deg)',
        }}
      >
        <EscudoPanama />
      </Box>

      {/* Número de expediente - rotado 90° */}
      <Box
        sx={{
          position: 'absolute',
          left: '93px',
          top: '86px',
          width: '18px',
          height: '217px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            transform: 'rotate(90deg)',
            transformOrigin: 'center center',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 500,
            fontSize: '18px',
            color: '#333333',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          EXPEDIENTE N°: {caso.num_expediente || 'NNN.NNN'}
        </Typography>
      </Box>

      {/* Nombre - rotado 90° */}
      <Box
        sx={{
          position: 'absolute',
          left: '59px',
          top: '8px',
          width: '16px',
          height: '294px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            transform: 'rotate(90deg)',
            transformOrigin: 'center center',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 500,
            fontSize: '16px',
            color: '#333333',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          NOMBRE: {caso.nombre || 'NOMBRE APELLIDO APELLIDO'}
        </Typography>
      </Box>

      {/* Nacionalidad - rotado 90° */}
      <Box
        sx={{
          position: 'absolute',
          left: '33px',
          top: '8px',
          width: '16px',
          height: '238px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            transform: 'rotate(90deg)',
            transformOrigin: 'center center',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 500,
            fontSize: '16px',
            color: '#333333',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          NACIONALIDAD: {caso.nacionalidad || 'NACIONALIDAD'}
        </Typography>
      </Box>
    </Box>
  );
};

export default PrintableCasosDocument;
