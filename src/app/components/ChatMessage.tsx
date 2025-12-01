import type { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
}

export const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const isUserMessage = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        padding: '16px 0',
        justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          maxWidth: '768px',
          width: '100%',
          padding: '0 16px',
          flexDirection: isUserMessage ? 'row-reverse' : 'row',
        }}
      >
        {/* Message Avatar */}
        {!isUserMessage && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '16px',
              flexShrink: 0,
              backgroundColor: '#19c37d',
              color: 'white',
            }}
          >
            <span style={{ fontSize: '20px' }}>🤖</span>
          </div>
        )}

        {isUserMessage && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '16px',
              flexShrink: 0,
              backgroundColor: '#ab68ff',
              color: 'white',
            }}
          >
            <span style={{ fontSize: '18px' }}>U</span>
          </div>
        )}

        {/* Message Content */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          {/* Message Bubble */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              fontSize: '16px',
              lineHeight: '1.75',
              wordBreak: 'break-word',
              ...(isUserMessage
                ? {
                    backgroundColor: '#f7f7f8',
                    color: '#353740',
                  }
                : {
                    backgroundColor: 'transparent',
                    color: '#353740',
                  }),
            }}
          >
            {/* Message Text - Render markdown for assistant messages */}
            {isUserMessage ? (
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.content}</p>
            ) : (
              <div
                style={{
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Style headings
                    h1: ({ node: _node, ...props }) => (
                      <h1
                        style={{ fontSize: '20px', fontWeight: '600', marginTop: '12px', marginBottom: '8px' }}
                        {...props}
                      />
                    ),
                    h2: ({ node: _node, ...props }) => (
                      <h2
                        style={{ fontSize: '18px', fontWeight: '600', marginTop: '10px', marginBottom: '6px' }}
                        {...props}
                      />
                    ),
                    h3: ({ node: _node, ...props }) => (
                      <h3
                        style={{ fontSize: '16px', fontWeight: '600', marginTop: '8px', marginBottom: '4px' }}
                        {...props}
                      />
                    ),
                    // Style paragraphs
                    p: ({ node: _node, ...props }) => (
                      <p
                        style={{ margin: '8px 0', lineHeight: '1.6' }}
                        {...props}
                      />
                    ),
                    // Style lists
                    ul: ({ node: _node, ...props }) => (
                      <ul
                        style={{ margin: '8px 0', paddingLeft: '20px' }}
                        {...props}
                      />
                    ),
                    ol: ({ node: _node, ...props }) => (
                      <ol
                        style={{ margin: '8px 0', paddingLeft: '20px' }}
                        {...props}
                      />
                    ),
                    li: ({ node: _node, ...props }) => (
                      <li
                        style={{ margin: '4px 0' }}
                        {...props}
                      />
                    ),
                    // Style code blocks
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    code: ({ node: _node, className, ...props }: any) => {
                      const isInline = !className;

                      return isInline ? (
                        <code
                          style={{
                            backgroundColor: isUserMessage ? 'rgba(0,0,0,0.1)' : '#f0f0f0',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            color: isUserMessage ? '#353740' : '#353740',
                          }}
                          {...props}
                        />
                      ) : (
                        <code
                          style={{
                            display: 'block',
                            backgroundColor: '#f0f0f0',
                            color: '#353740',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            overflowX: 'auto',
                            margin: '8px 0',
                            border: '1px solid #e5e5e6',
                          }}
                          {...props}
                        />
                      );
                    },
                    pre: ({ node: _node, ...props }) => (
                      <pre
                        style={{
                          margin: '8px 0',
                          overflowX: 'auto',
                        }}
                        {...props}
                      />
                    ),
                    // Style blockquotes
                    blockquote: ({ node: _node, ...props }) => (
                      <blockquote
                        style={{
                          borderLeft: `3px solid ${isUserMessage ? 'rgba(255,255,255,0.5)' : '#19c37d'}`,
                          paddingLeft: '12px',
                          margin: '8px 0',
                          fontStyle: 'italic',
                          opacity: 0.9,
                        }}
                        {...props}
                      />
                    ),
                    // Style links
                    a: ({ node: _node, ...props }) => (
                      <a
                        style={{
                          color: isUserMessage ? '#8e8ea0' : '#19c37d',
                          textDecoration: 'underline',
                        }}
                        target='_blank'
                        rel='noopener noreferrer'
                        {...props}
                      />
                    ),
                    // Style tables
                    table: ({ node: _node, ...props }) => (
                      <table
                        style={{
                          borderCollapse: 'collapse',
                          width: '100%',
                          margin: '8px 0',
                          fontSize: '13px',
                        }}
                        {...props}
                      />
                    ),
                    th: ({ node: _node, ...props }) => (
                      <th
                        style={{
                          border: `1px solid ${isUserMessage ? 'rgba(255,255,255,0.3)' : '#E1E4E8'}`,
                          padding: '8px',
                          textAlign: 'left',
                          backgroundColor: isUserMessage ? 'rgba(255,255,255,0.1)' : '#F5F7FA',
                          fontWeight: '600',
                        }}
                        {...props}
                      />
                    ),
                    td: ({ node: _node, ...props }) => (
                      <td
                        style={{
                          border: `1px solid ${isUserMessage ? 'rgba(255,255,255,0.3)' : '#E1E4E8'}`,
                          padding: '8px',
                        }}
                        {...props}
                      />
                    ),
                    // Style horizontal rules
                    hr: ({ node: _node, ...props }) => (
                      <hr
                        style={{
                          border: 'none',
                          borderTop: `1px solid ${isUserMessage ? 'rgba(255,255,255,0.3)' : '#E1E4E8'}`,
                          margin: '12px 0',
                        }}
                        {...props}
                      />
                    ),
                    // Style strong and emphasis
                    strong: ({ node: _node, ...props }) => (
                      <strong
                        style={{ fontWeight: '600' }}
                        {...props}
                      />
                    ),
                    em: ({ node: _node, ...props }) => (
                      <em
                        style={{ fontStyle: 'italic' }}
                        {...props}
                      />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
