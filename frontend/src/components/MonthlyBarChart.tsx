import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { AnalysisReport } from '../types/report.types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyBarChartProps {
    chartData: any[]; // Diubah ke any agar lebih fleksibel menerima properti 'label'
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Tren Keuangan (Pemasukan vs Pengeluaran)',
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) { label += ': '; }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: any) {
          return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
        }
      }
    }
  }
};

const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({ chartData }) => {
    
    // FIX: Menggunakan 'label' (bukan 'month') agar cocok dengan data dari Backend
    const labels = chartData.map(d => d.label || d.month); 

    const data = {
        labels,
        datasets: [
            {
                label: 'Pemasukan',
                data: chartData.map(d => d.pemasukan),
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderRadius: 4,
            },
            {
                label: 'Pengeluaran',
                data: chartData.map(d => d.pengeluaran),
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                borderRadius: 4,
            },
        ],
    };

    return (
        <div style={{ height: '350px' }}>
            <Bar options={options} data={data} /> 
        </div>
    );
};

export default MonthlyBarChart;