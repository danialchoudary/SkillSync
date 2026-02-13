import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsChart = ({ data, title }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 11,
            weight: '600'
          },
          color: '#6E6E73'
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1D1D1F',
        bodyColor: '#6E6E73',
        borderColor: '#E5E5E5',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        usePointStyle: true,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 12,
          weight: '700'
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 11
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 10
          },
          color: '#AEAEB2'
        }
      },
      y: {
        grid: {
          borderDash: [5, 5],
          color: '#F0F0F0'
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 10
          },
          color: '#AEAEB2'
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
        borderColor: '#0071E3'
      },
      point: {
        radius: 0,
        hoverRadius: 6,
        backgroundColor: '#0071E3',
        borderWidth: 2,
        borderColor: '#fff'
      }
    }
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-bg)] flex items-center justify-center text-[var(--color-accent)]">
          <TrendingUp size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-tight">{title || 'Data Analytics'}</h3>
          <p className="text-[11px] font-medium text-[var(--color-text-tertiary)]">Performance metrics overview</p>
        </div>
      </div>
      <div className="flex-1 min-h-[300px]">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default AnalyticsChart;