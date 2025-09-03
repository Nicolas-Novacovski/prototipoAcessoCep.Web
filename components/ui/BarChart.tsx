import React from 'react';
import Card, { CardContent, CardTitle, CardHeader } from './Card';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="flex justify-around items-end h-64 space-x-2 pt-6">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1 group w-full h-full">
                {/* Value Label */}
                <div className="text-sm font-bold text-cep-text dark:text-white">{item.value}</div>
                {/* The Bar */}
                <div
                  className="w-full mt-auto hover:opacity-90 transition-all duration-300 rounded-t-md"
                  style={{
                    height: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color || '#0f766e',
                    minHeight: '2px', // Ensure bar is visible even for small values
                  }}
                  title={`${item.label}: ${item.value}`}
                />
                {/* X-axis Label */}
                <div className="text-center text-xs mt-2 text-gray-500 dark:text-gray-400 h-8 truncate w-full px-1">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            Nenhum dado para exibir.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BarChart;