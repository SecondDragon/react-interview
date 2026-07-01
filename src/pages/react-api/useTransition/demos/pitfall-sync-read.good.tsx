import React, { useState, useTransition, useEffect, useRef } from 'react';
import { Button } from 'antd';

/**
 * 最佳实践：在 useEffect 中读取 DOM
 * 等 transition 提交后再读取，保证拿到最新布局
 */
const SyncReadGood: React.FC = () => {
  const [height, setHeight] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [, startTransition] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    startTransition(() => {
      // ✅ 只负责触发状态更新
      setExpanded((prev) => !prev);
    });
  };

  useEffect(() => {
    // ✅ 在提交后读取 DOM，拿到的是最新高度
    setHeight(boxRef.current?.offsetHeight ?? 0);
  }, [expanded]);

  return (
    <div>
      <Button onClick={handleToggle}>切换内容</Button>
      <div>读取到的高度：{height}px</div>
      <div
        ref={boxRef}
        id="content-box"
        style={{ border: '1px solid #ccc', padding: expanded ? 40 : 10 }}
      >
        {expanded ? '展开后的内容' : '收起后的内容'}
      </div>
    </div>
  );
};

export default SyncReadGood;
