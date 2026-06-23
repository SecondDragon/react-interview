import { useRef, useState, useCallback, useEffect } from 'react';

export interface ItemPosition {
  index: number;
  top: number;
  height: number;
  bottom: number;
}

/**
 * 动态高度测量 Hook
 * 核心职责：维护一个位置信息数组，处理高度突变，并提供纠偏能力
 */
export function useSizeMeasurer<T>(data: T[], defaultItemHeight: number) {
  // 核心数据结构：存储每个 Item 的物理尺寸和位置
  const positionsRef = useRef<ItemPosition[]>([]);
  // 撑开容器的总高度，由于需要触发 React 渲染 Spacer，所以使用 State
  const [totalHeight, setTotalHeight] = useState(0);

  /**
   * 初始化/扩展位置信息
   * 当数据源 data 增加时，为新增项填充“预估高度”
   */
  const initPositions = useCallback(() => {
    const prevLength = positionsRef.current.length;
    const newDataLength = data.length;

    if (newDataLength > prevLength) {
      const lastItem = positionsRef.current[prevLength - 1];
      let startTop = lastItem ? lastItem.bottom : 0;

      const newPositions: ItemPosition[] = [];
      for (let i = prevLength; i < newDataLength; i++) {
        newPositions.push({
          index: i,
          top: startTop,
          height: defaultItemHeight,
          bottom: startTop + defaultItemHeight,
        });
        startTop += defaultItemHeight;
      }

      positionsRef.current = [...positionsRef.current, ...newPositions];
      setTotalHeight(startTop);
    } else if (newDataLength < prevLength) {
      // 如果数据减少（如重置），则截断
      positionsRef.current = positionsRef.current.slice(0, newDataLength);
      const last = positionsRef.current[positionsRef.current.length - 1];
      setTotalHeight(last ? last.bottom : 0);
    }
  }, [data.length, defaultItemHeight]);

  useEffect(() => {
    initPositions();
  }, [initPositions]);

  /**
   * 更新特定索引项的高度，并平移后续所有项的位置
   * @param index 发生尺寸变化的项索引
   * @param height 测得的真实高度
   */
  const updateItemHeight = useCallback((index: number, height: number) => {
    const pos = positionsRef.current[index];
    if (!pos || pos.height === height) return;

    const heightDiff = height - pos.height;
    pos.height = height;
    pos.bottom = pos.top + height;

    // 关键点：该项之后的所有项，Top 和 Bottom 都需要偏移
    for (let i = index + 1; i < positionsRef.current.length; i++) {
      positionsRef.current[i].top = positionsRef.current[i - 1].bottom;
      positionsRef.current[i].bottom = positionsRef.current[i].top + positionsRef.current[i].height;
    }

    // 更新 Spacer 高度
    const lastItem = positionsRef.current[positionsRef.current.length - 1];
    setTotalHeight(lastItem ? lastItem.bottom : 0);
  }, []);

  /**
   * ResizeObserver 回调处理函数
   */
  const measureItem = useCallback(
    (index: number, element: HTMLElement) => {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      if (rect.height > 0) {
        updateItemHeight(index, rect.height);
      }
    },
    [updateItemHeight]
  );

  return {
    positions: positionsRef.current,
    totalHeight,
    measureItem,
  };
}
