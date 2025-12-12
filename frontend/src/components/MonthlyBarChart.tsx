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

// Wajib daftarkan komponen Chart.js yang akan digunakan
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyBarChartProps {
    // Data untuk 6 bulan terakhir
    chartData: AnalysisReport['chartData']; 
}

// Konfigurasi opsi chart (untuk tampilan yang bersih)
const options = {
  responsive: true,
  maintainAspectRatio: false, // Penting untuk mengontrol tinggi chart
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Tren Pemasukan vs Pengeluaran (6 Bulan Terakhir)',
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
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
      // Format label sumbu Y menjadi Rupiah
      ticks: {
        callback: function(value: any) {
          return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
        }
      }
    }
  }
};

const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({ chartData }) => {
    
    // Siapkan data untuk Chart.js
    const labels = chartData.map(d => d.month); // Misal: Mei, Jun, Jul, ...

    const data = {
        labels,
        datasets: [
            {
                label: 'Pemasukan',
                data: chartData.map(d => d.pemasukan),
                backgroundColor: 'rgba(75, 192, 192, 0.8)', // Hijau/Biru
                borderRadius: 4,
            },
            {
                label: 'Pengeluaran',
                data: chartData.map(d => d.pengeluaran),
                backgroundColor: 'rgba(255, 99, 132, 0.8)', // Merah
                borderRadius: 4,
            },
        ],
    };

    return (
        <div style={{ height: '350px' }}>
            {/* Chart.js akan di-render di sini */}
            <Bar options={options} data={data} /> 
        </div>
    );
};

export default MonthlyBarChart;