import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ItemPosition } from './useSizeMeasurer';

interface VirtualizationConfig {
  chunkSize: number;
  overscan: number;
}

/**
 * 虚拟化计算 Hook (空间分桶版)
 */
export function useVirtualization(positions: ItemPosition[], config: VirtualizationConfig) {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // 1. 建立空间分桶索引 (Chunk Map)
  // Key: 房号 (top / chunkSize), Value: 落在该房间的所有 Item 索引
  const chunksMap = useMemo(() => {
    const map = new Map<number, Set<number>>();
    const { chunkSize } = config;

    positions.forEach((pos, idx) => {
      const startChunk = Math.floor(pos.top / chunkSize);
      const endChunk = Math.floor(pos.bottom / chunkSize);

      for (let c = startChunk; c <= endChunk; c++) {
        if (!map.has(c)) {
          map.set(c, new Set());
        }
        map.get(c)!.add(idx);
      }
    });

    return map;
  }, [positions, config.chunkSize]);

  // 2. 计算当前可见索引数组
  const visibleIndices = useMemo(() => {
    if (viewportHeight === 0) return [];

    const { chunkSize, overscan } = config;
    const startChunk = Math.floor((scrollTop - overscan) / chunkSize);
    const endChunk = Math.floor((scrollTop + viewportHeight + overscan) / chunkSize);

    const indicesSet = new Set<number>();
    for (let c = startChunk; c <= endChunk; c++) {
      const chunk = chunksMap.get(c);
      if (chunk) {
        chunk.forEach((idx) => indicesSet.add(idx));
      }
    }

    // 转换为排序后的数组
    return Array.from(indicesSet).sort((a, b) => a - b);
  }, [chunksMap, scrollTop, viewportHeight, config.overscan, config.chunkSize]);

  // 3. 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    // 使用 requestAnimationFrame 优化，防止高频触发状态更新导致掉帧
    requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
      setViewportHeight(target.clientHeight);
    });
  }, []);

  // 4. 初始化容器尺寸
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      setViewportHeight(containerRef.current.clientHeight);
    }
  }, []);

  return {
    visibleIndices,
    handleScroll,
    containerRef,
    scrollTop,
    viewportHeight,
  };
}
