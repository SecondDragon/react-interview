import { useMemo, useRef, useCallback } from 'react';
import type { ChatMessage, MessagePosition, SpatialIndex, LayoutCache } from '../types/chat';

const POOL_SIZE = 80;
const CHUNK_SIZE = 800;
const OVERSCAN = 5;

interface UseReverseVirtualListOptions {
  messages: ChatMessage[];
  containerWidth: number;
}

interface UseReverseVirtualListReturn {
  visibleMessages: {
    message: ChatMessage;
    top: number;
    height: number;
    slotIndex: number;
    messageIndex: number;
  }[];
  containerHeight: number;
  getVisibleRange: (scrollTop: number, viewportHeight: number) => { start: number; end: number };
}

export function useReverseVirtualList(options: UseReverseVirtualListOptions): UseReverseVirtualListReturn {
  const { messages, containerWidth } = options;

  const cacheRef = useRef<LayoutCache>({
    messages: [],
    positions: [],
    spatialIndex: { chunkSize: CHUNK_SIZE, chunks: new Map() },
    totalHeight: 0,
  });

  const { positions, containerHeight, spatialIndex } = useMemo(() => {
    if (containerWidth === 0 || messages.length === 0) {
      return { positions: [], containerHeight: 0, spatialIndex: { chunkSize: CHUNK_SIZE, chunks: new Map() } };
    }

    const cache = cacheRef.current;

    const isReset =
      messages.length === 0 ||
      cache.messages.length === 0 ||
      messages[0].id !== cache.messages[0].id ||
      messages.length < cache.messages.length;

    let startIndex = 0;
    let currentPositions: MessagePosition[] = [];
    let currentChunks: Map<number, Set<string>> = new Map();

    if (!isReset && messages.length >= cache.messages.length) {
      startIndex = cache.messages.length;
      currentPositions = [...cache.positions];
      currentChunks = new Map(cache.spatialIndex.chunks);
    }

    for (let i = startIndex; i < messages.length; i++) {
      const height = 80; // 预估高度，实际渲染后会测量
      const top = i === 0 ? 0 : currentPositions[i - 1].top + currentPositions[i - 1].height;

      currentPositions.push({ top, height });

      const startChunk = Math.floor(top / CHUNK_SIZE);
      const endChunk = Math.floor((top + height) / CHUNK_SIZE);
      for (let c = startChunk; c <= endChunk; c++) {
        if (!currentChunks.has(c)) {
          currentChunks.set(c, new Set());
        }
        currentChunks.get(c)!.add(messages[i].id);
      }
    }

    const totalHeight = currentPositions.length > 0
      ? currentPositions[currentPositions.length - 1].top + currentPositions[currentPositions.length - 1].height
      : 0;

    cacheRef.current = {
      messages,
      positions: currentPositions,
      spatialIndex: { chunkSize: CHUNK_SIZE, chunks: currentChunks },
      totalHeight,
    };

    return {
      positions: currentPositions,
      containerHeight: totalHeight,
      spatialIndex: { chunkSize: CHUNK_SIZE, chunks: currentChunks },
    };
  }, [messages, containerWidth]);

  const getVisibleRange = useCallback((scrollTop: number, viewportHeight: number) => {
    let start = 0;
    let end = messages.length - 1;

    for (let i = 0; i < positions.length; i++) {
      if (positions[i].top + positions[i].height >= scrollTop) {
        start = Math.max(0, i - OVERSCAN);
        break;
      }
    }

    for (let i = start; i < positions.length; i++) {
      if (positions[i].top > scrollTop + viewportHeight) {
        end = Math.min(messages.length - 1, i + OVERSCAN - 1);
        break;
      }
    }

    return { start, end };
  }, [positions, messages.length]);

  const visibleMessages = useMemo(() => {
    return positions.map((pos, index) => ({
      message: messages[index],
      top: pos.top,
      height: pos.height,
      slotIndex: index % POOL_SIZE,
      messageIndex: index,
    }));
  }, [positions, messages]);

  return {
    visibleMessages,
    containerHeight,
    getVisibleRange,
  };
}
