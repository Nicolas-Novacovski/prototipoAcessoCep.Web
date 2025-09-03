import React from 'react';
import Card, { CardContent, CardTitle, CardHeader } from './Card';

interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  title: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#e5e7eb" className="dark:stroke-slate-700" strokeWidth="20" />
                {data.map((item, index) => {
                  const percentage = total > 0 ? (item.value / total) : 0;
                  const angle = percentage * 360;
                  const segmentLength = percentage * circumference;
                  const rotation = accumulatedAngle - 90;
                  accumulatedAngle += angle;

                  return (
                    <circle
                      key={index}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth="20"
                      strokeDasharray={`${segmentLength} ${circumference}`}
                      transform={`rotate(${rotation} 100 100)`}
                      className="transition-transform duration-500"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-cep-text dark:text-white">{total}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
              </div>
            </div>
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center text-sm">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="flex-1 text-slate-600 dark:text-slate-300">{item.label}</span>
                  <span className="font-semibold text-cep-text dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
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

export default DonutChart;