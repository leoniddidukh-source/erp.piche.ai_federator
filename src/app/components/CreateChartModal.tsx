import type { FC } from 'react';
import { useState } from 'react';

interface CreateChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChart: (prompt: string) => Promise<void>;
  loading?: boolean;
}

export const CreateChartModal: FC<CreateChartModalProps> = ({ isOpen, onClose, onCreateChart, loading = false }) => {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      await onCreateChart(prompt.trim());
      setPrompt('');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setPrompt('');
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: '16px',
            fontSize: '20px',
            fontWeight: '600',
            color: '#353740',
          }}
        >
          Create Custom Chart
        </h2>
        <p
          style={{
            marginBottom: '16px',
            fontSize: '14px',
            color: '#6e6e80',
            lineHeight: '1.5',
          }}
        >
          Describe the chart you want to create. For example: "Create a histogram of logs by status" or "Show a bar
          chart of module activity by hour"
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder='e.g., Create a histogram showing the distribution of logs by status...'
            disabled={loading}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e5e5e6',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              marginBottom: '16px',
              outline: 'none',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#19c37d';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#e5e5e6';
            }}
          />
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type='button'
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#f7f7f8',
                color: '#353740',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={!prompt.trim() || loading}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: !prompt.trim() || loading ? '#e5e5e6' : '#19c37d',
                color: !prompt.trim() || loading ? '#6e6e80' : 'white',
                border: 'none',
                cursor: !prompt.trim() || loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating...' : 'Create Chart'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
