import React from 'react';
import { Box, Typography } from '@mui/material';
import { CheckBox as CheckBoxIcon, CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon } from '@mui/icons-material';

/**
 * Datos de la cotización para impresión
 */
export interface CotizacionData {
  nombre: string;
  nacionalidad: string;
  cotizacionNum: string;
  tramite: string;
  fecha: string;
  responsable: string;
  items: CotizacionItem[];
}

export interface CotizacionItem {
  id: string;
  codigo: string;
  descripcion: string;
  precio: number;
  checked: boolean;
}

interface PrintableCotizacionProps {
  data: CotizacionData;
  logoUrl?: string;
}

/**
 * Genera un array de cotizaciones individuales - cada una con solo un item marcado
 */
function generateIndividualQuotations(data: CotizacionData): CotizacionData[] {
  const selectedItems = data.items.filter(item => item.checked);
  
  return selectedItems.map(selectedItem => ({
    ...data,
    cotizacionNum: data.cotizacionNum || `COT-${Date.now()}-${selectedItem.id}`,
    items: data.items.map(item => ({
      ...item,
      checked: item.id === selectedItem.id // Solo marcar el item actual
    }))
  }));
}

/**
 * Tarjeta individual de cotización para impresión
 */
const QuotationCard: React.FC<{ data: CotizacionData; logoUrl?: string }> = ({ data, logoUrl }) => {
  const formatPrecio = (precio: number) => `B/${precio.toFixed(2)}`;
  
  return (
    <Box
      sx={{
        width: '306px',
        height: '396px',
        backgroundColor: '#fff',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        boxSizing: 'border-box',
        pageBreakInside: 'avoid',
      }}
    >
      {/* Header con logo - fondo negro */}
      <Box
        sx={{
          width: '100%',
          height: '38px',
          backgroundColor: '#131414',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {logoUrl ? (
          <Box
            component="img"
            src={logoUrl}
            alt="Migración Panamá"
            sx={{ height: '30px', objectFit: 'contain' }}
          />
        ) : (
          <Typography
            sx={{
              color: '#fff',
              fontSize: '10px',
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            GOBIERNO NACIONAL | MIGRACIÓN PANAMÁ
          </Typography>
        )}
      </Box>

      {/* Título */}
      <Typography
        sx={{
          position: 'absolute',
          top: '46px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: '"Roboto Flex", Roboto, sans-serif',
          fontWeight: 700,
          fontSize: '14px',
          color: '#333333',
          whiteSpace: 'nowrap',
        }}
      >
        AUTORIZACIÓN DE COTIZACIÓN
      </Typography>

      {/* Sección Información */}
      <Typography
        sx={{
          position: 'absolute',
          top: '94px',
          left: '16px',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 500,
          fontSize: '13px',
          color: '#333333',
        }}
      >
        Información
      </Typography>

      <Box
        sx={{
          position: 'absolute',
          top: '112px',
          left: '16px',
          width: '274px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <InfoLine label="Nombre" value={data.nombre} />
        <InfoLine label="Nacionalidad" value={data.nacionalidad} />
        <InfoLine label="Cotización N°" value={data.cotizacionNum} />
        <InfoLine label="Tramite" value={data.tramite} />
      </Box>

      {/* Sección Cotización */}
      <Typography
        sx={{
          position: 'absolute',
          top: '200px',
          left: '16px',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 500,
          fontSize: '13px',
          color: '#333333',
        }}
      >
        Cotización
      </Typography>

      <Box
        sx={{
          position: 'absolute',
          top: '222px',
          left: '16px',
          width: '274px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {data.items.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {item.checked ? (
              <CheckBoxIcon sx={{ fontSize: '14px', color: '#333333' }} />
            ) : (
              <CheckBoxOutlineBlankIcon sx={{ fontSize: '14px', color: '#333333' }} />
            )}
            <Typography
              sx={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                color: '#333333',
                lineHeight: 1.5,
              }}
            >
              {item.codigo ? `(${item.codigo})` : ''}{item.descripcion}: {formatPrecio(item.precio)}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Sección Footer */}
      <Box
        sx={{
          position: 'absolute',
          top: '334px',
          left: '16px',
          width: '274px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <InfoLine label="Fecha" value={data.fecha} />
        <InfoLine label="Responsable" value={data.responsable} />
      </Box>
    </Box>
  );
};

/**
 * Línea de información con label en negrita
 */
const InfoLine: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Typography
    sx={{
      fontFamily: 'Roboto, sans-serif',
      fontSize: '12px',
      color: '#333333',
      lineHeight: '14px',
    }}
  >
    <Box component="span" sx={{ fontWeight: 700 }}>
      {label}:
    </Box>{' '}
    {value}
  </Typography>
);

/**
 * Componente principal de impresión de cotizaciones
 * 
 * Genera una tarjeta por cada item de cotización seleccionado.
 * Las tarjetas se organizan en una cuadrícula de 2 columnas.
 * 
 * Basado en el diseño de Figma: node-id=550-686
 */
export const PrintableCotizacion: React.FC<PrintableCotizacionProps> = ({ data, logoUrl }) => {
  const quotations = generateIndividualQuotations(data);

  if (quotations.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>No hay items de cotización seleccionados</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-cotizacion-page, .print-cotizacion-page * {
            visibility: visible;
          }
          .print-cotizacion-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: letter;
            margin: 0;
          }
        }
      `}</style>

      <Box
        className="print-cotizacion-page"
        sx={{
          width: '612px', // Letter width in pixels at 72dpi
          minHeight: '792px', // Letter height
          backgroundColor: '#fff',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 306px)',
          gridTemplateRows: 'repeat(2, 396px)',
          margin: '0 auto',
          '@media print': {
            margin: 0,
          },
        }}
      >
        {quotations.slice(0, 4).map((quotation, index) => (
          <QuotationCard key={index} data={quotation} logoUrl={logoUrl} />
        ))}
      </Box>

      {/* Si hay más de 4 cotizaciones, generar páginas adicionales */}
      {quotations.length > 4 && (
        <Box
          className="print-cotizacion-page"
          sx={{
            width: '612px',
            minHeight: '792px',
            backgroundColor: '#fff',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 306px)',
            gridTemplateRows: 'repeat(2, 396px)',
            margin: '0 auto',
            pageBreakBefore: 'always',
            '@media print': {
              margin: 0,
            },
          }}
        >
          {quotations.slice(4, 8).map((quotation, index) => (
            <QuotationCard key={index + 4} data={quotation} logoUrl={logoUrl} />
          ))}
        </Box>
      )}
    </>
  );
};

/**
 * Genera el HTML para imprimir cotizaciones en una nueva ventana
 * @param data Datos de la cotización
 * @param logoUrl URL opcional del logo
 * @returns String HTML para inyectar en la ventana de impresión
 */
export function generateCotizacionPrintHTML(data: CotizacionData, logoUrl?: string): string {
  const selectedItems = data.items.filter(item => item.checked);
  const allItems = data.items; // Todas las opciones disponibles
  
  // Si no hay items seleccionados, no generar nada
  if (selectedItems.length === 0) {
    return `
      <!DOCTYPE html>
      <html><head><title>Sin cotizaciones</title></head>
      <body><p>No hay items de cotización seleccionados</p></body>
      </html>
    `;
  }

  const formatPrecio = (precio: number) => `B/${precio.toFixed(2)}`;

  // SVG para checkbox marcado
  const checkBoxChecked = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#333333"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
  
  // SVG para checkbox vacío
  const checkBoxEmpty = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#333333"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`;

  // Generar una tarjeta por cada item seleccionado
  // Muestra TODAS las opciones pero solo marca la correspondiente a esta tarjeta
  const generateCard = (selectedItem: CotizacionItem): string => {
    // Generar HTML para TODOS los items, marcando solo el seleccionado
    const itemsHTML = allItems.map(item => {
      const isChecked = item.id === selectedItem.id;
      const checkbox = isChecked ? checkBoxChecked : checkBoxEmpty;
      
      return `
        <div style="display: flex; align-items: center; gap: 6px;">
          ${checkbox}
          <span style="font-family: Roboto, sans-serif; font-weight: 400; font-size: 12px; color: #333333; line-height: 1.5;">
            ${item.codigo ? `(${item.codigo})` : ''}${item.descripcion}: ${formatPrecio(item.precio)}
          </span>
        </div>
      `;
    }).join('');

    return `
      <div style="width: 306px; height: 396px; background-color: #fff; position: relative; overflow: hidden; border: 1px solid #e0e0e0; box-sizing: border-box; page-break-inside: avoid;">
        <!-- Header -->
        <div style="width: 100%; height: 38px; background-color: #131414; display: flex; align-items: center; justify-content: center;">
          ${logoUrl 
            ? `<img src="${logoUrl}" alt="Migración Panamá" style="height: 30px; object-fit: contain;" />`
            : `<span style="color: #fff; font-size: 10px; font-family: Roboto, sans-serif; font-weight: 500; text-align: center;">GOBIERNO NACIONAL | MIGRACIÓN PANAMÁ</span>`
          }
        </div>
        
        <!-- Título -->
        <div style="position: absolute; top: 46px; left: 50%; transform: translateX(-50%); font-family: 'Roboto Flex', Roboto, sans-serif; font-weight: 700; font-size: 14px; color: #333333; white-space: nowrap;">
          AUTORIZACIÓN DE COTIZACIÓN
        </div>
        
        <!-- Sección Información -->
        <div style="position: absolute; top: 94px; left: 16px; font-family: Roboto, sans-serif; font-weight: 500; font-size: 13px; color: #333333;">
          Información
        </div>
        <div style="position: absolute; top: 112px; left: 16px; width: 274px; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-family: Roboto, sans-serif; font-size: 12px; color: #333333; line-height: 14px;"><span style="font-weight: 700;">Nombre:</span> ${data.nombre}</div>
          <div style="font-family: Roboto, sans-serif; font-size: 12px; color: #333333; line-height: 14px;"><span style="font-weight: 700;">Nacionalidad:</span> ${data.nacionalidad}</div>
          <div style="font-family: Roboto, sans-serif; font-size: 12px; color: #333333; line-height: 14px;"><span style="font-weight: 700;">Cotización N°:</span> ${data.cotizacionNum}</div>
          <div style="font-family: Roboto, sans-serif; font-size: 12px; color: #333333; line-height: 14px;"><span style="font-weight: 700;">Tramite:</span> ${data.tramite}</div>
        </div>
        
        <!-- Sección Cotización - Muestra todas las opciones, marca solo la seleccionada -->
        <div style="position: absolute; top: 200px; left: 16px; font-family: Roboto, sans-serif; font-weight: 500; font-size: 13px; color: #333333;">
          Cotización
        </div>
        <div style="position: absolute; top: 222px; left: 16px; width: 274px; display: flex; flex-direction: column; gap: 8px;">
          ${itemsHTML}
        </div>
        
        <!-- Sección Footer -->
        <div style="position: absolute; top: 334px; left: 16px; width: 274px; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-family: Roboto, sans-serif; font-size: 12px; color: #333333; line-height: 14px;"><span style="font-weight: 700;">Fecha:</span> ${data.fecha}</div>
          <div style="font-family: Roboto, sans-serif; font-size: 12px; color: #333333; line-height: 14px;"><span style="font-weight: 700;">Responsable:</span> ${data.responsable}</div>
        </div>
      </div>
    `;
  };

  // Dividir en páginas de 4 tarjetas
  const pagesHTML: string[] = [];
  for (let i = 0; i < selectedItems.length; i += 4) {
    const pageCards = selectedItems.slice(i, i + 4).map(item => generateCard(item)).join('');
    pagesHTML.push(`
      <div style="width: 612px; min-height: 792px; background-color: #fff; display: grid; grid-template-columns: repeat(2, 306px); grid-template-rows: repeat(2, 396px); margin: 0 auto; ${i > 0 ? 'page-break-before: always;' : ''}">
        ${pageCards}
      </div>
    `);
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cotización - Servicio Nacional de Migración</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        @page {
          size: letter;
          margin: 0;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body {
          width: 8.5in;
          height: 11in;
          margin: 0;
          padding: 0;
          font-family: 'Roboto', Arial, sans-serif;
          background: white;
        }
        @media print {
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
        }
      </style>
    </head>
    <body>
      ${pagesHTML.join('')}
    </body>
    </html>
  `;
}

export default PrintableCotizacion;
