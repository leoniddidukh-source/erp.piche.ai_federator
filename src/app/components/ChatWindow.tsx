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
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const handleEmojiSelect = (emoji: string) => {
    setInput(prev => `${prev}${emoji}`);
    setIsEmojiPickerOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f7f7f8' }}>
      {/* Module Selector */}
      {(modules.length > 0 || onGetSummary || onRefreshStates) && (
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e5e6',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            backgroundColor: 'white',
          }}
        >
          {modules.length > 0 && onModuleChange && (
            <>
              <label
                htmlFor='module-select'
                style={{ fontSize: '13px', fontWeight: '500', color: '#353740' }}
              >
                Filter by Module:
              </label>
              <select
                id='module-select'
                value={selectedModule}
                onChange={e => onModuleChange(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  border: '1px solid #e5e5e6',
                  backgroundColor: 'white',
                  color: '#353740',
                  minWidth: '150px',
                  cursor: 'pointer',
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
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: '#19c37d',
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
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: '#ab68ff',
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
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f7f7f8',
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
              maxWidth: '768px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '16px', color: '#8e8ea0' }}>🤖</div>
            <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#353740' }}>
              How can I help you today?
            </div>
            <div style={{ fontSize: '14px', maxWidth: '500px', margin: '0 auto', color: '#6e6e80', lineHeight: '1.5' }}>
              Ask me about module states, get summaries, or analyze your module federation architecture.
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              maxWidth: '768px',
              width: '100%',
              padding: '16px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#19c37d',
                color: 'white',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '20px' }}>🤖</span>
            </div>
            <div style={{ fontSize: '16px', color: '#6e6e80' }}>Thinking...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Message Input Box */}
      <footer
        style={{
          padding: '12px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f7f7f8',
        }}
      >
        <form
          onSubmit={handleSend}
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px',
            maxWidth: '768px',
            width: '100%',
            padding: '0 16px',
          }}
        >
          {/* Emoji Picker Button */}
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <button
              type='button'
              data-emoji-button='true'
              onClick={() => setIsEmojiPickerOpen(prev => !prev)}
              disabled={loading}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backgroundColor: 'transparent',
                color: '#6e6e80',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#e5e5e6';
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'transparent';
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
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              border: '1px solid #e5e5e6',
              borderRadius: '24px',
              padding: '12px 16px',
              minHeight: '52px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder='Message AI Assistant...'
              disabled={loading}
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              rows={1}
              style={{
                width: '100%',
                border: 'none',
                fontSize: '16px',
                lineHeight: '1.5',
                minHeight: '24px',
                maxHeight: '200px',
                resize: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: '#353740',
                fontFamily: 'inherit',
                opacity: loading ? 0.5 : 1,
                overflow: 'auto',
              }}
            />
          </div>

          {/* Send Button */}
          <button
            type='submit'
            disabled={!input.trim() || loading}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              border: 'none',
              backgroundColor: !input.trim() || loading ? 'transparent' : '#19c37d',
              color: !input.trim() || loading ? '#6e6e80' : 'white',
              marginBottom: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!e.currentTarget.disabled && input.trim()) {
                e.currentTarget.style.backgroundColor = '#15a169';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.disabled && input.trim()) {
                e.currentTarget.style.backgroundColor = '#19c37d';
              }
            }}
            aria-label='Send Message'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M.5 1.163L1.31.5 15.5 8 1.31 15.5.5 14.837 13.689 8z'
                fill='currentColor'
              />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
};
