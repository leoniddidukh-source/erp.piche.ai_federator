import type { FC } from 'react';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ModuleLog } from '../services/firebaseService';
import type { ChartConfig } from '../services/geminiService';

interface CustomChartProps {
  config: ChartConfig;
  logs: ModuleLog[];
  onDelete?: () => void;
}

const COLORS = ['#19c37d', '#ab68ff', '#2D5BFF', '#FF6B6B', '#FFA500', '#00CED1', '#9370DB', '#FF1493'];

export const CustomChart: FC<CustomChartProps> = ({ config, logs, onDelete }) => {
  const chartData = useMemo(() => {
    if (logs.length === 0) return [];

    if (config.type === 'histogram') {
      // Group data by the specified dataKey
      const grouped: Record<string, number> = {};
      logs.forEach(log => {
        const key = config.dataKey || 'moduleName';
        const value = (log[key as keyof ModuleLog] as string) || 'Unknown';
        grouped[value] = (grouped[value] || 0) + 1;
      });

      return Object.entries(grouped).map(([name, value]) => ({
        name,
        value,
      }));
    }

    if (config.type === 'pie') {
      const grouped: Record<string, number> = {};
      logs.forEach(log => {
        const key = config.dataKey || 'moduleName';
        const value = (log[key as keyof ModuleLog] as string) || 'Unknown';
        grouped[value] = (grouped[value] || 0) + 1;
      });

      return Object.entries(grouped).map(([name, value]) => ({
        name,
        value,
      }));
    }

    // For bar/line/area charts
    if (config.xAxisKey && config.yAxisKey) {
      const grouped: Record<string, number> = {};
      logs.forEach(log => {
        const xValue = (log[config.xAxisKey as keyof ModuleLog] as string) || 'Unknown';
        const yValue = Number(log[config.yAxisKey as keyof ModuleLog]) || 0;
        grouped[xValue] = (grouped[xValue] || 0) + yValue;
      });

      return Object.entries(grouped).map(([x, y]) => ({
        [config.xAxisKey!]: x,
        [config.yAxisKey!]: y,
      }));
    }

    // Default: group by module
    const grouped: Record<string, number> = {};
    logs.forEach(log => {
      const module = log.moduleName || 'Unknown';
      grouped[module] = (grouped[module] || 0) + 1;
    });

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      count: value,
    }));
  }, [logs, config]);

  const renderChart = () => {
    switch (config.type) {
      case 'histogram':
      case 'bar':
        return (
          <ResponsiveContainer
            width='100%'
            height={300}
          >
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#E1E4E8'
              />
              <XAxis
                dataKey={config.xAxisKey || 'name'}
                stroke='#6C7A89'
                fontSize={12}
              />
              <YAxis
                stroke='#6C7A89'
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E1E4E8',
                  borderRadius: '4px',
                }}
              />
              <Bar
                dataKey={config.yAxisKey || 'value'}
                fill='#19c37d'
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer
            width='100%'
            height={300}
          >
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#E1E4E8'
              />
              <XAxis
                dataKey={config.xAxisKey || 'name'}
                stroke='#6C7A89'
                fontSize={12}
              />
              <YAxis
                stroke='#6C7A89'
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E1E4E8',
                  borderRadius: '4px',
                }}
              />
              <Line
                type='monotone'
                dataKey={config.yAxisKey || 'value'}
                stroke='#19c37d'
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer
            width='100%'
            height={300}
          >
            <AreaChart data={chartData}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#E1E4E8'
              />
              <XAxis
                dataKey={config.xAxisKey || 'name'}
                stroke='#6C7A89'
                fontSize={12}
              />
              <YAxis
                stroke='#6C7A89'
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E1E4E8',
                  borderRadius: '4px',
                }}
              />
              <Area
                type='monotone'
                dataKey={config.yAxisKey || 'value'}
                stroke='#19c37d'
                fill='#E9EEFF'
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer
            width='100%'
            height={300}
          >
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
              >
                {chartData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#2C3E50',
          }}
        >
          {config.title || 'Custom Chart'}
        </h3>
        {onDelete && (
          <button
            onClick={onDelete}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: '#FF6B6B',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✕ Delete
          </button>
        )}
      </div>
      {config.description && (
        <p
          style={{
            fontSize: '12px',
            color: '#6C7A89',
            marginBottom: '16px',
          }}
        >
          {config.description}
        </p>
      )}
      {chartData.length > 0 ? (
        renderChart()
      ) : (
        <div
          style={{
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6C7A89',
          }}
        >
          No data available
        </div>
      )}
    </div>
  );
};
