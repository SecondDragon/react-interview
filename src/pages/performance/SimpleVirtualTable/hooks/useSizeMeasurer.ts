import { useRef, useState, useCallback } from 'react';

export interface ItemPosition {
  index: number;
  top: number;
  height: number;
  bottom: number;
}

export function useSizeMeasurer(estimateSize: (index: number) => number) {
  const positionsRef = useRef<ItemPosition[]>([]);
  const [totalHeight, setTotalHeight] = useState(0);

  const initPositions = useCallback(
    (count: number) => {
      const prevLength = positionsRef.current.length;
      if (count > prevLength) {
        const lastItem = positionsRef.current[prevLength - 1];
        let startTop = lastItem ? lastItem.bottom : 0;

        const newPositions: ItemPosition[] = [];
        for (let i = prevLength; i < count; i++) {
          const h = estimateSize(i);
          newPositions.push({
            index: i,
            top: startTop,
            height: h,
            bottom: startTop + h,
          });
          startTop += h;
        }

        positionsRef.current = [...positionsRef.current, ...newPositions];
        setTotalHeight(startTop);
      } else if (count < prevLength) {
        positionsRef.current = positionsRef.current.slice(0, count);
        const last = positionsRef.current[positionsRef.current.length - 1];
        setTotalHeight(last ? last.bottom : 0);
      }
    },
    [estimateSize]
  );

  const updateItemHeight = useCallback((index: number, height: number) => {
    const pos = positionsRef.current[index];
    if (!pos || pos.height === height) return;

    const heightDiff = height - pos.height;
    pos.height = height;
    pos.bottom = pos.top + height;

    for (let i = index + 1; i < positionsRef.current.length; i++) {
      positionsRef.current[i].top = positionsRef.current[i - 1].bottom;
      positionsRef.current[i].bottom =
        positionsRef.current[i].top + positionsRef.current[i].height;
    }

    const lastItem = positionsRef.current[positionsRef.current.length - 1];
    setTotalHeight(lastItem ? lastItem.bottom : 0);
  }, []);

  const measureItem = useCallback(
    (index: number, element: HTMLElement | null) => {
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
    initPositions,
    measureItem,
    updateItemHeight,
  };
}
