import React, { useState, useTransition } from 'react';
import { Button, Skeleton } from 'antd';

/**
 * 最佳实践：使用 isPending 显示骨架屏
 * 切换视图时先展示骨架屏，渲染完成后再替换真实内容
 */
const PendingSkeletonGood: React.FC = () => {
  const [displayView, setDisplayView] = useState<'list' | 'chart'>('list');
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (next: 'list' | 'chart') => {
    // ✅ 复杂视图渲染放入 transition
    startTransition(() => {
      setDisplayView(next);
    });
  };

  return (
    <div>
      <Button onClick={() => handleSwitch('list')}>列表视图</Button>
      <Button onClick={() => handleSwitch('chart')}>图表视图</Button>
      {isPending ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : displayView === 'list' ? (
        <HeavyList />
      ) : (
        <HeavyChart />
      )}
    </div>
  );
};

const HeavyList: React.FC = () => {
  const items = Array.from({ length: 1500 }, (_, i) => i);
  return (
    <div>
      {items.map((i) => (
        <div key={i}>列表项 {i}</div>
      ))}
    </div>
  );
};

const HeavyChart: React.FC = () => {
  const points = Array.from({ length: 1500 }, (_, i) => i);
  return (
    <div>
      {points.map((i) => (
        <div key={i}>图表点 {i}</div>
      ))}
    </div>
  );
};

export default PendingSkeletonGood;
