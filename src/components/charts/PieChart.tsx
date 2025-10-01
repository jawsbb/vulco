import React, { memo } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const PieChart: React.FC<PieChartProps> = memo(({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-blue-600">{formatCurrency(data.value)}</p>
          <p className="text-gray-600">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Aucune donnée à afficher
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius="70%"
              fill="#8884d8"
              dataKey="value"
              label={({ percentage }) => `${percentage.toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className="text-xs sm:text-sm text-gray-700">{value}</span>}
              wrapperStyle={{ paddingTop: '10px' }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Mobile-friendly summary */}
      <div className="mt-4 sm:hidden">
        <div className="grid grid-cols-1 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.value)}
                </div>
                <div className="text-xs text-gray-600">
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}); 