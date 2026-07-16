import React, { useState, useTransition } from 'react';
import { Input, Switch, Button, Tag, Card, Space } from 'antd';
import { RocketOutlined, StopOutlined } from '@ant-design/icons';
import { HeavyList } from './shared';

const SearchDemo: React.FC = () => {
  const [useTransitionMode, setUseTransitionMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (useTransitionMode) {
      startTransition(() => setSearchQuery(value));
    } else {
      setSearchQuery(value);
    }
  };

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <span>模式：</span>
        <Switch
          checkedChildren={<><RocketOutlined /> Transition 模式</>}
          unCheckedChildren={<><StopOutlined /> 同步模式</>}
          checked={useTransitionMode}
          onChange={(val) => {
            setUseTransitionMode(val);
            setInputValue('');
            setSearchQuery('');
          }}
        />
        {useTransitionMode && isPending && <Tag color="processing">后台过滤中...</Tag>}
      </Space>
      <Input
        placeholder="请快速输入内容（如：数据）"
        value={inputValue}
        onChange={handleChange}
        allowClear
      />
      <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        <HeavyList query={searchQuery} />
      </div>
    </Card>
  );
};

export default SearchDemo;
