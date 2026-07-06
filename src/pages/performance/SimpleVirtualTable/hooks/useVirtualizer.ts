import { useState, useCallback, useRef, useEffect } from 'react';
import { useSizeMeasurer, ItemPosition } from './useSizeMeasurer';
import { useChunkMap } from './useChunkMap';

interface VirtualizerConfig {
  estimateSize: (index: number) => number;
  overscan?: number;
  chunkSize?: number;
}

const defaultConfig = {
  overscan: 300,
  chunkSize: 800,
};

export interface VirtualItem {
  key: string;
  index: number;
  start: number;
  size: number;
}

export function useVirtualizer(count: number, config: VirtualizerConfig) {
  const { estimateSize, overscan, chunkSize } = {
    ...defaultConfig,
    ...config,
  };

  const { positions, totalHeight, initPositions, measureItem } =
    useSizeMeasurer(estimateSize);

  const { getVisibleIndices } = useChunkMap(positions, {
    chunkSize,
    overscan,
  });

  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initPositions(count);
  }, [count, initPositions]);

  useEffect(() => {
    if (containerRef.current) {
      setViewportHeight(containerRef.current.clientHeight);
    }
  }, []);

  const virtualItems: VirtualItem[] = (() => {
    const indices = getVisibleIndices(scrollTop, viewportHeight);
    return indices.map((idx) => {
      const pos = positions[idx];
      if (!pos) return { key: String(idx), index: idx, start: 0, size: 0 };
      return {
        key: String(idx),
        index: idx,
        start: pos.top,
        size: pos.height,
      };
    });
  })();

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const target = e.currentTarget;
      requestAnimationFrame(() => {
        setScrollTop(target.scrollTop);
        if (target.clientHeight !== viewportHeight) {
          setViewportHeight(target.clientHeight);
        }
      });
    },
    [viewportHeight]
  );

  const scrollToIndex = useCallback(
    (index: number, align: 'start' | 'center' | 'end' = 'start') => {
      const pos = positions[index];
      if (!pos || !containerRef.current) return;

      let targetScrollTop: number;
      const { clientHeight } = containerRef.current;

      switch (align) {
        case 'start':
          targetScrollTop = pos.top;
          break;
        case 'center':
          targetScrollTop = pos.top - (clientHeight - pos.height) / 2;
          break;
        case 'end':
          targetScrollTop = pos.bottom - clientHeight;
          break;
      }

      setScrollTop(targetScrollTop);
    },
    [positions]
  );

  return {
    virtualItems,
    totalHeight,
    containerRef,
    handleScroll,
    measureItem,
    scrollToIndex,
  };
}
