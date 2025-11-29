import React from 'react';

interface ChartDataPoint {
    date: string;
    count: number;
}

interface ProgressChartProps {
    data: ChartDataPoint[];
    total: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data, total }) => {
    if (!data || data.length < 2) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                Nedostatek dat pro zobrazení grafu. Pro vygenerování grafu je potřeba historie alespoň 2 dny.
            </div>
        );
    }

    const width = 500;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };

    const maxCount = total > 0 ? total : Math.max(...data.map(d => d.count), 1);

    const xScale = (index: number) => 
        padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);

    const yScale = (count: number) => 
        height - padding.bottom - (count / maxCount) * (height - padding.top - padding.bottom);

    const pathData = data.map((point, i) => 
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(point.count)}`
    ).join(' ');

    const areaPathData = `${pathData} L ${xScale(data.length - 1)} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;
    
    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
        const value = Math.round(maxCount * (i / 4));
        return { value, y: yScale(value) };
    });

    const xAxisLabels = [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]];

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="chart-title">
            <title id="chart-title">Graf postupu dokončených stolů v čase</title>
            <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Y-axis grid lines and labels */}
            {yAxisLabels.map(({ value, y }) => (
                <g key={value} className="text-xs text-gray-500">
                    <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                    <text x={padding.left - 8} y={y + 3} textAnchor="end" fill="currentColor">{value}</text>
                </g>
            ))}

            {/* X-axis labels */}
            <g className="text-xs text-gray-400">
                 {xAxisLabels[0] && (
                     <text x={xScale(0)} y={height - padding.bottom + 15} textAnchor="middle" fill="currentColor">
                        {new Date(xAxisLabels[0].date).toLocaleDateString('cs-CZ')}
                    </text>
                 )}
                 {xAxisLabels[1] && (
                     <text x={xScale(Math.floor(data.length / 2))} y={height - padding.bottom + 15} textAnchor="middle" fill="currentColor">
                        {new Date(xAxisLabels[1].date).toLocaleDateString('cs-CZ')}
                    </text>
                 )}
                 {xAxisLabels[2] && (
                     <text x={xScale(data.length - 1)} y={height - padding.bottom + 15} textAnchor="middle" fill="currentColor">
                        {new Date(xAxisLabels[2].date).toLocaleDateString('cs-CZ')}
                    </text>
                 )}
            </g>

            {/* Area and Line */}
            <path d={areaPathData} fill="url(#areaGradient)" />
            <path d={pathData} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points */}
            {data.map((point, i) => (
                 <circle key={i} cx={xScale(i)} cy={yScale(point.count)} r="3" fill="#6366f1" stroke="#1f2937" strokeWidth="2">
                    <title>{`Datum: ${new Date(point.date).toLocaleDateString('cs-CZ')}, Dokončeno: ${point.count}`}</title>
                 </circle>
            ))}
        </svg>
    );
};

export default ProgressChart;
