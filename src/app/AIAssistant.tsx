import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { ChatWindow } from './components/ChatWindow';
import { firebaseService } from './services/firebaseService';
import { type ChatMessage as GeminiChatMessage, geminiService } from './services/geminiService';

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

  useEffect(() => {
    fetchModules();
    fetchAllModuleStates();
  }, []);

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
      const logs = await firebaseService.getModuleLogs();
      const states: Record<string, ModuleState> = {};
      logs.forEach(log => {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Module States Overview */}
      {Object.keys(moduleStates).length > 0 && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #E1E4E8',
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            Module States Overview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
            {Object.values(moduleStates).map(state => (
              <div
                key={state.moduleName}
                style={{
                  padding: '10px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              >
                <strong style={{ fontSize: '12px' }}>{state.moduleName}</strong>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                  {new Date(state.timestamp).toLocaleString()}
                </div>
                {state.stateDescription && (
                  <div style={{ fontSize: '11px', marginTop: '5px' }}>{state.stateDescription}</div>
                )}
              </div>
            ))}
          </div>
        </div>
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
