import React, { useContext, useRef, useState, useEffect, memo } from 'react';
import { Card, Input, Typography, Tag, Alert } from 'antd';

const { Text, Paragraph } = Typography;

/**
 * 🚀 硬核原理：极简版 rc-field-form 模拟
 */

// 1. 全局空气 (Context)
const MiniFormContext = React.createContext<FormStore | null>(null);

// 2. 纯 JS 逻辑中心 (不属于 React 渲染链路)
//
class FormStore {
  private entries = new Map<string, Function>();
  private store: Record<string, any> = {};

  public registerField = (fieldName: string, updator: Function) => {
    if (this.entries.has(fieldName)) {
      console.warn('已有同名item');
      return () => {};
    }
    this.entries.set(fieldName, updator);
    return () => this.entries.delete(fieldName);
  };

  public getFieldValue(fieldName: string) {
    return this.store[fieldName];
  }

  public setFieldValue(fieldName: string, value: any) {
    this.store[fieldName] = value;
    const updator = this.entries.get(fieldName);
    if (updator) updator();
  }
}

// 3. 字段包装器 (模拟 Form.Item)
const MiniItem = ({
  name,
  label,
  children,
}: {
  name: string;
  label: string;
  children: React.ReactElement;
}) => {
  const store = useContext(MiniFormContext);
  const [, forceUpdate] = useState({}); // 局部状态，只管当前这个 Item
  const renderCount = useRef(0);
  renderCount.current++;

  useEffect(() => {
    // 组件挂载时，把自己注册给 Store
    // registerField 返回的正好是卸载时需要的清理函数
    return store?.registerField(name, () => forceUpdate({}));
  }, [name, store]);

  return (
    <div
      style={{
        padding: '12px',
        border: '1px dashed #d9d9d9',
        marginBottom: '12px',
        borderRadius: '4px',
      }}
    >
      <Text strong>
        {label} (渲染次数: <Text type="danger">{renderCount.current}</Text>)
      </Text>
      <div style={{ marginTop: '8px' }}>
        {React.cloneElement(children, {
          value: store?.getFieldValue(name) || '',
          onChange: (e: any) => store?.setFieldValue(name, e.target.value),
        })}
      </div>
    </div>
  );
};

// 4. 模拟器容器
const MiniFormTheory: React.FC = () => {
  // 重点：我们在这里创建 Store，但我们【没有任何 setState】
  const storeRef = useRef(new FormStore());
  const parentRenderCount = useRef(0);
  parentRenderCount.current++;

  return (
    <Card
      title="Mini-Form 原理模拟器 (硬核代码实现)"
      style={{ marginTop: '24px', border: '2px solid #1890ff' }}
    >
      <Paragraph>
        这个模拟器**完全没有使用 Antd Form 组件**，而是用我们自己写的 60 行代码还原了其核心精髓。
      </Paragraph>

      <div
        style={{
          backgroundColor: '#e6f7ff',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <Tag color="processing">父容器渲染次数：{parentRenderCount.current}</Tag>
        <Text type="secondary">
          （无论你在下面怎么打字，这里的数字永远是 1，因为它完全不知道数据在变）
        </Text>
      </div>

      <MiniFormContext.Provider value={storeRef.current}>
        <MiniItem name="username" label="用户名字段">
          <Input placeholder="输入试试..." />
        </MiniItem>
        {/*<MiniItem name="username" label="用户名字段">*/}
        {/*  <Input placeholder="输入试试..." />*/}
        {/*</MiniItem>*/}
        <MiniItem name="email" label="邮箱字段">
          <Input placeholder="输入试试..." />
        </MiniItem>
      </MiniFormContext.Provider>

      <Alert
        style={{ marginTop: '16px' }}
        message="这就是发布订阅的威力：[Input] -> [Store] -> [对应 Item 的内部分支刷新]。父组件和邻居 Item 统统不准动！"
        type="info"
      />
    </Card>
  );
};

export default MiniFormTheory;
