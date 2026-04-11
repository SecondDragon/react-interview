import { useMemo } from 'react';

/**
 * 瀑布流布局的核心计算 Hook
 *
 * 瀑布流布局的概念：
 * 瀑布流是一种常见的网页布局方式。它的特点是每个小模块（卡片）的宽度是固定的，但是高度是不同的（就像一条条小溪）。
 * 当模块排列时，它不会像传统的网格布局那样强制对齐每一行，而是“哪一列目前最短，下一个模块就放在哪一列的下面”。
 * 这样就可以做到空间利用率最大化，没有大片空白。
 *
 * 这个 Hook 的主要作用就是根据容器宽度、列数等参数，计算出每一个卡片应该在的绝对位置 (top, left)，
 * 并且计算出每个小项的动态宽度，从而让 React 渲染出真正的瀑布流效果。
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

export function useWaterfall(
  items: WaterfallItem[],
  containerWidth: number,
  columns: number, // 固定列数，例如 6 列
  gap: number
) {
  // 我们使用 useMemo 来做同步计算，代替之前的 useEffect + setState，
  // 这样不仅避免了不必要的重新渲染（setState synchronously in effect），性能也会更好。
  return useMemo(() => {
    // 边界条件：如果容器还没有准备好，或者没有数据，直接返回初始状态
    if (containerWidth === 0 || items.length === 0 || columns <= 0) {
      return { positions: [], containerHeight: 0, itemWidth: 0 };
    }

    const calculatedItemWidth = (containerWidth - (columns - 1) * gap) / columns;
    const currentColumnHeights = new Array(columns).fill(0);
    const currentPositions: Position[] = [];

    // 这里由于我们改为了 useMemo，每次 items 改变都会重新全量计算。
    // 如果 items 数据量极大（比如成千上万条），这里可能会成为性能瓶颈，
    // 但在常规业务场景下（比如滚动加载几百条数据），现代浏览器的计算速度是极快的，可以忽略不计。
    // 为了保持代码的简洁性和避免复杂的 ref 状态管理，这里采用全量计算。
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // 找出当前列高度数组中，最小的高度值
      let minHeight = currentColumnHeights[0];
      let minIndex = 0; // 最矮列的索引

      for (let j = 1; j < columns; j++) {
        if (currentColumnHeights[j] < minHeight) {
          minHeight = currentColumnHeights[j];
          minIndex = j;
        }
      }

      // 【核心动态高度计算】
      // 图片按比例缩放后的高度 = (固定列宽 / 图片原始宽) * 图片原始高
      // 如果发生除 0 错误（例如数据异常），给一个默认底边 100
      const scaledImgHeight = item.imgWidth > 0 ? (calculatedItemWidth / item.imgWidth) * item.imgHeight : 100;
      
      // 卡片其余部分的固定高度（例如 padding 16px*2、标题文本等）。这里加起来预估约 80px。
      const fixedHeight = 80;
      const itemHeight = scaledImgHeight + fixedHeight;

      // 计算 top：就是最矮那一列的当前高度
      const top = minHeight;
      // 计算 left：就是最矮列的索引 * (卡片宽 + 间距)
      const left = minIndex * (calculatedItemWidth + gap);

      currentPositions.push({ left, top, itemHeight, scaledImgHeight });

      // 更新最矮的那一列的高度：加上新卡片真实计算出的高度，以及一个间距的高度，供下一个卡片计算使用
      currentColumnHeights[minIndex] = minHeight + itemHeight + gap;
    }

    // 找出最高的那一列，它的高度就是整个瀑布流容器的高度
    const maxHeight = Math.max(...currentColumnHeights);

    return {
      positions: currentPositions,
      containerHeight: maxHeight,
      itemWidth: calculatedItemWidth
    };
  }, [items, containerWidth, columns, gap]);
}
