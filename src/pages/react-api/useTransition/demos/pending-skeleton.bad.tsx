import React, { useState } from 'react';
import { Button } from 'antd';

/**
 * 反面教材：切换视图时直接白屏等待
 */
const PendingSkeletonBad: React.FC = () => {
  const [view, setView] = useState<'list' | 'chart'>('list');

  const handleSwitch = (next: 'list' | 'chart') => {
    // ❌ 同步切换视图，直接卡死直到渲染完成
    setView(next);
  };

  return (
    <div>
      <Button onClick={() => handleSwitch('list')}>列表视图</Button>
      <Button onClick={() => handleSwitch('chart')}>图表视图</Button>
      {view === 'list' ? <HeavyList /> : <HeavyChart />}
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

export default PendingSkeletonBad;
