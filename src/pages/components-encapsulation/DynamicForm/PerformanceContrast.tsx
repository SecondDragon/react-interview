import React, { useState, useRef, memo, useEffect } from 'react';
import { Card, Input, Typography, Divider, Tag, Space, Alert } from 'antd';

const { Text, Title } = Typography;

/**
 * 💡 原理解析文档 (Under the Hood)
 *
 * 1. 为什么全量渲染会卡顿？
 *    当 state 定义在父组件时，[Input -> setState -> Parent Render -> All Children Render]。
 *    如果 Parent 下面有 100 个组件，每打一个字，这 100 个组件都要执行一遍 diff。
 *
 * 2. 为什么局部渲染丝滑？
 *    状态存在外部 SimpleStore (纯 JS 对象，非 React State)。
 *    当 Input 输入时，[Input -> store.set -> 触发监听函数 -> Child setState -> Only Child Render]。
 *    由于 Parent 的 state 没变，React 的 Diff 流程在 Parent 这一层就被拦截了。
 */

// --------------------------------------------------------------------------
// ❌ 全量渲染模式：状态在“大脑” (父组件)
// --------------------------------------------------------------------------
const BadControlledForm = () => {
  const [value, setValue] = useState('');
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #ffa39e',
        borderRadius: '8px',
        backgroundColor: '#fff2f0',
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Tag color="red">全量模式</Tag>
          <Text strong>整个区域重渲染次数：</Text>
          <Text code style={{ fontSize: '18px', color: '#f5222d' }}>
            {renderCount.current}
          </Text>
        </Space>
        <Alert
          message="setState 在此组件内，每次输入都会引发这里所有的代码重跑一遍。"
          type="error"
        />
        <Input placeholder="打字试试..." value={value} onChange={(e) => setValue(e.target.value)} />
      </Space>
    </div>
  );
};

// --------------------------------------------------------------------------
// ✅ 局部渲染模式：状态在“外部存储”，精准通知到“末梢”
// --------------------------------------------------------------------------

// 1. 外部存储中心 (不属于 React 树)
class SimpleStore {
  private listener: ((v: string) => void) | null = null;

  subscribe(fn: (v: string) => void) {
    this.listener = fn;
  }

  set(v: string) {
    this.listener?.(v);
  }
}

const singletonStore = new SimpleStore();

// 2. 局部组件 (末梢节点)
const SubscribedItem = () => {
  // 核心：setState 放在这里！
  const [localVal, setLocalVal] = useState('');
  const itemRenderCount = useRef(0);
  itemRenderCount.current += 1;

  useEffect(() => {
    // 订阅：当外部 Store 变了，只让我自己 setState
    singletonStore.subscribe((v) => setLocalVal(v));
  }, []);

  return (
    <div style={{ padding: '10px', border: '1px dashed #52c41a', marginTop: '10px' }}>
      <Input
        value={localVal}
        onChange={(e) => singletonStore.set(e.target.value)}
        placeholder="打字试试..."
      />
      <Text type="success">内部组件独立渲染次数: {itemRenderCount.current}</Text>
    </div>
  );
};

// 3. 父组件 (容器)
const GoodPartialForm = memo(() => {
  const parentRenderCount = useRef(0);
  parentRenderCount.current += 1;

  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #b7eb8f',
        borderRadius: '8px',
        backgroundColor: '#f6ffed',
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Tag color="green">局部模式</Tag>
          <Text strong>外部容器渲染次数：</Text>
          <Text code style={{ fontSize: '18px', color: '#52c41a' }}>
            {parentRenderCount.current}
          </Text>
        </Space>
        <Alert
          message="setState 被“隔离”在了下方的绿色虚线框内，外部容器保持静止。"
          type="success"
        />
        <SubscribedItem />
      </Space>
    </div>
  );
});

// --------------------------------------------------------------------------
// 主对比页面
// --------------------------------------------------------------------------
const PerformanceContrast: React.FC = () => {
  return (
    <Card title={<Title level={4}>为什么 Antd Form 不会引起父组件渲染？(底层揭秘)</Title>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <BadControlledForm />
        <GoodPartialForm />
      </div>

      <Divider orientation="left">数据流对比</Divider>
      <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
        <div style={{ flex: 1 }}>
          <Text type="danger" strong>
            ❌ 全量模式流向：
          </Text>
          <div style={{ marginTop: 8 }}>
            {' '}
            <span>输入 ---{'>'}</span> <Tag color="red">父组件 setState</Tag> -{'>'} 重新渲染父组件
            -{'>'} 重新渲染所有子项
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <Text type="success" strong>
            ✅ 局部模式流向：
          </Text>
          <div style={{ marginTop: 8 }}>
            输入 -{'>'} 外部 Store -{'>'} <Tag color="green">子组件局部 setState</Tag> -{'>'}{' '}
            父组件静止{' '}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PerformanceContrast;
