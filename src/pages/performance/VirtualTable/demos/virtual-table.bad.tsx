/**
 * 反面教材：无虚拟化的全量渲染
 *
 * 问题：一次性渲染所有 DOM，导致页面卡死
 */
import React, { useState, useEffect } from 'react';

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

const BadVirtualTable: React.FC = () => {
  const [data, setData] = useState<TableData[]>([]);

  useEffect(() => {
    fetchAll().then(setData);
  }, []);

  return (
    <div style={{ height: 500, overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0, background: '#fafafa' }}>
          <tr>
            <th style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>ID</th>
            <th style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>名称</th>
            <th style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>金额</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: 12 }}>{row.id}</td>
              <td style={{ padding: 12 }}>{row.name}</td>
              <td style={{ padding: 12 }}>¥{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BadVirtualTable;
