import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ChatMessage } from '../types/chat';
import { Avatar, Spin } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';

interface ChatMessageItemProps {
  message: ChatMessage;
  isHighlighted?: boolean;
  style?: React.CSSProperties;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = React.memo(
  ({ message, isHighlighted, style }) => {
    const isUser = message.sender === 'user';

    const formattedTime = useMemo(() => {
      const date = new Date(message.timestamp);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }, [message.timestamp]);

    return (
      <div
        style={{
          ...style,
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          gap: 12,
          padding: '8px 16px',
          transition: isHighlighted ? 'background-color 0.5s ease' : undefined,
          backgroundColor: isHighlighted ? '#fff7e6' : 'transparent',
        }}
      >
        <Avatar
          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
          style={{
            backgroundColor: isUser ? '#1890ff' : '#52c41a',
            flexShrink: 0,
          }}
        />

        <div
          style={{
            maxWidth: '70%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isUser ? 'flex-end' : 'flex-start',
          }}
        >
          <div
            style={{
              backgroundColor: isUser ? '#1890ff' : '#f6ffed',
              color: isUser ? '#fff' : '#262626',
              padding: '12px 16px',
              borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              border: isUser ? 'none' : '1px solid #b7eb8f',
              wordBreak: 'break-word',
            }}
          >
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content || (message.isStreaming ? '' : '\u00A0')}
            </ReactMarkdown>

            {message.isStreaming && (
              <span style={{ display: 'inline-flex', marginLeft: 4, alignItems: 'center' }}>
                <Spin size="small" />
              </span>
            )}
          </div>

          <span
            style={{
              fontSize: 12,
              color: '#bfbfbf',
              marginTop: 4,
              padding: '0 4px',
            }}
          >
            {formattedTime}
          </span>
        </div>
      </div>
    );
  }
);

ChatMessageItem.displayName = 'ChatMessageItem';

export default ChatMessageItem;
