import React, { useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from './hooks/useVirtualizer';
import { useTableModel, ColumnDef } from './hooks/useTableModel';

export interface VirtualTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (item: T, index: number) => string;
  estimateSize?: (index: number) => number;
  overscan?: number;
  chunkSize?: number;
  containerHeight?: number;
  onEndReached?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

interface ColumnStyle {
  flex?: number | string;
  width?: number;
  minWidth?: number;
}

const defaultEstimateSize = () => 48;

export function VirtualTable<T>({
  data,
  columns,
  getRowId,
  estimateSize = defaultEstimateSize,
  overscan = 300,
  chunkSize = 800,
  containerHeight = 500,
  onEndReached,
  isLoading,
  hasMore,
}: VirtualTableProps<T>) {
  const table = useTableModel({ data, columns, getRowId });
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { virtualItems, totalHeight, containerRef, handleScroll, measureItem } =
    useVirtualizer(data.length, { estimateSize, overscan, chunkSize });

  const hasFlexColumns = useMemo(
    () => columns.some((col) => col.flex !== undefined && col.flex > 0),
    [columns]
  );

  const columnStyles = useMemo(() => {
    return columns.map((col) => {
      if (hasFlexColumns && col.flex !== undefined && col.flex > 0) {
        const style: ColumnStyle = {
          flex: col.flex,
          minWidth: col.minWidth || 80,
        };
        return style;
      }
      const style: ColumnStyle = {
        flex: `0 0 ${col.width || 120}px` as unknown as number,
        width: col.width || 120,
      };
      return style;
    });
  }, [columns, hasFlexColumns]);

  useEffect(() => {
    if (!onEndReached || !hasMore || isLoading) return;
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onEndReached();
        }
      },
      { root: container, rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onEndReached, isLoading, hasMore, containerRef]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        border: '1px solid #f0f0f0',
        borderRadius: 6,
        background: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          zIndex: 2,
          background: '#fafafa',
          borderBottom: '1px solid #f0f0f0',
          transform: 'translateZ(0)',
        }}
      >
        <div style={{ display: 'flex', minHeight: 48 }}>
          {table.headerGroups.map((header, idx) => (
            <div
              key={header.id}
              style={{
                padding: '12px 16px',
                fontWeight: 600,
                fontSize: 14,
                color: '#262626',
                borderRight: '1px solid #f0f0f0',
                boxSizing: 'border-box',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                ...columnStyles[idx],
              }}
            >
              {header.id === '__select__' && (
                <input
                  type="checkbox"
                  checked={table.isAllSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = table.isSomeSelected;
                    }
                  }}
                  onChange={table.toggleAll}
                  style={{ cursor: 'pointer' }}
                />
              )}
              {header.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map((virtualRow) => {
          const row = table.rows[virtualRow.index];
          if (!row) return null;

          return (
            <VirtualRow
              key={virtualRow.key}
              virtualRow={virtualRow}
              cells={row.cells}
              columnStyles={columnStyles}
              isSelected={table.getIsSelected(row.id)}
              onToggle={() => table.toggleRow(row.id)}
              onMeasure={measureItem}
            />
          );
        })}
      </div>

      {isLoading && (
        <div
          style={{
            textAlign: 'center',
            padding: '12px',
            color: '#8c8c8c',
            fontSize: 13,
          }}
        >
          加载更多数据中...
        </div>
      )}

      {!hasMore && data.length > 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '12px',
            color: '#bfbfbf',
            fontSize: 13,
          }}
        >
          已加载全部 {data.length} 条数据
        </div>
      )}

      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
}

interface VirtualRowProps {
  virtualRow: { key: string; index: number; start: number; size: number };
  cells: React.ReactNode[];
  columnStyles: ColumnStyle[];
  isSelected: boolean;
  onToggle: () => void;
  onMeasure: (index: number, el: HTMLElement | null) => void;
}

const VirtualRow = React.memo(function VirtualRow({
  virtualRow,
  cells,
  columnStyles,
  isSelected,
  onToggle,
  onMeasure,
}: VirtualRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      onMeasure(virtualRow.index, el);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [virtualRow.index, onMeasure]);

  return (
    <div
      ref={rowRef}
      data-index={virtualRow.index}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: virtualRow.size,
        transform: `translateY(${virtualRow.start}px)`,
        display: 'flex',
        alignItems: 'center',
        background: isSelected ? '#e6f4ff' : '#fff',
        borderBottom: '1px solid #f0f0f0',
        transition: 'background-color 0.15s',
      }}
    >
      {cells.map((cell, colIdx) => {
        const isCheckbox = colIdx === 0;
        return (
          <div
            key={colIdx}
            style={{
              padding: '0 16px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
              borderRight: '1px solid #f0f0f0',
              fontSize: 14,
              color: '#434343',
              ...columnStyles[colIdx],
            }}
          >
            {isCheckbox ? (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggle}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              cell
            )}
          </div>
        );
      })}
    </div>
  );
});
