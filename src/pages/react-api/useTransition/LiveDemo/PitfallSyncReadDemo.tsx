import React, { useState, useTransition, useEffect, useRef } from 'react';
import { Button, Card, Space } from 'antd';

const PitfallSyncReadDemo: React.FC = () => {
  const [height, setHeight] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [, startTransition] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);

  const handleBadClick = () => {
    startTransition(() => {
      setExpanded((prev) => !prev);
      const el = document.getElementById('pitfall-box');
      setHeight(el?.offsetHeight ?? 0);
    });
  };

  const handleGoodClick = () => {
    startTransition(() => {
      setExpanded((prev) => !prev);
    });
  };

  useEffect(() => {
    setHeight(boxRef.current?.offsetHeight ?? 0);
  }, [expanded]);

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={handleBadClick}>错误：transition 内同步读取</Button>
        <Button type="primary" onClick={handleGoodClick}>
          正确：useEffect 中读取
        </Button>
      </Space>
      <div>读取到的高度：{height}px</div>
      <div
        ref={boxRef}
        id="pitfall-box"
        style={{ border: '1px solid #ccc', padding: expanded ? 40 : 10, marginTop: 16 }}
      >
        {expanded ? '展开后的内容' : '收起后的内容'}
      </div>
    </Card>
  );
};

export default PitfallSyncReadDemo;
