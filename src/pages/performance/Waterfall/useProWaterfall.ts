import { useMemo, useRef } from 'react';

/**
 * 瀑布流数据项接口
 */
export interface WaterfallItem {
  id: string | number;
  imgUrl: string;
  imgWidth: number;
  imgHeight: number;
  title: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * 计算后的位置信息接口
 */
export interface Position {
  left: number;
  top: number;
  itemHeight: number;
  scaledImgHeight: number;
}

/**
 * 空间索引表接口
 * 核心原理：将纵向无限高的页面划分为一个个固定高度的“房间（Chunk）”
 * 房间里记录了哪些卡片路过了这里。
 */
export interface SpatialIndex {
  chunkSize: number; // 每个房间的高度（例如 800px）
  chunks: Map<number, Set<number>>; // 房号 (ChunkID) -> 卡片索引集合 (Set<ItemIndex>)
}

/**
 * 内部缓存结构
 * 用于实现增量更新，避免重复计算老数据
 */
export interface LayoutCache {
  containerWidth: number;
  columns: number;
  gap: number;
  items: WaterfallItem[];
  positions: Position[];
  columnHeights: number[];
  spatialIndex: SpatialIndex;
}

/**
 * 瀑布流专业版 Hook：空间索引算法版 (Spatial Indexing)
 * 对标小红书、Pinterest 等海量数据场景。
 *
 * 执行逻辑分为两部分：
 * 1. 【建表阶段】：计算坐标的同时，把卡片登记到对应的“空间房间”里。
 * 2. 【检索阶段】：提供一个 getVisibleIndices 函数，实现 O(1) 级的可见项查找。
 */

/* eslint-disable react-hooks/exhaustive-deps */
export function useProWaterfall(
  items: WaterfallItem[],
  containerWidth: number,
  columns: number,
  gap: number
) {
  // 持久化存储计算结果和空间表
  const cacheRef = useRef<LayoutCache>({
    containerWidth: 0,
    columns: 0,
    gap: 0,
    items: [],
    positions: [],
    columnHeights: [],
    spatialIndex: { chunkSize: 800, chunks: new Map() },
  });

  return useMemo(() => {
    // 基础检查：如果容器宽度还没出来，返回空
    if (containerWidth === 0 || columns <= 0) {
      return {
        positions: [],
        containerHeight: 0,
        itemWidth: 0,
        getVisibleIndices: () => [],
      };
    }

    const cache = cacheRef.current;
    const CHUNK_SIZE = 1000; // 空间划分粒度

    // ---------------------------------------------------------
    // 第一步：判断是否需要【增量更新】还是【全量重算】
    // ---------------------------------------------------------
    const isParamChanged =
      containerWidth !== cache.containerWidth || columns !== cache.columns || gap !== cache.gap;

    // 如果第一条数据变了，或者数据变少了，说明是刷新或重置，需要全量计算
    const isItemsReset =
      items.length === 0 ||
      (cache.items.length > 0 && items[0]?.id !== cache.items[0]?.id) ||
      items.length < cache.items.length;

    let startIndex = 0;
    let currentColumnHeights: number[] = new Array(columns).fill(0);
    let currentPositions: Position[] = [];
    let currentChunks: Map<number, Set<number>> = new Map();

    // 如果条件允许，开启增量模式，直接从缓存的末尾继续算
    if (!isParamChanged && !isItemsReset && items.length >= cache.items.length) {
      startIndex = cache.items.length;
      currentColumnHeights = [...cache.columnHeights]; // 继承之前每一列的高度
      currentPositions = [...cache.positions]; // 继承已有的坐标
      currentChunks = new Map(cache.spatialIndex.chunks); // 继承已有的空间索引
    }

    const calculatedItemWidth = (containerWidth - (columns - 1) * gap) / columns;

    // ---------------------------------------------------------
    // 第二步：核心布局计算 + 空间索引登记 (The Build Phase)
    // ---------------------------------------------------------
    for (let dataIdx = startIndex; dataIdx < items.length; dataIdx++) {
      const item = items[dataIdx];

      // 1. 经典瀑布流逻辑：找出目前最短的那一列
      let minHeight = currentColumnHeights[0];
      let minIndex = 0;
      for (let j = 1; j < columns; j++) {
        if (currentColumnHeights[j] < minHeight) {
          minHeight = currentColumnHeights[j];
          minIndex = j;
        }
      }

      // 2. 根据图片比例算出在当前定宽下的真实高度
      const scaledImgHeight =
        item.imgWidth > 0 ? (calculatedItemWidth / item.imgWidth) * item.imgHeight : 100;
      const fixedHeight = 80; // 文字和内边距占用的固定高度
      const itemHeight = scaledImgHeight + fixedHeight;

      // 3. 确定最终物理坐标，把这一条新的加到最短的那一列里面
      const top = minHeight;
      const left = minIndex * (calculatedItemWidth + gap);
      const pos = { left, top, itemHeight, scaledImgHeight };

      currentPositions.push(pos);

      // 4. 【空间索引关键动作】：
      // 计算这个卡片的“头”在哪间房，“脚”在哪间房
      const startChunk = Math.floor(top / CHUNK_SIZE);
      const endChunk = Math.floor((top + itemHeight) / CHUNK_SIZE);

      // 把这张卡片的索引 dataIdx 登记到它经过的所有房间里
      // 这里大概率会有重复,但我们并不在乎,因为后面我们实际计算的时候 其实是会给它去重的。
      for (let c = startChunk; c <= endChunk; c++) {
        if (!currentChunks.has(c)) {
          currentChunks.set(c, new Set());
        }
        currentChunks.get(c)!.add(dataIdx);
      }
      // console.log('currentChunks',currentChunks)
      // 5. 更新该列的水位线高度
      currentColumnHeights[minIndex] = minHeight + itemHeight + gap;
    }

    // 更新缓存引用，供下一次渲染使用
    cacheRef.current = {
      containerWidth,
      columns,
      gap,
      items,
      positions: currentPositions,
      columnHeights: currentColumnHeights,
      spatialIndex: { chunkSize: CHUNK_SIZE, chunks: currentChunks },
    };

    // ---------------------------------------------------------
    // 第三步：定义【极速检索函数】(The Query Phase)
    // ---------------------------------------------------------
    /**
     * 该函数被 UI 层调用，复杂度为 O(1) ~ O(房间内元素数)
     * 它直接从 Map 里按房号取索引，完全不需要看 5000 条数据的数组
     */
    const getVisibleIndices = (scrollTop: number, viewportHeight: number, buffer: number) => {
      const visibleIndicesSet = new Set<number>();
      // debugger;

      // 算出当前视口（加上缓冲区）覆盖了哪几个房间
      let startChunk = Math.floor((scrollTop - buffer) / CHUNK_SIZE);
      startChunk = startChunk >= 0 ? startChunk : 0;
      const endChunk = Math.floor((scrollTop + viewportHeight + buffer) / CHUNK_SIZE);

      // 只需要把这几个房间里的住户全喊出来就行了！
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
      itemWidth: calculatedItemWidth,
      getVisibleIndices,
    };
  }, [items, containerWidth, columns, gap]);
}

/* eslint-enable react-hooks/exhaustive-deps */
