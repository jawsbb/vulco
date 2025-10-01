import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Placement } from '../../types';

interface BarChartProps {
  data: Placement[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const plusValue = payload[0]?.value || 0;
      const performance = payload[1]?.value || 0;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">Plus-value:</span>
              <span className="text-sm font-medium text-blue-600">
                {formatCurrency(plusValue)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Performance:</span>
              <span className={`text-sm font-medium ${performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(performance)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Grouper les placements par type et calculer les performances
  const groupedData = data.reduce((acc, placement) => {
    const type = placement.type;
    if (!acc[type]) {
      acc[type] = {
        type,
        totalInvesti: 0,
        totalValorise: 0,
        totalRevenus: 0,
        count: 0
      };
    }
    
    acc[type].totalInvesti += placement.montantInvesti;
    acc[type].totalValorise += placement.valorisationActuelle;
    acc[type].totalRevenus += placement.revenusGeneres;
    acc[type].count += 1;
    
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(groupedData).map((group: any) => {
    const plusValue = group.totalValorise - group.totalInvesti + group.totalRevenus;
    const performance = group.totalInvesti > 0 
      ? ((group.totalValorise + group.totalRevenus - group.totalInvesti) / group.totalInvesti) * 100 
      : 0;

    return {
      type: group.type,
      plusValue,
      performance,
      totalInvesti: group.totalInvesti,
      totalValorise: group.totalValorise,
      count: group.count
    };
  }).sort((a, b) => b.plusValue - a.plusValue);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Aucun placement à analyser
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="type" 
            stroke="#6b7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="left"
            tickFormatter={(value) => formatCurrency(value)}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `${value.toFixed(0)}%`}
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            yAxisId="left"
            dataKey="plusValue" 
            fill="#3B82F6"
            name="Plus-value"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            yAxisId="right"
            dataKey="performance" 
            fill="#10B981"
            name="Performance %"
            radius={[2, 2, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}; 