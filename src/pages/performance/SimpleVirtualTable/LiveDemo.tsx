import React, { useState, useRef, useCallback } from 'react';
import { VirtualTable } from './VirtualTable';
import type { ColumnDef } from './hooks/useTableModel';

interface TableItem {
  id: string;
  name: string;
  amount: number;
  date: string;
}

const mockFetch = async (page: number, limit: number): Promise<TableItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return Array.from({ length: limit }, (_, i) => ({
    id: `ID-${page * limit + i}`,
    name: `数据条目 ${page * limit + i}`,
    amount: Math.floor(Math.random() * 1000000),
    date: new Date(
      Date.now() - Math.floor(Math.random() * 30 * 86400000)
    ).toLocaleDateString('zh-CN'),
  }));
};

const columns: ColumnDef<TableItem>[] = [
  { id: '__select__', header: '', accessor: () => null, width: 48 },
  { id: 'id', header: 'ID', accessor: (row) => row.id, flex: 1, minWidth: 80 },
  { id: 'name', header: '名称', accessor: (row) => row.name, flex: 2, minWidth: 120 },
  {
    id: 'amount',
    header: '金额',
    accessor: (row) => `¥${row.amount.toLocaleString()}`,
    flex: 1,
    minWidth: 100,
  },
  { id: 'date', header: '日期', accessor: (row) => row.date, width: 130 },
];

const TOTAL_PAGES = 30;
const PAGE_SIZE = 500;

const LiveDemo: React.FC = () => {
  const [data, setData] = useState<TableItem[]>([]);
  const [isUILoading, setIsUILoading] = useState(false);
  const [isUIHasMore, setIsUIHasMore] = useState(true);

  const pageRef = useRef(0);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;

    isLoadingRef.current = true;
    setIsUILoading(true);

    const nextPage = pageRef.current + 1;
    const newData = await mockFetch(nextPage, PAGE_SIZE);

    pageRef.current = nextPage;

    if (nextPage >= TOTAL_PAGES || newData.length === 0) {
      hasMoreRef.current = false;
      setIsUIHasMore(false);
    }

    setData((prev) => [...prev, ...newData]);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isLoadingRef.current = false;
        setIsUILoading(false);
      });
    });
  }, []);

  const handleReset = useCallback(() => {
    pageRef.current = 0;
    isLoadingRef.current = false;
    hasMoreRef.current = true;
    setIsUILoading(false);
    setIsUIHasMore(true);
    setData([]);

    requestAnimationFrame(() => {
      loadMore();
    });
  }, [loadMore]);

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          padding: '12px 16px',
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: 6,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          当前数据：<strong>{data.length}</strong> 条
          {isUILoading && (
            <span style={{ marginLeft: 12, color: '#1890ff' }}>⏳ 加载中...</span>
          )}
        </div>
        <button
          onClick={handleReset}
          style={{
            padding: '4px 16px',
            background: '#1890ff',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          重置并重新加载
        </button>
      </div>

      <VirtualTable
        data={data}
        columns={columns}
        getRowId={(item) => item.id}
        estimateSize={() => 48}
        onEndReached={loadMore}
        isLoading={isUILoading}
        hasMore={isUIHasMore}
        containerHeight={500}
      />

      <div
        style={{
          marginTop: 12,
          padding: '8px 16px',
          background: '#fafafa',
          borderRadius: 6,
          fontSize: 13,
          color: '#8c8c8c',
        }}
      >
        💡 提示：滚动到底部触发无限加载，每页加载 {PAGE_SIZE} 条，共{' '}
        {TOTAL_PAGES * PAGE_SIZE} 条数据。勾选框使用原生 checkbox 实现。
      </div>
    </div>
  );
};

export default LiveDemo;
