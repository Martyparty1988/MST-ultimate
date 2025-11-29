import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDb } from '../../hooks/useDb';
import { GlassCard } from '../ui/DesignSystem';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EarningsChart: React.FC = () => {
  const db = useDb();

  const data = useLiveQuery(async () => {
    const records = await db.timeRecords.orderBy('createdAt').toArray();
    
    // Group by date (last 7 active days)
    const grouped = new Map<string, number>();
    
    // Process all records
    records.forEach(record => {
      const date = new Date(record.createdAt).toISOString().split('T')[0];
      const earnings = (record.minutes || 0) / 60 * 250; // Mock rate 250 CZK/hr
      grouped.set(date, (grouped.get(date) || 0) + earnings);
    });

    // Sort dates and take last 7
    const sortedDates = Array.from(grouped.keys()).sort();
    const last7Days = sortedDates.slice(-7);
    
    return {
      labels: last7Days.map(d => new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })),
      values: last7Days.map(d => grouped.get(d) || 0)
    };
  }, [db]);

  const chartData: ChartData<'line'> = {
    labels: data?.labels || [],
    datasets: [
      {
        fill: true,
        label: 'Odhad výdělku (CZK)',
        data: data?.values || [],
        borderColor: '#f59e0b', // Solar Amber
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        tension: 0.4,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          callback: (value) => `${value} Kč`
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <GlassCard className="h-[300px]">
       <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Přehled výdělků</h3>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">Posledních 7 dní</span>
       </div>
       <div className="h-[220px] w-full">
         {data?.labels.length ? (
            <Line data={chartData} options={options} />
         ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 opacity-50">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
               </svg>
               <p>Zatím žádná data</p>
            </div>
         )}
       </div>
    </GlassCard>
  );
};

export default EarningsChart;