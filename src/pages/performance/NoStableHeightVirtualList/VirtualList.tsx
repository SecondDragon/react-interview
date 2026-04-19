import React, { useEffect, useRef, memo } from 'react';
import { useSizeMeasurer, ItemPosition } from './useSizeMeasurer';
import { useVirtualization } from './useVirtualization';

export interface VirtualListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  defaultItemHeight?: number;
  chunkSize?: number;
  overscan?: number;
  onEndReached?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 内部列表项容器：负责测量自身高度
 */
const ListItem = memo(({
  index,
  children,
  onMeasure,
  position
}: {
  index: number;
  children: React.ReactNode;
  onMeasure: (index: number, el: HTMLElement) => void;
  position: ItemPosition;
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;

    // 使用 ResizeObserver 监听内容变化
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === el) {
          onMeasure(index, el);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [index, onMeasure]);

  return (
    <div
      ref={itemRef}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        // 使用 transform 实现 GPU 加速定位，并防止布局抖动
        transform: `translate3d(0, ${position.top}px, 0)`,
        // 注意：这里不要设置固定高度，让内容撑开，我们只管测量
      }}
    >
      {children}
    </div>
  );
});

/**
 * 核心组件：动态高度虚拟列表
 */
export function VirtualList<T>({
  data,
  renderItem,
  defaultItemHeight = 100,
  chunkSize = 800,
  overscan = 3000,
  onEndReached,
  isLoading = false,
  hasMore = true,
  className,
  style,
}: VirtualListProps<T>) {
  // 1. 初始化尺寸测量引擎
  const { positions, totalHeight, measureItem } = useSizeMeasurer(data, defaultItemHeight);

  // 2. 初始化虚拟化计算引擎
  const { visibleIndices, handleScroll, containerRef, scrollTop, viewportHeight } = useVirtualization(
    positions,
    { chunkSize, overscan }
  );

  // 3. 触底加载逻辑
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!onEndReached || isLoading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onEndReached();
        }
      },
      { rootMargin: '200px' }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [onEndReached, isLoading, hasMore]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={className}
      style={{
        position: 'relative',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        ...style,
      }}
    >
      {/* 1. 占位容器 (Spacer)：撑开滚动条的总高度 */}
      <div style={{ height: totalHeight, width: '100%', pointerEvents: 'none' }} />

      {/* 2. 列表内容容器：只渲染可见范围内的项 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
        {visibleIndices.map((dataIdx) => {
          const item = data[dataIdx];
          const pos = positions[dataIdx];
          if (!item || !pos) return null;

          return (
            <ListItem
              key={dataIdx} // 使用索引作为 key，因为我们是在池子里复用
              index={dataIdx}
              position={pos}
              onMeasure={measureItem}
            >
              {renderItem(item, dataIdx)}
            </ListItem>
          );
        })}
      </div>

      {/* 3. 触底哨兵 */}
      <div ref={sentinelRef} style={{ height: 1, marginTop: -1 }} />
    </div>
  );
}
