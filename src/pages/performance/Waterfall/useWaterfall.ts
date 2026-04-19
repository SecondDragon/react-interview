import { useMemo, useRef } from 'react';

/**
 * 瀑布流布局的核心计算 Hook - 增量算法版
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

export interface Position {
  left: number;
  top: number;
  itemHeight: number;
  scaledImgHeight: number;
}

/**
 * 缓存接口：用于记录上一次计算的“中间态”，实现增量更新
 */
interface LayoutCache {
  containerWidth: number;
  columns: number;
  gap: number;
  items: WaterfallItem[];
  positions: Position[];
  columnHeights: number[];
}
/* eslint-disable react-hooks/exhaustive-deps */
export function useWaterfall(
  items: WaterfallItem[],
  containerWidth: number,
  columns: number,
  gap: number
) {
  // 【关键优化：缓存引用】
  // 我们使用 useRef 来持久化存储上一次的布局状态。
  // 只要布局参数（宽、列、间距）没变，我们就只计算新增加的 item。
  const cacheRef = useRef<LayoutCache>({
    containerWidth: 0,
    columns: 0,
    gap: 0,
    items: [],
    positions: [],
    columnHeights: [],
  });

  return useMemo(() => {
    // 边界条件：如果容器还没有准备好，直接返回初始状态
    if (containerWidth === 0 || columns <= 0) {
      return { positions: [], containerHeight: 0, itemWidth: 0 };
    }

    const cache = cacheRef.current;

    // 1. 判断是否需要“彻底重算” (全量计算)
    // 场景：容器宽度变了、列数变了、间距变了、或者数据被清空/重置了
    const isParamChanged =
      containerWidth !== cache.containerWidth || columns !== cache.columns || gap !== cache.gap;

    // 如果 items 是被重置了（比如下拉刷新，第一条数据变了或者长度变小了），也要重算
    const isItemsReset =
      items.length === 0 ||
      (cache.items.length > 0 && items[0]?.id !== cache.items[0]?.id) ||
      items.length < cache.items.length;

    let startIndex = 0;
    let currentColumnHeights: number[] = new Array(columns).fill(0);
    let currentPositions: Position[] = [];

    // 2. 尝试进入“增量模式”
    if (!isParamChanged && !isItemsReset && items.length >= cache.items.length) {
      // 完美契合增量条件：布局参数没变，且是在老数据后面追加新数据
      startIndex = cache.items.length; // 从老数据的下一条开始算
      currentColumnHeights = [...cache.columnHeights]; // 继承之前的“阵地高度”
      currentPositions = [...cache.positions]; // 继承之前的坐标缓存

      // 如果新老数据长度一样，说明没有任何变化，直接返回缓存
      if (startIndex === items.length) {
        return {
          positions: cache.positions,
          containerHeight: Math.max(...cache.columnHeights, 0),
          itemWidth: (containerWidth - (columns - 1) * gap) / columns,
        };
      }
    }

    // 3. 开始核心布局逻辑 (可能是从 0 开始，也可能是从 startIndex 开始)
    const calculatedItemWidth = (containerWidth - (columns - 1) * gap) / columns;

    for (let i = startIndex; i < items.length; i++) {
      const item = items[i];

      // 【核心算法】：找出当前 6 列中，哪一列目前最矮
      let minHeight = currentColumnHeights[0];
      let minIndex = 0;

      for (let j = 1; j < columns; j++) {
        if (currentColumnHeights[j] < minHeight) {
          minHeight = currentColumnHeights[j];
          minIndex = j;
        }
      }

      // 计算当前卡片的高度 (图片比例高度 + 预估文本高度)
      const scaledImgHeight =
        item.imgWidth > 0 ? (calculatedItemWidth / item.imgWidth) * item.imgHeight : 100;
      const fixedHeight = 80;
      const itemHeight = scaledImgHeight + fixedHeight;

      // 确定坐标：top 就是最矮列的当前高度，left 是列索引 * (宽 + 间距)
      const top = minHeight;
      const left = minIndex * (calculatedItemWidth + gap);

      currentPositions.push({ left, top, itemHeight, scaledImgHeight });

      // 【阵地推进】：更新这一列的高度，供下一条数据参考
      currentColumnHeights[minIndex] = minHeight + itemHeight + gap;
    }

    // 4. 更新缓存，为下一次“增量更新”做准备
    cacheRef.current = {
      containerWidth,
      columns,
      gap,
      items,
      positions: currentPositions,
      columnHeights: currentColumnHeights,
    };

    // 找出最高的那一列，即为容器的总高度
    const maxHeight = Math.max(...currentColumnHeights, 0);

    return {
      positions: currentPositions,
      containerHeight: maxHeight,
      itemWidth: calculatedItemWidth,
    };
  }, [items, containerWidth, columns, gap]);
}
/* eslint-enable react-hooks/exhaustive-deps */
