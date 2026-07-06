/**
 * 最佳实践：使用 TanStack Table + TanStack Virtual 实现虚拟化
 *
 * 核心思路：
 * 1. useReactTable 负责数据模型、列定义、勾选逻辑
 * 2. useVirtualizer 负责计算哪些行应该渲染在视口内
 * 3. 通过 transform: translateY 将虚拟行定位到正确位置
 */
import React, { useState, useRef, useEffect } from 'react';
import { Checkbox } from 'antd';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

interface TableData {
  id: string;
  name: string;
  amount: number;
}

const fetchAll = async (): Promise<TableData[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return Array.from({ length: 10000 }, (_, i) => ({
    id: `ID-${i}`,
    name: `数据条目 ${i}`,
    amount: Math.floor(Math.random() * 1000000),
  }));
};

const GoodVirtualTable: React.FC = () => {
  const [data, setData] = useState<TableData[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAll().then(setData);
  }, []);

  const columns = React.useMemo<ColumnDef<TableData>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        size: 50,
      },
      { accessorKey: 'id', header: 'ID', size: 100 },
      { accessorKey: 'name', header: '名称', size: 200 },
      { accessorKey: 'amount', header: '金额', size: 150 },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div ref={parentRef} style={{ height: 500, overflow: 'auto', position: 'relative' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: '#fafafa' }}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    width: header.getSize(),
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          <tr style={{ height: `${totalSize}px`, border: 0 }}>
            <td colSpan={columns.length} style={{ padding: 0, border: 0, position: 'relative' }}>
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <div
                    key={virtualRow.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div
                        key={cell.id}
                        style={{
                          padding: '0 16px',
                          width: cell.column.getSize(),
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          overflow: 'hidden',
                          boxSizing: 'border-box',
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                );
              })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default GoodVirtualTable;
