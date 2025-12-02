import type { FC } from 'react';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ModuleLog } from '../services/firebaseService';
import type { ChartConfig } from '../services/geminiService';
import { CreateChartModal } from './CreateChartModal';
import { CustomChart } from './CustomChart';
import { DashboardFilters, type FilterState } from './DashboardFilters';

interface LogsVisualizationProps {
  logs: ModuleLog[];
  modules?: string[];
  selectedModule?: string;
  onModuleChange?: (module: string) => void;
  filters?: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
  customCharts?: ChartConfig[];
  onAddChart?: (prompt: string) => Promise<void>;
  onDeleteChart?: (index: number) => void;
}

export const LogsVisualization: FC<LogsVisualizationProps> = ({
  logs,
  modules = [],
  selectedModule = '',
  onModuleChange,
  filters = {},
  onFiltersChange,
  customCharts = [],
  onAddChart,
  onDeleteChart,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingChart, setIsCreatingChart] = useState(false);
  // Extract available statuses and users from logs
  const availableStatuses = useMemo(() => {
    const statusSet = new Set<string>();
    logs.forEach(log => {
      const status = log.stateDescription || '';
      if (status) {
        // Extract status keywords
        if (status.toLowerCase().includes('error')) {
          statusSet.add('Error');
        } else if (status.toLowerCase().includes('warning')) {
          statusSet.add('Warning');
        } else if (status.toLowerCase().includes('running') || status.toLowerCase().includes('operational')) {
          statusSet.add('Running');
        } else if (status.toLowerCase().includes('stopped') || status.toLowerCase().includes('down')) {
          statusSet.add('Stopped');
        } else {
          statusSet.add('Other');
        }
      }
    });

    return Array.from(statusSet).sort();
  }, [logs]);

  const availableUsers = useMemo(() => {
    const userSet = new Set<string>();
    logs.forEach(log => {
      if (log.user && typeof log.user === 'string') {
        userSet.add(log.user);
      }
    });

    return Array.from(userSet).sort();
  }, [logs]);

  // Filter logs by selected module and additional filters
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    // Filter by module
    if (selectedModule) {
      filtered = filtered.filter(log => log.moduleName === selectedModule);
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(log => {
        const status = (log.stateDescription || '').toLowerCase();
        if (filters.status === 'Error') {
          return status.includes('error');
        } else if (filters.status === 'Warning') {
          return status.includes('warning');
        } else if (filters.status === 'Running') {
          return status.includes('running') || status.includes('operational');
        } else if (filters.status === 'Stopped') {
          return status.includes('stopped') || status.includes('down');
        } else if (filters.status === 'Other') {
          return (
            !status.includes('error') &&
            !status.includes('warning') &&
            !status.includes('running') &&
            !status.includes('operational') &&
            !status.includes('stopped') &&
            !status.includes('down')
          );
        }

        return true;
      });
    }

    // Filter by user
    if (filters.user) {
      filtered = filtered.filter(log => log.user === filters.user);
    }

    return filtered;
  }, [logs, selectedModule, filters]);

  const displayLogs = filteredLogs;
  const currentView = selectedModule || 'All Modules';
  // Process logs for timeline chart
  const timelineData = useMemo(() => {
    const groupedByDate: Record<string, number> = {};
    displayLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
      groupedByDate[dateKey] = (groupedByDate[dateKey] || 0) + 1;
    });

    return Object.entries(groupedByDate)
      .map(([date, count]) => ({ date, count, timestamp: new Date(date).getTime() }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ date, count }) => ({ date, count }));
  }, [displayLogs]);

  // Process logs for module distribution (only show when viewing all modules)
  const moduleDistribution = useMemo(() => {
    if (selectedModule) return []; // Don't show module distribution when viewing a single module
    const moduleCounts: Record<string, number> = {};
    displayLogs.forEach(log => {
      if (log.moduleName) {
        moduleCounts[log.moduleName] = (moduleCounts[log.moduleName] || 0) + 1;
      }
    });

    return Object.entries(moduleCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 modules
  }, [displayLogs, selectedModule]);

  // Process logs for activity over time (by hour)
  const activityByHour = useMemo(() => {
    const hourCounts: Record<number, number> = {};
    displayLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const hour = date.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      count: hourCounts[hour] || 0,
    }));
  }, [displayLogs]);

  // Process logs for status distribution
  const statusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    displayLogs.forEach(log => {
      const status = log.stateDescription || 'Unknown';
      // Extract key status words
      let statusKey = 'Other';
      if (status.toLowerCase().includes('error')) {
        statusKey = 'Error';
      } else if (status.toLowerCase().includes('warning')) {
        statusKey = 'Warning';
      } else if (status.toLowerCase().includes('running') || status.toLowerCase().includes('operational')) {
        statusKey = 'Running';
      }
      statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
  }, [displayLogs]);

  if (logs.length === 0) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: '#6C7A89',
          backgroundColor: '#F5F7FA',
          borderRadius: '8px',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <div style={{ fontSize: '16px', fontWeight: '500' }}>No logs available for visualization</div>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>Logs will appear here once data is available</div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#F5F7FA',
      }}
    >
      {/* Dashboard Filters */}
      {onFiltersChange && (
        <DashboardFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          availableStatuses={availableStatuses}
          availableUsers={availableUsers}
        />
      )}

      {/* Module Selector */}
      {modules.length > 0 && onModuleChange && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#2C3E50' }}>View Charts for:</label>
            <button
              onClick={() => onModuleChange('')}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: !selectedModule ? '#2D5BFF' : '#E1E4E8',
                color: !selectedModule ? 'white' : '#2C3E50',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              All Modules
            </button>
            {modules.map(module => (
              <button
                key={module}
                onClick={() => onModuleChange(module)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: selectedModule === module ? '#2D5BFF' : '#E1E4E8',
                  color: selectedModule === module ? 'white' : '#2C3E50',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {module}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#6C7A89' }}>
            Currently viewing: <strong>{currentView}</strong> ({displayLogs.length} logs)
          </div>
        </div>
      )}

      {/* Custom Charts */}
      {customCharts.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          {customCharts.map((chart, index) => (
            <CustomChart
              key={index}
              config={chart}
              logs={filteredLogs}
              onDelete={onDeleteChart ? () => onDeleteChart(index) : undefined}
            />
          ))}
        </div>
      )}

      {/* Add Chart Button */}
      {onAddChart && (
        <div
          style={{
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: '#19c37d',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#15a169';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#19c37d';
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            Add Chart
          </button>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Timeline Chart */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#2C3E50' }}>
            📈 Logs Timeline {selectedModule && `- ${selectedModule}`}
          </h3>
          <ResponsiveContainer
            width='100%'
            height={200}
          >
            <AreaChart data={timelineData}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#E1E4E8'
              />
              <XAxis
                dataKey='date'
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
                dataKey='count'
                stroke='#2D5BFF'
                fill='#E9EEFF'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Module Distribution - Only show when viewing all modules */}
        {!selectedModule && moduleDistribution.length > 0 && (
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#2C3E50' }}>
              📦 Module Distribution
            </h3>
            <ResponsiveContainer
              width='100%'
              height={200}
            >
              <BarChart data={moduleDistribution}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#E1E4E8'
                />
                <XAxis
                  dataKey='name'
                  stroke='#6C7A89'
                  fontSize={12}
                  angle={-45}
                  textAnchor='end'
                  height={80}
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
                  dataKey='count'
                  fill='#27AE60'
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Activity by Hour */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#2C3E50' }}>
            ⏰ Activity by Hour {selectedModule && `- ${selectedModule}`}
          </h3>
          <ResponsiveContainer
            width='100%'
            height={200}
          >
            <LineChart data={activityByHour}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#E1E4E8'
              />
              <XAxis
                dataKey='hour'
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
                dataKey='count'
                stroke='#FF6B6B'
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#2C3E50' }}>
            🎯 Status Distribution {selectedModule && `- ${selectedModule}`}
          </h3>
          <ResponsiveContainer
            width='100%'
            height={200}
          >
            <BarChart data={statusDistribution}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#E1E4E8'
              />
              <XAxis
                dataKey='status'
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
                dataKey='count'
                fill='#F39C12'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            gridColumn: '1 / -1',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#2C3E50' }}>
            📊 Summary Statistics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '600', color: '#2D5BFF' }}>{displayLogs.length}</div>
              <div style={{ fontSize: '12px', color: '#6C7A89', marginTop: '4px' }}>Total Logs</div>
            </div>
            {!selectedModule && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '600', color: '#27AE60' }}>{moduleDistribution.length}</div>
                <div style={{ fontSize: '12px', color: '#6C7A89', marginTop: '4px' }}>Unique Modules</div>
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '600', color: '#F39C12' }}>
                {displayLogs.length > 0
                  ? new Date(Math.max(...displayLogs.map(l => new Date(l.timestamp).getTime()))).toLocaleDateString()
                  : 'N/A'}
              </div>
              <div style={{ fontSize: '12px', color: '#6C7A89', marginTop: '4px' }}>Latest Log</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '600', color: '#FF6B6B' }}>
                {displayLogs.length > 0
                  ? new Date(Math.min(...displayLogs.map(l => new Date(l.timestamp).getTime()))).toLocaleDateString()
                  : 'N/A'}
              </div>
              <div style={{ fontSize: '12px', color: '#6C7A89', marginTop: '4px' }}>Earliest Log</div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Chart Modal */}
      {onAddChart && (
        <CreateChartModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateChart={async (prompt: string) => {
            setIsCreatingChart(true);
            try {
              await onAddChart(prompt);
              setIsCreateModalOpen(false);
            } catch (error) {
              console.error('Error creating chart:', error);
            } finally {
              setIsCreatingChart(false);
            }
          }}
          loading={isCreatingChart}
        />
      )}
    </div>
  );
};
