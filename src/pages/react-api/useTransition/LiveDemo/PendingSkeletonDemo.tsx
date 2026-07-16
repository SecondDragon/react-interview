import React, { useState, useTransition, useEffect, useRef } from 'react';
import { Button, Skeleton, Card, Space } from 'antd';
import { HeavyList, HeavyChartContent } from './shared';

const PendingSkeletonDemo: React.FC = () => {
  const [displayView, setDisplayView] = useState<'list' | 'chart' | null>(null);
  const [isPending, startTransition] = useTransition();
  const initialized = useRef(false);

  useEffect(() => {
    startTransition(() => {
      setDisplayView('list');
    });
    initialized.current = true;
  }, []);

  const handleSwitch = (next: 'list' | 'chart') => {
    startTransition(() => setDisplayView(next));
  };

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Button
          onClick={() => handleSwitch('list')}
          type={displayView === 'list' ? 'primary' : 'default'}
        >
          列表视图
        </Button>
        <Button
          onClick={() => handleSwitch('chart')}
          type={displayView === 'chart' ? 'primary' : 'default'}
        >
          图表视图
        </Button>
      </Space>
      {displayView === null ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : isPending ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : displayView === 'list' ? (
        <HeavyList query="数据" count={30000} />
      ) : (
        <HeavyChartContent />
      )}
    </Card>
  );
};

export default PendingSkeletonDemo;
