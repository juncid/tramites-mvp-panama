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

/**
 * Genera HTML completo para impresión de etiquetas de casos
 * Abre en nueva ventana y ejecuta window.print()
 * @param casos - Array de casos a imprimir (máximo 6 por página)
 * @param sede - Nombre de la sede (default: 'SEDE CENTRAL')
 * @returns String con HTML completo
 */
export function generateCasosPrintHTML(
  casos: CasoParaImpresion[],
  sede: string = 'SEDE CENTRAL'
): string {
  // Si no hay casos, crear un caso de ejemplo para prueba
  if (casos.length === 0) {
    console.warn('generateCasosPrintHTML: No hay casos para imprimir');
    casos = [{
      id_solicitud: 0,
      num_expediente: 'SIN-EXPEDIENTE',
      nombre: 'Sin casos seleccionados',
      nacionalidad: 'N/A',
    }];
  }

  // Debug: mostrar casos recibidos

  // Dividir en páginas de 6 casos
  const paginas: CasoParaImpresion[][] = [];
  for (let i = 0; i < casos.length; i += 6) {
    paginas.push(casos.slice(i, i + 6));
  }

  const paginasHTML = paginas.map((paginaCasos, pageIndex) => `
    <div class="pagina" style="
      width: 8.5in;
      height: 11in;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 8px;
      padding: 16px;
      page-break-after: ${pageIndex < paginas.length - 1 ? 'always' : 'auto'};
      background: white;
      box-sizing: border-box;
    ">
      ${paginaCasos.map(caso => generarTarjetaCasoHTML(caso, sede)).join('')}
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Etiquetas de Casos - Migración Panamá</title>
      <style>
        @page {
          size: letter portrait;
          margin: 0;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Roboto', 'Roboto Flex', sans-serif;
          background: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @media print {
          body { margin: 0; padding: 0; }
        }
      </style>
    </head>
    <body>
      ${paginasHTML}
    </body>
    </html>
  `;
}

function generarTarjetaCasoHTML(caso: CasoParaImpresion, sede: string): string {
  const escudoSVG = `
    <svg width="40" height="34" viewBox="0 0 27 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="13.5" cy="11.5" rx="13.5" ry="11.5" fill="#FFD700"/>
      <path d="M13.5 2C8 2 4 6 4 11.5C4 17 8 21 13.5 21C19 21 23 17 23 11.5C23 6 19 2 13.5 2Z" fill="#0066B3"/>
      <path d="M13.5 4C9 4 6 7.5 6 11.5C6 15.5 9 19 13.5 19C18 19 21 15.5 21 11.5C21 7.5 18 4 13.5 4Z" fill="#FFFFFF"/>
      <circle cx="13.5" cy="11.5" r="4" fill="#D4AF37"/>
    </svg>
  `;

  return `
    <div style="
      width: 100%;
      height: 100%;
      position: relative;
      border: 3px solid #000000;
      box-sizing: border-box;
      background: white;
      display: flex;
      flex-direction: column;
      padding: 12px;
    ">
      <!-- Borde interior -->
      <div style="
        position: absolute;
        top: 4px; left: 4px; right: 4px; bottom: 4px;
        border: 2px solid #000000;
        pointer-events: none;
      "></div>
      
      <!-- Encabezado institucional -->
      <div style="
        text-align: center;
        padding: 8px 0 12px 0;
        border-bottom: 1px solid #999;
        margin-bottom: 10px;
      ">
        <div style="margin-bottom: 6px;">
          ${escudoSVG}
        </div>
        <div style="
          font-family: 'Roboto', Arial, sans-serif;
          font-weight: 600;
          font-size: 9px;
          color: #333333;
          line-height: 1.4;
          text-transform: uppercase;
        ">
          República de Panamá<br>
          Ministerio de Seguridad Pública<br>
          Servicio Nacional de Migración<br>
          <span style="font-weight: 700;">${sede}</span>
        </div>
      </div>
      
      <!-- Datos del caso -->
      <div style="
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
        padding: 0 8px;
      ">
        <!-- Expediente -->
        <div style="
          font-family: 'Roboto', Arial, sans-serif;
          font-size: 11px;
          color: #333333;
        ">
          <span style="font-weight: 700;">EXPEDIENTE N°:</span><br>
          <span style="font-size: 13px; font-weight: 600;">${caso.num_expediente || 'N/A'}</span>
        </div>
        
        <!-- Nombre -->
        <div style="
          font-family: 'Roboto', Arial, sans-serif;
          font-size: 11px;
          color: #333333;
        ">
          <span style="font-weight: 700;">NOMBRE:</span><br>
          <span style="font-size: 12px;">${caso.nombre || 'N/A'}</span>
        </div>
        
        <!-- Nacionalidad -->
        <div style="
          font-family: 'Roboto', Arial, sans-serif;
          font-size: 11px;
          color: #333333;
        ">
          <span style="font-weight: 700;">NACIONALIDAD:</span><br>
          <span style="font-size: 12px;">${caso.nacionalidad || 'N/A'}</span>
        </div>
      </div>
    </div>
  `;
}
