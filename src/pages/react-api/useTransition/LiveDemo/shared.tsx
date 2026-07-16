import React from 'react';

export const HeavyList: React.FC<{ query: string; count?: number }> = ({ query, count = 30000 }) => {
  if (query === '') {
    return <div style={{ color: '#999', textAlign: 'center', marginTop: 40 }}>请输入关键词开始体验...</div>;
  }

  const items = React.useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push(`数据条目 ${i} - 内容: ${Math.random().toString(36).substring(7)}`);
    }
    return list;
  }, [count]);

  const filtered = items.filter((item) => item.includes(query));

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 10, color: '#666' }}>找到 {filtered.length} 条匹配结果</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '8px',
          maxHeight: 320,
          overflow: 'auto',
        }}
      >
        {filtered.map((item, index) => (
          <div
            key={index}
            style={{
              padding: '8px',
              backgroundColor: '#f0f2f5',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            #{index} - {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export const HeavyTabContent: React.FC = () => {
  const list = Array.from({ length: 3000 }, (_, i) => i);
  return (
    <div style={{ maxHeight: 300, overflow: 'auto' }}>
      {list.map((i) => (
        <div key={i} style={{ padding: 4, borderBottom: '1px solid #eee' }}>
          复杂行 {i}
        </div>
      ))}
    </div>
  );
};

export const HeavyChartContent: React.FC = () => {
  const points = Array.from({ length: 30000 }, (_, i) => i);
  return (
    <div style={{ maxHeight: 300, overflow: 'auto' }}>
      {points.map((i) => (
        <div key={i} style={{ padding: 4, borderBottom: '1px solid #eee' }}>
          图表点 {i}
        </div>
      ))}
    </div>
  );
};
