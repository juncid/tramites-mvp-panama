import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box } from '@mui/material';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

// Datos de ejemplo para solicitudes por mes
// En producción estos datos vendrían de una API
const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const data = {
  labels,
  datasets: [
    {
      label: 'Aprobados',
      data: [58, 65, 78, 72, 88, 95, 70, 82, 102, 90, 108, 118],
      backgroundColor: 'rgba(25, 118, 210, 0.7)', // Azul
      borderColor: 'rgba(25, 118, 210, 1)',
      borderWidth: 1,
      borderRadius: 4,
    },
    {
      label: 'En Proceso',
      data: [28, 35, 42, 38, 45, 52, 48, 55, 62, 58, 68, 72],
      backgroundColor: 'rgba(237, 108, 2, 0.7)', // Naranja
      borderColor: 'rgba(237, 108, 2, 1)',
      borderWidth: 1,
      borderRadius: 4,
    },
    {
      label: 'Rechazados',
      data: [5, 8, 6, 9, 7, 4, 6, 5, 8, 7, 6, 5],
      backgroundColor: 'rgba(211, 47, 47, 0.7)', // Rojo
      borderColor: 'rgba(211, 47, 47, 1)',
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: 'Roboto, sans-serif',
          size: 12,
        },
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        family: 'Roboto, sans-serif',
        size: 14,
      },
      bodyFont: {
        family: 'Roboto, sans-serif',
        size: 12,
      },
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: 'Roboto, sans-serif',
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.06)',
      },
      ticks: {
        font: {
          family: 'Roboto, sans-serif',
          size: 11,
        },
      },
    },
  },
};

export const SolicitudesPorMesChart: React.FC = () => {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Bar options={options} data={data} />
    </Box>
  );
};

export default SolicitudesPorMesChart;
