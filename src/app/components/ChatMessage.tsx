import type { FC } from 'react';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
}

export const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const isUserMessage = message.role === 'user';
  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        maxWidth: '80%',
        marginLeft: isUserMessage ? 'auto' : '0',
        flexDirection: isUserMessage ? 'row-reverse' : 'row',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {/* Message Avatar */}
      {!isUserMessage && (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '12px',
            flexShrink: 0,
            backgroundColor: '#F5F7FA',
            color: '#2C3E50',
          }}
        >
          🤖
        </div>
      )}

      {/* Message Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {/* Sender Name (Only for incoming messages) */}
        {!isUserMessage && (
          <div
            style={{
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '2px',
              color: '#6C7A89',
            }}
          >
            AI Assistant
          </div>
        )}

        {/* Message Bubble */}
        <div
          style={{
            padding: '10px 16px',
            borderRadius: '18px',
            fontSize: '14px',
            maxWidth: '100%',
            wordBreak: 'break-word',
            ...(isUserMessage
              ? {
                  backgroundColor: '#2D5BFF',
                  color: 'white',
                  borderTopRightRadius: '4px',
                }
              : {
                  backgroundColor: '#F5F7FA',
                  color: '#2C3E50',
                  borderTopLeftRadius: '4px',
                }),
          }}
        >
          {/* Message Text */}
          <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.content}</p>
        </div>

        {/* Message Meta (Time) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            marginTop: '2px',
            marginLeft: 'auto',
            color: isUserMessage ? '#e0e0e0' : '#6C7A89',
          }}
        >
          {timeString}
        </div>
      </div>
    </div>
  );
};
