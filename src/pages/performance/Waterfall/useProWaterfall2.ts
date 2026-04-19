import { useMemo, useRef } from 'react';
import { type LayoutCache, type Position, type WaterfallItem } from './useProWaterfall.ts';

const CHUNK_SIZE = 800;

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
    spatialIndex: { chunkSize: CHUNK_SIZE, chunks: new Map() },
  });

  return useMemo(() => {
    /**
     * 首先 当数据还没有获取到的时候 我们应该返回什么
     */

    if (containerWidth === 0 || items.length === 0 || columns === 0) {
      return {
        positions: [],
        itemWidth: 0,
        containerWidth: 0,
        getVisibleIndices: () => [],
      };
    }
    const cache = cacheRef.current;
    /**
     * 当首位的id变了，或者是现在没有了，或者是相比于缓存减少了就是更改-刷新-删除
     */
    const isItemsReset =
      items.length === 0 ||
      cache.items.length > items.length ||
      (cache.items.length > 0 && items[0].id !== cache.items[0].id);
    /**
     * 说明配置改了，位置需要重新计算
     */
    const isParamsChange =
      containerWidth !== cache.containerWidth || cache.columns !== columns || cache.gap !== gap;
    // 循环计算的初始位置
    let startIndex = 0;
    // 每列的高度的数组,存放每列当前的高度
    let currentColumnHeights: number[] = new Array(columns).fill(0);
    let currentPositions: Position[] = [];
    let currentChunks: Map<number, Set<number>> = new Map();

    /**
     * 如果数据没有重置，修改，那么就可以使用旧的位置，不在重新计算
     * 只计算新增数据的位置
     */
    if (!isParamsChange && !isItemsReset && cache.items.length <= items.length) {
      startIndex = cache.items.length;
      currentColumnHeights = [...cache.columnHeights]; // 继承之前每一列的高度
      currentPositions = [...cache.positions]; // 继承已有的坐标
      currentChunks = new Map(cache.spatialIndex.chunks); // 继承已有的空间索引
    }

    /**
     * 确定itemWidth
     */
    const calculatedItemWidth = (containerWidth - (columns - 1) * gap) / columns;

    /**
     * 从最新数据开始循环计算位置
     */
    for (let i = startIndex; i < items.length; i++) {
      const item = items[i];

      // 计算上一轮每列高度的最小值所在的列
      // 经典瀑布流逻辑：找出目前最短的那一列
      let minIndex = 0;
      let minHeight = currentColumnHeights[0];

      for (let j = 1; j < currentColumnHeights.length; j++) {
        if (minHeight > currentColumnHeights[j]) {
          minHeight = currentColumnHeights[j];
          minIndex = j;
        }
      }
      // 2. 根据图片比例算出在当前定宽下的真实高度
      const scaledImgHeight: number =
        item.imgWidth > 0 ? (calculatedItemWidth / item.imgWidth) * item.imgHeight : 100;
      const fixedHeight = 80; // 文字和内边距占用的固定高度
      const itemHeight = scaledImgHeight + fixedHeight;

      //   现在已经找出来最短的列的序号了,可以算出left的偏移量了
      const left = minIndex * (calculatedItemWidth + gap);
      // top 偏移量就是最短值
      const top = minHeight;

      // const pos = ｛ left, top, itemHeight, scaledImgHeight｝;
      const pos = { left, top, itemHeight, scaledImgHeight };
      currentPositions.push(pos);
      currentColumnHeights[minIndex] = top + itemHeight + gap;

      /**
       * 开始分片
       */
      // 4. 【空间索引关键动作】：
      // 计算这个卡片的“头”在哪间房，“脚”在哪间房
      const startChunk = Math.floor(top / CHUNK_SIZE);
      const endChunk = Math.floor((top + itemHeight) / CHUNK_SIZE);
      // 这样可以保证，一个数据在多个分片里面，之后无论拿到哪个分片 这个数据都必然能够渲染出来
      // 当然在这里面会有重复 但是后面我们从分片里面取数据的时候是会做去重的
      for (let j = startChunk; j <= endChunk; j++) {
        // 如果当前缓存里没有分片j，那就创建
        if (!currentChunks.has(j)) {
          currentChunks.set(j, new Set());
        }
        // 这里是把顺序i放进去
        currentChunks.get(j)!.add(i);
      }
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

    const getVisibleIndices = (scrollTop: number, viewportHeight: number, buffer: number) => {
      const visibleIndicesSet = new Set<number>();
      // debugger;
      // 算出当前视口（加上缓冲区）覆盖了哪几个房间(chunk)
      let startChunk = Math.floor((scrollTop - buffer) / CHUNK_SIZE);
      startChunk = startChunk >= 0 ? startChunk : 0;
      const endChunk = Math.floor((scrollTop + viewportHeight + buffer) / CHUNK_SIZE);

      // 只需要把这几个房间里的住户全喊出来就行了！
      for (let c = startChunk; c <= endChunk; c++) {
        const chunkSet = currentChunks.get(c);
        if (chunkSet) {
          chunkSet.forEach((idx) => visibleIndicesSet.add(idx));
        }
      }
      // console.log('Array.from(visibleIndicesSet);', Array.from(visibleIndicesSet));
      return Array.from(visibleIndicesSet);
    };

    return {
      positions: currentPositions,
      containerHeight: Math.max(...currentColumnHeights, 0),
      itemWidth: calculatedItemWidth,
      getVisibleIndices,
    };
  }, [gap, items, containerWidth, columns]);
}

/* eslint-enable react-hooks/exhaustive-deps */
