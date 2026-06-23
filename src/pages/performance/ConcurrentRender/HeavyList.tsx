import React, { memo } from 'react';

/**
 * 一个故意写得很沉重的组件，用于模拟复杂渲染
 */
const HeavyItem: React.FC<{ text: string; index: number }> = ({ text, index }) => {
  // 模拟一些计算开销
  const startTime = performance.now();
  while (performance.now() - startTime < 1) {
    // 人为阻塞 1ms，模拟复杂组件的计算逻辑
  }

  return (
    <div
      style={{
        padding: '10px',
        margin: '4px',
        backgroundColor: '#f0f2f5',
        borderRadius: '4px',
        border: '1px solid #d9d9d9',
        fontSize: '12px',
      }}
    >
      <span>#{index} - 匹配项: </span>
      <b style={{ color: '#1890ff' }}>{text}</b>
    </div>
  );
};

const MemoizedHeavyItem = memo(HeavyItem);

interface HeavyListProps {
  query: string;
}

const HeavyList: React.FC<HeavyListProps> = ({ query }) => {
  // 生成 5000 条模拟数据
  const items = React.useMemo(() => {
    const list = [];
    for (let i = 0; i < 5000; i++) {
      list.push(`数据条目 ${i} - 内容: ${Math.random().toString(36).substring(7)}`);
    }
    return list;
  }, []);

  // 过滤数据
  const filteredItems = items.filter((item) => item.includes(query));

  if (query === '') {
    return (
      <div style={{ color: '#999', textAlign: 'center', marginTop: 40 }}>
        请输入关键词开始体验卡顿（或并发）对比...
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ marginBottom: 10, color: '#666' }}>
        找到 {filteredItems.length} 条匹配结果（渲染每条需耗时约1ms）
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '8px',
        }}
      >
        {filteredItems.map((item, index) => (
          <MemoizedHeavyItem key={index} text={item} index={index} />
        ))}
      </div>
    </div>
  );
};

export default memo(HeavyList);
