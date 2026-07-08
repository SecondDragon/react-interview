import React, { useRef, useState } from 'react';
import { Card, Typography, Input, Tag } from 'antd';

const { Text } = Typography;

/**
 * IME 输入锁效果对比互动演示
 */
const IMELiveDemo: React.FC = () => {
  const [standardVal, setStandardVal] = useState('');
  const [imeLockedVal, setImeLockedVal] = useState('');
  const isComposing = useRef(false);

  const handleStandardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStandardVal(e.target.value);
  };

  const handleImeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isComposing.current) {
      setImeLockedVal(e.target.value);
    }
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e: any) => {
    isComposing.current = false;
    setImeLockedVal(e.target.value);
  };

  return (
    <Card title="尝试输入中文拼音" size="small">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <Text strong>1. 普通 Input (无锁):</Text>
          <Input
            placeholder="输入拼音试试..."
            onChange={handleStandardInput}
            style={{ marginTop: '8px' }}
          />
          <div style={{ marginTop: '8px' }}>
            实时值: <Tag color="red">{standardVal || '(空)'}</Tag>
          </div>
          <Text type="secondary" size="small">
            现象：拼音字母也会被实时记录
          </Text>
        </div>
        <div>
          <Text strong>2. IME 锁定 Input:</Text>
          <Input
            placeholder="输入拼音试试..."
            onInput={handleImeInput}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            style={{ marginTop: '8px' }}
          />
          <div style={{ marginTop: '8px' }}>
            确定值: <Tag color="green">{imeLockedVal || '(空)'}</Tag>
          </div>
          <Text type="secondary" size="small">
            现象：只有汉字上屏后才更新
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default IMELiveDemo;
