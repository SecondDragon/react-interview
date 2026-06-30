import React, { useState } from 'react';
import { Card, Tabs, Steps, Button, Table, Typography, Tag } from 'antd';

const { Paragraph, Text } = Typography;

const LiveDemo: React.FC = () => {
  const [esmStep, setEsmStep] = useState(0);

  const esmStages = [
    {
      title: '构造阶段',
      content: '建立 Module Map，a.mjs 和 b.mjs 的 Module Record 已创建，Status 为 uninstantiated。',
      records: [
        { module: 'a.mjs', status: 'uninstantiated', bindings: 'a: uninitialized, b: (import from a)' },
        { module: 'b.mjs', status: 'uninstantiated', bindings: 'b: uninitialized, a: (import from b)' },
      ],
    },
    {
      title: '实例化阶段',
      content: '为每个模块创建 Environment Record，export 分配 binding 并标记为 uninitialized；import 建立 Import Binding 链接。',
      records: [
        { module: 'a.mjs', status: 'instantiated', bindings: 'a: uninitialized, b: → b.binding.b' },
        { module: 'b.mjs', status: 'instantiated', bindings: 'b: uninitialized, a: → a.binding.a' },
      ],
    },
    {
      title: '求值阶段',
      content: '执行顶层代码，binding 从 uninitialized 变为具体值。循环依赖通过 evaluating 状态避免重复执行。',
      records: [
        { module: 'a.mjs', status: 'evaluated', bindings: 'a: "a", b: "b"' },
        { module: 'b.mjs', status: 'evaluated', bindings: 'b: "b", a: "a"' },
      ],
    },
  ];

  const cjsSteps = [
    { title: 'a 开始执行', description: 'module.exports = {}' },
    { title: "a 执行 require('./b')", description: 'b 开始执行，a 暂停' },
    { title: "b 执行 require('./a')", description: '从缓存拿到 a 的半成品 exports，可能为 {}' },
    { title: 'b 执行完成', description: '返回 b 的 module.exports' },
    { title: 'a 继续执行', description: '填充并最终返回 module.exports' },
  ];

  const columns = [
    { title: '模块', dataIndex: 'module', key: 'module' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (text: string) => <Tag color="blue">{text}</Tag> },
    { title: 'Bindings', dataIndex: 'bindings', key: 'bindings' },
  ];

  const tabItems = [
    {
      key: 'cjs',
      label: 'CommonJS 状态机',
      children: (
        <div>
          <Paragraph>
            CommonJS 中，a → b → a 循环依赖时，a 的 module.exports 在 b 执行时已经存在，但可能还是空对象 {'{}'}。
          </Paragraph>
          <Steps direction="vertical" current={2} items={cjsSteps} />
        </div>
      ),
    },
    {
      key: 'esm',
      label: 'ES Module 三阶段',
      children: (
        <div>
          <Steps current={esmStep} onChange={setEsmStep} direction="horizontal" items={esmStages.map((s) => ({ title: s.title }))} />
          <Paragraph style={{ marginTop: 16 }}>
            <Text strong>{esmStages[esmStep].title}</Text>：{esmStages[esmStep].content}
          </Paragraph>
          <Table dataSource={esmStages[esmStep].records} columns={columns} pagination={false} bordered size="small" />
          <Button.Group style={{ marginTop: 16 }}>
            <Button disabled={esmStep === 0} onClick={() => setEsmStep(esmStep - 1)}>
              上一步
            </Button>
            <Button disabled={esmStep === esmStages.length - 1} onClick={() => setEsmStep(esmStep + 1)}>
              下一步
            </Button>
          </Button.Group>
        </div>
      ),
    },
  ];

  return (
    <Card title="互动演示：模块状态推进器">
      <Tabs defaultActiveKey="cjs" items={tabItems} />
    </Card>
  );
};

export default LiveDemo;
