import { useMemo, useState, useCallback } from 'react';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  width?: number;
  flex?: number;
  minWidth?: number;
}

export interface RowData {
  id: string;
  cells: React.ReactNode[];
  originalIndex: number;
}

export interface HeaderCell {
  id: string;
  label: string;
  width: number | undefined;
  flex: number | undefined;
  minWidth: number | undefined;
}

interface UseTableModelOptions<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (item: T, index: number) => string;
}

export function useTableModel<T>({ data, columns, getRowId }: UseTableModelOptions<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const rows: RowData[] = useMemo(() => {
    return data.map((item, index) => ({
      id: getRowId(item, index),
      cells: columns.map((col) => col.accessor(item)),
      originalIndex: index,
    }));
  }, [data, columns, getRowId]);

  const headerGroups: HeaderCell[] = useMemo(() => {
    return columns.map((col) => ({
      id: col.id,
      label: col.header,
      width: col.width,
      flex: col.flex,
      minWidth: col.minWidth,
    }));
  }, [columns]);

  const totalWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + (col.width || 0), 0);
  }, [columns]);

  const isAllSelected = useMemo(() => {
    return data.length > 0 && selectedIds.size === data.length;
  }, [data.length, selectedIds.size]);

  const isSomeSelected = useMemo(() => {
    return selectedIds.size > 0 && selectedIds.size < data.length;
  }, [data.length, selectedIds.size]);

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === data.length && data.length > 0) {
        return new Set();
      }
      return new Set(rows.map((r) => r.id));
    });
  }, [data.length, rows]);

  const getIsSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  return {
    rows,
    headerGroups,
    totalWidth,
    selectedIds,
    isAllSelected,
    isSomeSelected,
    toggleRow,
    toggleAll,
    getIsSelected,
  };
}
