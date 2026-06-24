import type { ChatMessage } from '../types/chat';
import { generateAllPages, generateDynamicPage, getTotalPages } from '../data/generator';

// 预置数据存储
const PRESET_DATA: Record<string, ChatMessage[]> = generateAllPages();
const TOTAL_PRESET = getTotalPages();

interface FetchMessagesParams {
  conversationId: string;
  page: number; // 页码，1 表示最新
  limit: number;
}

interface FetchMessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextPage: number | null;
}

interface SearchMessagesParams {
  conversationId: string;
  keyword: string;
}

interface SendMessageParams {
  conversationId: string;
  content: string;
}

// 实时消息存储（发送的新消息）
const REALTIME_MESSAGES: ChatMessage[] = [];

export const mockChatAPI = {
  async fetchMessages(params: FetchMessagesParams): Promise<FetchMessagesResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const { page } = params;
    const messages: ChatMessage[] = [];

    // 获取预置数据
    if (page <= TOTAL_PRESET) {
      const pageKey = page.toString();
      if (PRESET_DATA[pageKey]) {
        messages.push(...PRESET_DATA[pageKey]);
      }
    } else {
      // 超出预置页码，动态生成
      messages.push(...generateDynamicPage(page));
    }

    const hasMore = page < TOTAL_PRESET + 10; // 假设还有10页动态数据
    const nextPage = hasMore ? page + 1 : null;

    return {
      messages,
      hasMore,
      nextPage,
    };
  },

  async fetchLatestMessages(limit: number): Promise<ChatMessage[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 获取最新的消息（第1页 + 实时消息）
    const latestPage = PRESET_DATA['1'] || [];
    const allMessages = [...latestPage, ...REALTIME_MESSAGES];
    
    return allMessages.slice(-limit);
  },

  async searchMessages(params: SearchMessagesParams): Promise<{ messageId: string; content: string; timestamp: string; sender: 'user' | 'ai'; matchIndex: number }[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const keyword = params.keyword.toLowerCase();
    const results: { messageId: string; content: string; timestamp: string; sender: 'user' | 'ai'; matchIndex: number }[] = [];

    // 搜索所有预置数据
    Object.values(PRESET_DATA).forEach((pageMessages) => {
      pageMessages.forEach((msg) => {
        const content = msg.content.toLowerCase();
        let index = content.indexOf(keyword);
        while (index !== -1) {
          results.push({
            messageId: msg.id,
            content: msg.content,
            timestamp: msg.timestamp,
            sender: msg.sender,
            matchIndex: index,
          });
          index = content.indexOf(keyword, index + 1);
        }
      });
    });

    // 搜索实时消息
    REALTIME_MESSAGES.forEach((msg) => {
      const content = msg.content.toLowerCase();
      let index = content.indexOf(keyword);
      while (index !== -1) {
        results.push({
          messageId: msg.id,
          content: msg.content,
          timestamp: msg.timestamp,
          sender: msg.sender,
          matchIndex: index,
        });
        index = content.indexOf(keyword, index + 1);
      }
    });

    return results.slice(0, 20);
  },

  async sendMessage(params: SendMessageParams): Promise<ChatMessage> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const newMessage: ChatMessage = {
      id: `msg-realtime-${Date.now()}`,
      content: params.content,
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    REALTIME_MESSAGES.push(newMessage);
    return newMessage;
  },

  async streamAIResponse(
    onChunk: (chunk: string, isDone: boolean) => void
  ): Promise<ChatMessage> {
    const responses = [
      '这是一个很好的问题！',
      '关于反向虚拟列表的实现，核心在于**滚动位置的保持**。',
      '当新数据 prepend 到顶部时，我们需要记录加载前的 `scrollHeight` 和 `scrollTop`。',
      '然后在数据插入后，计算高度差并调整 `scrollTop`。',
      '这样就可以实现用户无感知的加载体验。',
    ];

    let fullContent = '';
    for (const chunk of responses) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      fullContent += chunk;
      onChunk(fullContent, false);
    }

    onChunk(fullContent, true);

    const aiMessage: ChatMessage = {
      id: `msg-realtime-${Date.now() + 1}`,
      content: fullContent,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    REALTIME_MESSAGES.push(aiMessage);
    return aiMessage;
  },
};
