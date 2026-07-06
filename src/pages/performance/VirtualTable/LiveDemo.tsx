import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Checkbox, Tag, Spin, Empty, Typography } from 'antd';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

const { Text } = Typography;

interface TableData {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  amount: number;
  date: string;
}

const fetchItems = async (cursor: number, limit: number = 5000): Promise<TableData[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return Array.from({ length: limit }, (_, i) => ({
    id: `ID-${cursor + i}`,
    name: `数据条目 ${cursor + i}`,
    status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)] as TableData['status'],
    amount: Math.floor(Math.random() * 1000000),
    date: new Date().toISOString().split('T')[0],
  }));
};

const LiveDemo: React.FC = () => {
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const parentRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const newData = await fetchItems(data.length);
    setData((prev) => [...prev, ...newData]);
    setLoading(false);
  }, [data.length, loading]);

  useEffect(() => {
    loadMore();
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
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
      },
      {
        accessorKey: 'name',
        header: '名称',
        size: 200,
      },
      {
        accessorKey: 'status',
        header: '状态',
        cell: (info) => {
          const statusMap = {
            active: <Tag color="success">活跃</Tag>,
            inactive: <Tag color="error">停用</Tag>,
            pending: <Tag color="warning">待定</Tag>,
          };
          return statusMap[info.getValue() as keyof typeof statusMap];
        },
        size: 120,
      },
      {
        accessorKey: 'amount',
        header: '金额',
        cell: (info) => <Text code>¥{info.getValue() as number}</Text>,
        size: 250,
      },
      {
        accessorKey: 'date',
        header: '日期',
        size: 150,
      },
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
    overscan: 300,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150 && !loading) {
      loadMore();
    }
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          padding: '12px 16px',
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: 6,
        }}
      >
        <Text strong>优化效果：</Text>
        当前加载数据：<Text strong>{data.length}</Text> 条 | 已勾选：
        <Text strong>{Object.keys(rowSelection).length}</Text> 条 | 真实 DOM 渲染：
        <Text strong>{virtualRows.length + 10}</Text> 条 (仅视口内)
      </div>

      <div
        ref={parentRef}
        onScroll={handleScroll}
        style={{
          height: '500px',
          overflow: 'auto',
          position: 'relative',
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: 6,
        }}
      >
        <table
          style={{
            width: table.getTotalSize(),
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            border: '1px solid #f0f0f0',
            boxSizing: 'border-box',
          }}
        >
          <thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              transform: 'translateZ(0)',
              background: '#fafafa',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      width: header.getSize(),
                      fontWeight: 600,
                      borderRight: '1px solid #f0f0f0',
                      borderBottom: '1px solid #f0f0f0',
                      boxSizing: 'border-box',
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
              <td
                colSpan={columns.length}
                style={{ padding: 0, border: 0, position: 'relative' }}
              >
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
                        background: row.getIsSelected() ? '#e6f4ff' : '#fff',
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
                            borderRight: '1px solid #f0f0f0',
                            overflow: 'hidden',
                            boxSizing: 'border-box',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
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

        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '10px',
              background: 'rgba(255,255,255,0.8)',
              position: 'sticky',
              bottom: 0,
            }}
          >
            <Spin tip="正在加载更多大数据..." size="small" />
          </div>
        )}

        {data.length === 0 && !loading && (
          <div style={{ padding: '40px' }}>
            <Empty />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveDemo;
