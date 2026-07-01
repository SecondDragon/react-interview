import React, { useState, useTransition } from 'react';
import { Button } from 'antd';

/**
 * 反面教材：在 transition 中同步读取 DOM
 * 读取到的是旧布局高度，结果不可靠
 */
const SyncReadBad: React.FC = () => {
  const [height, setHeight] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      setExpanded((prev) => !prev);
      // ❌ 同步读取 DOM，此时 React 还未提交新高度
      const el = document.getElementById('content-box');
      setHeight(el?.offsetHeight ?? 0);
    });
  };

  return (
    <div>
      <Button onClick={handleToggle}>切换内容</Button>
      <div>读取到的高度：{height}px</div>
      <div id="content-box" style={{ border: '1px solid #ccc', padding: expanded ? 40 : 10 }}>
        {expanded ? '展开后的内容' : '收起后的内容'}
      </div>
    </div>
  );
};

export default SyncReadBad;
