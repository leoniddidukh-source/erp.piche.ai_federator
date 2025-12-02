import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { ChatWindow } from './components/ChatWindow';
import { type FilterState } from './components/DashboardFilters';
import { LogsVisualization } from './components/LogsVisualization';
import { firebaseService, type ModuleLog } from './services/firebaseService';
import { type ChartConfig, type ChatMessage as GeminiChatMessage, geminiService } from './services/geminiService';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ModuleState {
  moduleName: string;
  timestamp: string;
  stateDescription: string;
  summarization: string;
}

interface Props {
  apiUrl?: string;
}

export const AIAssistant: FC<Props> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleState>>({});
  const [showVisualization, setShowVisualization] = useState(false);
  const [logs, setLogs] = useState<ModuleLog[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [visualizationHeight, setVisualizationHeight] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [customCharts, setCustomCharts] = useState<ChartConfig[]>([]);

  useEffect(() => {
    fetchModules();
    fetchAllModuleStates();
  }, []);

  // Handle resizing
  const resizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      e.preventDefault();
      e.stopPropagation();

      const containerHeight = window.innerHeight;
      const newHeight = containerHeight - e.clientY;
      const minHeight = 200;
      const maxHeight = containerHeight - 200; // Leave space for chat

      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setVisualizationHeight(newHeight);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.overflow = '';
    };
  }, [isResizing]);

  const fetchModules = async () => {
    try {
      const moduleList = await firebaseService.getAvailableModules();
      setModules(moduleList);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchAllModuleStates = async () => {
    try {
      const fetchedLogs = await firebaseService.getModuleLogs();
      setLogs(fetchedLogs);
      const states: Record<string, ModuleState> = {};
      fetchedLogs.forEach(log => {
        if (log.moduleName) {
          states[log.moduleName] = {
            moduleName: log.moduleName,
            timestamp: log.timestamp || '',
            stateDescription: log.stateDescription || '',
            summarization: log.summarization || '',
          };
        }
      });
      setModuleStates(states);
    } catch (error) {
      console.error('Error fetching module states:', error);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Fetch module logs
      const moduleLogs = await firebaseService.getModuleLogs(selectedModule || undefined);

      // Convert messages to Gemini format
      const chatMessages: GeminiChatMessage[] = [...messages, userMessage].map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: msg.content,
      }));

      // Get AI response
      const response = await geminiService.chat(chatMessages, moduleLogs);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response from AI assistant'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSummary = async () => {
    setLoading(true);
    try {
      // Fetch module logs
      const moduleLogs = await firebaseService.getModuleLogs(selectedModule || undefined);

      // Get summary from Gemini
      const summary = await geminiService.getModuleStatesSummary(moduleLogs);

      const summaryMessage: ChatMessage = {
        role: 'assistant',
        content: `📊 **Module States Summary**\n\n${summary}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, summaryMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get summary'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f7f7f8' }}>
      {/* Module States Overview */}
      {Object.keys(moduleStates).length > 0 && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e5e6',
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ marginTop: 0, marginBottom: 0, fontSize: '14px', fontWeight: '600', color: '#353740' }}>
              Module States Overview
            </h3>
            <button
              onClick={() => setShowVisualization(!showVisualization)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: showVisualization ? '#19c37d' : '#e5e5e6',
                color: showVisualization ? 'white' : '#353740',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {showVisualization ? '📊 Hide Charts' : '📊 Show Charts'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
            {Object.values(moduleStates).map(state => (
              <div
                key={state.moduleName}
                style={{
                  padding: '12px',
                  backgroundColor: '#f7f7f8',
                  borderRadius: '8px',
                  border: '1px solid #e5e5e6',
                }}
              >
                <strong style={{ fontSize: '13px', color: '#353740' }}>{state.moduleName}</strong>
                <div style={{ fontSize: '12px', color: '#6e6e80', marginTop: '4px' }}>
                  {new Date(state.timestamp).toLocaleString()}
                </div>
                {state.stateDescription && (
                  <div style={{ fontSize: '12px', marginTop: '4px', color: '#6e6e80' }}>{state.stateDescription}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visualization Panel */}
      {showVisualization && (
        <>
          <div
            style={{
              height: `${visualizationHeight}px`,
              overflowY: 'auto',
              overflowX: 'hidden',
              backgroundColor: '#f7f7f8',
              position: 'relative',
            }}
          >
            <LogsVisualization
              logs={logs}
              modules={modules}
              selectedModule={selectedModule}
              onModuleChange={setSelectedModule}
              filters={filters}
              onFiltersChange={setFilters}
              customCharts={customCharts}
              onAddChart={async (prompt: string) => {
                try {
                  const config = await geminiService.generateChartConfig(prompt, logs);
                  setCustomCharts(prev => [...prev, config]);
                } catch (error) {
                  console.error('Error creating chart:', error);
                  alert('Failed to create chart. Please try again.');
                }
              }}
              onDeleteChart={(index: number) => {
                setCustomCharts(prev => prev.filter((_chart, i) => i !== index));
              }}
            />
          </div>
          {/* Resize Handle */}
          <div
            ref={resizeRef}
            onMouseDown={e => {
              e.preventDefault();
              e.stopPropagation();
              setIsResizing(true);
            }}
            style={{
              height: '8px',
              backgroundColor: isResizing ? '#19c37d' : '#e5e5e6',
              cursor: 'row-resize',
              position: 'relative',
              transition: isResizing ? 'none' : 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              touchAction: 'none',
            }}
            onMouseEnter={e => {
              if (!isResizing) {
                e.currentTarget.style.backgroundColor = '#d1d1d1';
              }
            }}
            onMouseLeave={e => {
              if (!isResizing) {
                e.currentTarget.style.backgroundColor = '#e5e5e6';
              }
            }}
          >
            <div
              style={{
                width: '40px',
                height: '4px',
                backgroundColor: isResizing ? '#15a169' : '#c5c5c7',
                borderRadius: '2px',
                transition: isResizing ? 'none' : 'background-color 0.2s',
              }}
            />
          </div>
        </>
      )}

      {/* Chat Window */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loading}
          selectedModule={selectedModule}
          onModuleChange={setSelectedModule}
          modules={modules}
          onGetSummary={handleGetSummary}
          onRefreshStates={fetchAllModuleStates}
        />
      </div>
    </div>
  );
};
