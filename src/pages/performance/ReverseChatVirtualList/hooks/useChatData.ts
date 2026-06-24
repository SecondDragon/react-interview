import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, SearchResult } from '../types/chat';
import { mockChatAPI } from '../api/mockChatAPI';

interface UseChatDataReturn {
  messages: ChatMessage[];
  hasMore: boolean;
  isLoading: boolean;
  isSearching: boolean;
  searchResults: SearchResult[];
  streamingMessageId: string | null;
  isAtBottom: boolean;
  loadMore: () => Promise<void>;
  sendMessage: (content: string) => void;
  searchMessages: (keyword: string) => Promise<void>;
  setIsAtBottom: (value: boolean) => void;
}

export function useChatData(
  conversationId: string,
  containerRef: React.RefObject<HTMLDivElement | null>
): UseChatDataReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const nextPageRef = useRef(1);
  const isLoadingRef = useRef(false);
  const initialLoadedRef = useRef(false);

  // 初始加载：加载第一页（最新数据）
  // 数据按时间倒序存储：messages[0] 是最新的，messages末尾是最旧的
  // column-reverse 中：DOM 最前面 → 视觉底部，DOM 最后面 → 视觉顶部
  // 所以最新消息(messages[0])在视觉底部，历史消息在视觉顶部 ✅
  useEffect(() => {
    if (initialLoadedRef.current) return;
    initialLoadedRef.current = true;

    const loadInitial = async () => {
      setIsLoading(true);
      const result = await mockChatAPI.fetchMessages({
        conversationId,
        page: 1,
        limit: 20,
      });
      
      nextPageRef.current = result.nextPage || 1;
      setHasMore(result.hasMore);
      // API 返回的是正序(旧→新)，需要反转为倒序(新→旧)
      setMessages(result.messages.reverse());
      setIsLoading(false);
      // 不需要手动滚动到底部，column-reverse 会自动处理
    };

    loadInitial();
  }, [conversationId]);

  // 加载更多历史消息（往上滑时触发）
  // 数据是倒序的：messages[0] 最新，messages末尾 最旧
  // 加载更旧的历史 → append 到数组末尾
  // column-reverse 中：DOM 最后面 → 视觉顶部，所以新加载的历史会出现在视觉顶部 ✅
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;
    isLoadingRef.current = true;
    setIsLoading(true);

    const nextPage = nextPageRef.current;
    const result = await mockChatAPI.fetchMessages({
      conversationId,
      page: nextPage,
      limit: 20,
    });

    nextPageRef.current = result.nextPage || nextPage;
    setHasMore(result.hasMore);

    // API 返回正序(旧→新)，反转为倒序(新→旧)后 append 到末尾
    // 这样更旧的历史会出现在数组末尾，在 column-reverse 中显示在视觉顶部
    setMessages((prev) => [...prev, ...result.messages.reverse()]);

    isLoadingRef.current = false;
    setIsLoading(false);
  }, [conversationId, hasMore]);

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage = await mockChatAPI.sendMessage({
        conversationId,
        content,
      });

      // 新消息 prepend 到数组开头
      // 数组是倒序的：开头是最新消息
      // column-reverse 中：DOM 最前面 → 视觉底部
      // 所以新消息会出现在视觉底部 ✅
      setMessages((prev) => [userMessage, ...prev]);

      // 创建 AI 流式消息
      const aiMessageId = `msg-${Date.now()}`;
      const aiMessage: ChatMessage = {
        id: aiMessageId,
        content: '',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        status: 'sent',
        isStreaming: true,
      };

      setMessages((prev) => [aiMessage, ...prev]);
      setStreamingMessageId(aiMessageId);

      // 流式响应
      await mockChatAPI.streamAIResponse((chunk, isDone) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: chunk, isStreaming: !isDone }
              : msg
          )
        );

        if (isDone) {
          setStreamingMessageId(null);
        }
      });
    },
    [conversationId]
  );

  // 搜索消息
  const searchMessages = useCallback(
    async (keyword: string) => {
      setIsSearching(true);
      const results = await mockChatAPI.searchMessages({
        conversationId,
        keyword,
      });
      setSearchResults(results);
      setIsSearching(false);
    },
    [conversationId]
  );

  return {
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
  };
}
