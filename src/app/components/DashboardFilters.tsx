import type { FC } from 'react';

export interface FilterState {
  startDate?: string;
  endDate?: string;
  status?: string;
  user?: string;
}

interface DashboardFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableStatuses?: string[];
  availableUsers?: string[];
}

export const DashboardFilters: FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  availableStatuses = [],
  availableUsers = [],
}) => {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.startDate || filters.endDate || filters.status || filters.user;

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2C3E50' }}>🔍 Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: '#FF6B6B',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Clear All
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}
      >
        {/* Date Range Filters */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6C7A89',
              marginBottom: '4px',
            }}
          >
            Start Date
          </label>
          <input
            type='date'
            value={filters.startDate || ''}
            onChange={e => handleFilterChange('startDate', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #E1E4E8',
              fontSize: '12px',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6C7A89',
              marginBottom: '4px',
            }}
          >
            End Date
          </label>
          <input
            type='date'
            value={filters.endDate || ''}
            onChange={e => handleFilterChange('endDate', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #E1E4E8',
              fontSize: '12px',
            }}
          />
        </div>

        {/* Status Filter */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6C7A89',
              marginBottom: '4px',
            }}
          >
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={e => handleFilterChange('status', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #E1E4E8',
              fontSize: '12px',
              backgroundColor: 'white',
            }}
          >
            <option value=''>All Statuses</option>
            {availableStatuses.map(status => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* User Filter */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6C7A89',
              marginBottom: '4px',
            }}
          >
            User
          </label>
          <select
            value={filters.user || ''}
            onChange={e => handleFilterChange('user', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #E1E4E8',
              fontSize: '12px',
              backgroundColor: 'white',
            }}
          >
            <option value=''>All Users</option>
            {availableUsers.map(user => (
              <option
                key={user}
                value={user}
              >
                {user}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
