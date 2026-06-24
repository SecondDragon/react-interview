import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input, Button, Spin, Empty } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import type { SearchResult } from '../types/chat';

interface SearchBarProps {
  onSearch: (keyword: string) => Promise<void>;
  searchResults: SearchResult[];
  isSearching: boolean;
  onSelectResult: (messageId: string) => void;
  onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  searchResults,
  isSearching,
  onSelectResult,
  onClose,
}) => {
  const [keyword, setKeyword] = useState('');
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<any>(null);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    await onSearch(keyword.trim());
    setShowResults(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelect = (messageId: string) => {
    onSelectResult(messageId);
    setShowResults(false);
  };

  const handleClose = () => {
    setKeyword('');
    setShowResults(false);
    onClose();
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#fff',
      }}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: showResults ? 8 : 0 }}>
        <Input
          ref={inputRef}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索聊天记录..."
          prefix={<SearchOutlined />}
          suffix={
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={handleClose}
            />
          }
          style={{ flex: 1 }}
        />
        <Button type="primary" onClick={handleSearch} loading={isSearching}>
          搜索
        </Button>
      </div>

      {showResults && (
        <div
          style={{
            maxHeight: 300,
            overflow: 'auto',
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            marginTop: 8,
          }}
        >
          {isSearching ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Spin />
            </div>
          ) : searchResults.length === 0 ? (
            <Empty description="未找到匹配结果" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            searchResults.map((result) => (
              <div
                key={`${result.messageId}-${result.matchIndex}`}
                onClick={() => handleSelect(result.messageId)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f6ffed';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#8c8c8c',
                    marginBottom: 4,
                  }}
                >
                  {new Date(result.timestamp).toLocaleString('zh-CN')}
                  {' · '}
                  {result.sender === 'user' ? '用户' : 'AI'}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: '#262626',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {result.content.substring(0, 100)}
                  {result.content.length > 100 ? '...' : ''}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
