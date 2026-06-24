export type MessageSender = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isStreaming?: boolean;
}

export interface SearchResult {
  messageId: string;
  content: string;
  timestamp: string;
  sender: MessageSender;
  matchIndex: number;
}

export interface FetchMessagesParams {
  conversationId: string;
  cursor: string | null;
  limit: number;
}

export interface FetchMessagesResponse {
  messages: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface SearchMessagesParams {
  conversationId: string;
  keyword: string;
}

export interface SendMessageParams {
  conversationId: string;
  content: string;
}

export interface VisibleMessage {
  message: ChatMessage;
  top: number;
  height: number;
  slotIndex: number;
}

export interface MessagePosition {
  top: number;
  height: number;
}

export interface SpatialIndex {
  chunkSize: number;
  chunks: Map<number, Set<string>>;
}

export interface LayoutCache {
  messages: ChatMessage[];
  positions: MessagePosition[];
  spatialIndex: SpatialIndex;
  totalHeight: number;
}
