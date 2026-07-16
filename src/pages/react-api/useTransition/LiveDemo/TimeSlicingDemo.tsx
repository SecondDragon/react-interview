import React, { useState, useEffect } from 'react';
import { Button, Tag, Input, Card } from 'antd';

const TimeSlicingDemo: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [slices, setSlices] = useState<{ start: number; end: number; yielded: boolean }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const totalNodes = 60;
  const nodesPerSlice = 10;

  useEffect(() => {
    if (!running) return;

    let current = 0;
    const newSlices: { start: number; end: number; yielded: boolean }[] = [];

    const runSlice = () => {
      if (current >= totalNodes) {
        setProgress(100);
        setRunning(false);
        return;
      }

      const start = current;
      const end = Math.min(current + nodesPerSlice, totalNodes);
      const shouldYield = Math.random() > 0.5;
      newSlices.push({ start, end, yielded: shouldYield });
      setSlices([...newSlices]);
      current = end;
      setProgress(Math.floor((current / totalNodes) * 100));

      if (shouldYield) {
        setTimeout(runSlice, 300);
      } else {
        runSlice();
      }
    };

    runSlice();

    return () => {
      current = totalNodes;
    };
  }, [running]);

  const handleStart = () => {
    setSlices([]);
    setProgress(0);
    setRunning(true);
  };

  return (
    <Card title="时间切片可视化">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="动画播放时尝试输入，观察主线程是否被释放"
        style={{ marginBottom: 16 }}
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          marginBottom: 16,
          padding: 12,
          background: '#f5f5f5',
          borderRadius: 8,
        }}
      >
        {Array.from({ length: totalNodes }, (_, i) => {
          const slice = slices.find((s) => s.start <= i && i < s.end);
          let background = '#d9d9d9';
          if (slice) {
            background = slice.yielded ? '#52c41a' : '#1890ff';
          }
          return (
            <div
              key={i}
              style={{
                width: 20,
                height: 20,
                background,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: '#fff',
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 16 }}>
        <Tag color="blue">蓝色</Tag> 表示当前切片连续执行
        <Tag color="green" style={{ marginLeft: 8 }}>绿色</Tag> 表示该切片执行后让出主线程
        <Tag color="default" style={{ marginLeft: 8 }}>灰色</Tag> 表示尚未执行
      </div>

      <div style={{ marginBottom: 16 }}>
        进度：{progress}% | 已让出次数：{slices.filter((s) => s.yielded).length}
      </div>

      <Button type="primary" onClick={handleStart} disabled={running}>
        {running ? '切片执行中...' : '开始模拟时间切片'}
      </Button>
    </Card>
  );
};

export default TimeSlicingDemo;
