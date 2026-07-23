import { useMemo, useRef, useCallback, useState, useEffect } from 'react';

export interface WaterfallItem {
  id: string | number;
  title?: string;
  content?: string;
  image?: string;
  color?: string;
  tags?: string[];
}

export interface Position {
  left: number;
  top: number;
  itemHeight: number;
  imageHeight: number;
}

export interface SpatialIndex {
  chunkSize: number;
  chunks: Map<number, Set<number>>;
}

export interface LayoutCache {
  containerWidth: number;
  columns: number;
  gap: number;
  items: WaterfallItem[];
  positions: Position[];
  columnHeights: number[];
  spatialIndex: SpatialIndex;
  imageHeights: Map<number, number>;
  measureVersion: number;
}

interface UseAdaptiveWaterfallOptions {
  defaultImgRatio?: number;
  fixedBodyHeight?: number;
  chunkSize?: number;
}

/**
 * 自适应高度瀑布流 Hook（不完美实现）
 *
 * 核心思路：
 * 1. 图片区域先用 defaultImgRatio 占位，避免卡片在加载前溢出重叠。
 * 2. 图片加载完成后，通过 onImageHeightReport 上报真实图片区域高度。
 * 3. Hook 根据真实图片高度 + 固定文本区域高度，重新计算卡片总高度并重建布局。
 *
 * 为什么不完美？
 * - 图片加载前只能猜测比例，猜测错会导致裁剪或留白。
 * - 多列布局中任何一个图片高度变化都可能影响后续所有 item 的列选择。
 * - 图片加载顺序不确定，布局会反复跳变直到所有图片加载完成。
 */
export function useAdaptiveWaterfall(
  items: WaterfallItem[],
  containerWidth: number,
  columns: number,
  gap: number,
  options: UseAdaptiveWaterfallOptions = {}
) {
  const { defaultImgRatio = 4 / 3, fixedBodyHeight = 100, chunkSize = 800 } = options;

  const cacheRef = useRef<LayoutCache>({
    containerWidth: 0,
    columns: 0,
    gap: 0,
    items: [],
    positions: [],
    columnHeights: [],
    spatialIndex: { chunkSize, chunks: new Map() },
    imageHeights: new Map(),
    measureVersion: 0,
  });

  const [measureVersion, setMeasureVersion] = useState(0);

  const result = useMemo(() => {
    if (containerWidth === 0 || columns <= 0) {
      return {
        positions: [] as Position[],
        containerHeight: 0,
        itemWidth: 0,
        getVisibleIndices: () => [] as number[],
      };
    }

    const cache = cacheRef.current;
    const itemWidth = (containerWidth - (columns - 1) * gap) / columns;
    const defaultImageHeight = itemWidth / defaultImgRatio;

    const currentColumnHeights: number[] = new Array(columns).fill(0);
    const currentPositions: Position[] = [];
    const currentChunks: Map<number, Set<number>> = new Map();

    const imageHeights = cache.imageHeights;

    for (let dataIdx = 0; dataIdx < items.length; dataIdx++) {
      const imageHeight = imageHeights.get(dataIdx) ?? defaultImageHeight;
      const itemHeight = imageHeight + fixedBodyHeight;

      let minHeight = currentColumnHeights[0];
      let minIndex = 0;
      for (let j = 1; j < columns; j++) {
        if (currentColumnHeights[j] < minHeight) {
          minHeight = currentColumnHeights[j];
          minIndex = j;
        }
      }

      const top = minHeight;
      const left = minIndex * (itemWidth + gap);
      const pos: Position = { left, top, itemHeight, imageHeight };

      currentPositions.push(pos);

      const startChunk = Math.floor(top / chunkSize);
      const endChunk = Math.floor((top + itemHeight) / chunkSize);
      for (let c = startChunk; c <= endChunk; c++) {
        if (!currentChunks.has(c)) {
          currentChunks.set(c, new Set());
        }
        currentChunks.get(c)!.add(dataIdx);
      }

      currentColumnHeights[minIndex] = minHeight + itemHeight + gap;
    }

    cacheRef.current = {
      containerWidth,
      columns,
      gap,
      items,
      positions: currentPositions,
      columnHeights: currentColumnHeights,
      spatialIndex: { chunkSize, chunks: currentChunks },
      imageHeights,
      measureVersion,
    };

    const getVisibleIndices = (scrollTop: number, viewportHeight: number, buffer: number) => {
      const visibleIndicesSet = new Set<number>();
      let startChunk = Math.floor((scrollTop - buffer) / chunkSize);
      startChunk = startChunk >= 0 ? startChunk : 0;
      const endChunk = Math.floor((scrollTop + viewportHeight + buffer) / chunkSize);

      for (let c = startChunk; c <= endChunk; c++) {
        const chunkSet = currentChunks.get(c);
        if (chunkSet) {
          chunkSet.forEach((dataIdx) => visibleIndicesSet.add(dataIdx));
        }
      }

      return Array.from(visibleIndicesSet);
    };

    return {
      positions: currentPositions,
      containerHeight: Math.max(...currentColumnHeights, 0),
      itemWidth,
      getVisibleIndices,
    };
  }, [items, containerWidth, columns, gap, defaultImgRatio, fixedBodyHeight, chunkSize, measureVersion]);

  const reportImageHeight = useCallback((dataIdx: number, height: number) => {
    const cache = cacheRef.current;
    const prev = cache.imageHeights.get(dataIdx);
    if (prev === height) return;

    cache.imageHeights.set(dataIdx, height);
    setMeasureVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    return () => {
      cacheRef.current.imageHeights.clear();
    };
  }, []);

  return { ...result, reportImageHeight };
}
