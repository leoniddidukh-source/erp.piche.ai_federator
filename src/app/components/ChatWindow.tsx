import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { ChatMessage } from './ChatMessage';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  loading: boolean;
  selectedModule?: string;
  onModuleChange?: (module: string) => void;
  modules?: string[];
  onGetSummary?: () => Promise<void>;
  onRefreshStates?: () => Promise<void>;
}

const EMOJI_OPTIONS = [
  '😀',
  '😂',
  '😊',
  '😍',
  '😎',
  '🤔',
  '🙌',
  '👍',
  '🔥',
  '🎉',
  '❤️',
  '🤖',
  '✨',
  '🙏',
  '🥳',
  '😴',
  '😅',
  '😇',
  '🤩',
  '😢',
];

export const ChatWindow: FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  loading,
  selectedModule = '',
  onModuleChange,
  modules = [],
  onGetSummary,
  onRefreshStates,
}) => {
  const [input, setInput] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        (event.target as HTMLElement).getAttribute('data-emoji-button') !== 'true'
      ) {
        setIsEmojiPickerOpen(false);
      }
    };

    if (isEmojiPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEmojiPickerOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const messageText = input.trim();
    setInput('');
    await onSendMessage(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput(prev => `${prev}${emoji}`);
    setIsEmojiPickerOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white' }}>
      {/* Chat Header */}
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid #E1E4E8',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '16px',
            flexShrink: 0,
            backgroundColor: '#E9EEFF',
            color: '#2D5BFF',
          }}
        >
          🤖
        </div>

        {/* Chat Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: '600',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#2C3E50',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              AI Module Federation Assistant
            </span>
          </div>
        </div>
      </div>

      {/* Module Selector */}
      {(modules.length > 0 || onGetSummary || onRefreshStates) && (
        <div
          style={{
            padding: '8px 20px',
            borderBottom: '1px solid #E1E4E8',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            backgroundColor: '#F5F7FA',
          }}
        >
          {modules.length > 0 && onModuleChange && (
            <>
              <label
                htmlFor='module-select'
                style={{ fontSize: '12px', fontWeight: '500', color: '#2C3E50' }}
              >
                Filter by Module:
              </label>
              <select
                id='module-select'
                value={selectedModule}
                onChange={e => onModuleChange(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  border: '1px solid #E1E4E8',
                  backgroundColor: 'white',
                  color: '#2C3E50',
                  minWidth: '150px',
                }}
              >
                <option value=''>All Modules</option>
                {modules.map(module => (
                  <option
                    key={module}
                    value={module}
                  >
                    {module}
                  </option>
                ))}
              </select>
            </>
          )}
          {onGetSummary && (
            <button
              onClick={onGetSummary}
              disabled={loading}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: '#27AE60',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              Get Summary
            </button>
          )}
          {onRefreshStates && (
            <button
              onClick={onRefreshStates}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
            >
              Refresh States
            </button>
          )}
        </div>
      )}

      {/* Message Area */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backgroundColor: 'white',
          animation: 'fadeIn 0.3s ease',
        }}
      >
        {loading && messages.length === 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              fontWeight: '500',
              color: '#6C7A89',
            }}
          >
            <svg
              style={{ animation: 'spin 1s linear infinite', marginRight: '12px', width: '20px', height: '20px' }}
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                style={{ opacity: 0.25 }}
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                style={{ opacity: 0.75 }}
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
            Loading Messages...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px', color: '#d0d0d0' }}>💬</div>
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '10px', color: '#2C3E50' }}>
              No messages yet
            </div>
            <div style={{ fontSize: '14px', maxWidth: '320px', margin: '0 auto', color: '#6C7A89' }}>
              Start a conversation with the AI assistant about your module federation architecture.
            </div>
            <div style={{ fontSize: '12px', marginTop: '8px', color: '#6C7A89' }}>
              Ask questions like: "What is the status of module X?" or "Summarize all module states"
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg}
              />
            ))}
          </div>
        )}

        {loading && messages.length > 0 && (
          <div style={{ textAlign: 'center', fontSize: '14px', color: '#6C7A89' }}>AI is thinking...</div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Message Input Box */}
      <footer
        style={{
          padding: '12px 20px',
          borderTop: '1px solid #E1E4E8',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <form
          onSubmit={handleSend}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}
        >
          {/* Emoji Picker Button */}
          <div style={{ position: 'relative' }}>
            <button
              type='button'
              data-emoji-button='true'
              onClick={() => setIsEmojiPickerOpen(prev => !prev)}
              disabled={loading}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backgroundColor: '#F5F7FA',
                color: '#6C7A89',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#E9EEFF';
                  e.currentTarget.style.color = '#2D5BFF';
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#F5F7FA';
                  e.currentTarget.style.color = '#6C7A89';
                }
              }}
              title='Add emoji'
            >
              <span
                className='material-icons'
                style={{ fontSize: '20px' }}
              >
                insert_emoticon
              </span>
            </button>

            {isEmojiPickerOpen && (
              <div
                ref={emojiPickerRef}
                style={{
                  position: 'absolute',
                  bottom: '56px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'white',
                  border: '1px solid #E1E4E8',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  padding: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '4px',
                  zIndex: 20,
                  width: '208px',
                }}
              >
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type='button'
                    style={{
                      fontSize: '24px',
                      padding: '4px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#E9EEFF';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message Input */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type='text'
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Ask about module states...'
              disabled={loading}
              ref={inputRef}
              style={{
                width: '100%',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #E1E4E8',
                fontSize: '14px',
                height: '40px',
                minWidth: 0,
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.3s',
                outline: 'none',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#2D5BFF';
                e.target.style.boxShadow = '0 0 0 2px #E9EEFF';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#E1E4E8';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Send Button */}
          <button
            type='submit'
            disabled={!input.trim() || loading}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              border: 'none',
              backgroundColor: '#2D5BFF',
              color: 'white',
              opacity: !input.trim() || loading ? 0.7 : 1,
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#1a46e0';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#2D5BFF';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
            aria-label='Send Message'
          >
            <span
              className='material-icons'
              style={{ fontSize: '18px' }}
            >
              send
            </span>
          </button>
        </form>
      </footer>
    </div>
  );
};
