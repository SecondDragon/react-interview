import React, { useState, useRef, useCallback } from 'react';
import { Card, Button, Badge } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';
import SearchBar from './SearchBar';
import { useChatData } from './hooks/useChatData';

const ReverseChatVirtualList: React.FC = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    hasMore,
    isLoading,
    isSearching,
    searchResults,
    streamingMessageId,
    isAtBottom,
    loadMore,
    sendMessage,
    searchMessages,
    setIsAtBottom,
  } = useChatData('conversation-1', containerRef);

  const handleScrollStateChange = useCallback((atBottom: boolean) => {
    setIsAtBottom(atBottom);
  }, [setIsAtBottom]);

  const handleSelectSearchResult = useCallback((messageId: string) => {
    setHighlightedMessageId(messageId);
    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 3000);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
  }, []);

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%", }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>反向虚拟聊天列表（Recycler View 模式）</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge count={messages.length} showZero color="#52c41a" />
              <Button
                type={showSearch ? 'primary' : 'default'}
                icon={<SearchOutlined />}
                onClick={() => setShowSearch(!showSearch)}
              >
                搜索
              </Button>
            </div>
          </div>
        }
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
      >
        {showSearch && (
          <SearchBar
            onSearch={searchMessages}
            searchResults={searchResults}
            isSearching={isSearching}
            onSelectResult={handleSelectSearchResult}
            onClose={handleCloseSearch}
          />
        )}

        <ChatMessageList
          messages={messages}
          hasMore={hasMore}
          isLoading={isLoading}
          highlightedMessageId={highlightedMessageId}
          onLoadMore={loadMore}
          onScrollStateChange={handleScrollStateChange}
          containerRef={containerRef}
        />

        <ChatInput
          onSend={sendMessage}
          disabled={!!streamingMessageId}
        />
      </Card>
    </div>
  );
};

export default ReverseChatVirtualList;
