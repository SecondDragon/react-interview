import React, { useRef, useEffect } from 'react';
import { Spin } from 'antd';
import ChatMessageItem from './ChatMessageItem';
import type { ChatMessage } from './types/chat';

interface ChatMessageListProps {
  messages: ChatMessage[];
  hasMore: boolean;
  isLoading: boolean;
  highlightedMessageId: string | null;
  onLoadMore: () => void;
  onScrollStateChange: (isAtBottom: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  hasMore,
  isLoading,
  highlightedMessageId,
  onLoadMore,
  onScrollStateChange,
  containerRef,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 滚动监听
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const st = container.scrollTop;
      const maxScrollTop = container.scrollHeight - container.clientHeight;
      
      // column-reverse 中：
      // - scrollTop = 0 → 视觉底部（最新消息）
      // - scrollTop = max → 视觉顶部（历史消息）
      // 当 scrollTop 接近 max（接近视觉顶部）时，触发加载历史
      if (st > maxScrollTop - 50 && hasMore && !isLoading) {
        onLoadMore();
      }

      // 检测是否在视觉底部（最新消息方向）
      // scrollTop 接近 0 表示在视觉底部
      const isAtBottom = st < 50;
      onScrollStateChange(isAtBottom);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, hasMore, isLoading, onLoadMore, onScrollStateChange]);

  // IntersectionObserver 监听哨兵
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;

    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { root: container, rootMargin: '100px' }
    );
    ob.observe(sentinel);
    return () => ob.disconnect();
  }, [hasMore, isLoading, onLoadMore, containerRef]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column-reverse', // 核心：反向排列
      }}
    >
      {/* 消息列表 - 按时间倒序排列：messages[0] 最新，messages末尾 最旧 */}
      {/* column-reverse 中：DOM 最前面 → 视觉底部，DOM 最后面 → 视觉顶部 */}
      {/* 所以最新消息显示在视觉底部，历史消息显示在视觉顶部 ✅ */}
      {messages.map((message) => (
        <ChatMessageItem
          key={message.id}
          message={message}
          isHighlighted={message.id === highlightedMessageId}
        />
      ))}

      {/* 加载指示器 - 在 column-reverse 中，这个会显示在顶部（视觉顶部，即历史消息方向） */}
      {isLoading && (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Spin tip="加载历史消息..." />
        </div>
      )}

      {/* 哨兵 - 用于触发加载更多 */}
      {/* 在 column-reverse 中，这个会显示在顶部（视觉顶部，即历史消息方向） */}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
};

export default ChatMessageList;