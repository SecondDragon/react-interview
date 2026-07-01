import React, { useState } from 'react';
import { Card, Tabs, Steps, Button, Table, Typography, Tag, Space } from 'antd';
import { cjsLiveDemoSteps, esmLiveDemoStages } from './data';

const { Paragraph, Text } = Typography;

const LiveDemo: React.FC = () => {
  const [esmStep, setEsmStep] = useState(0);
  const [cjsStep, setCjsStep] = useState(0);

  const esmColumns = [
    { title: '模块', dataIndex: 'module', key: 'module' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => (
        <Tag color={text === 'evaluated' ? 'green' : text === 'instantiated' ? 'blue' : 'default'}>
          {text}
        </Tag>
      ),
    },
    { title: 'Bindings', dataIndex: 'bindings', key: 'bindings' },
  ];

  const tabItems = [
    {
      key: 'cjs',
      label: 'CommonJS 循环依赖执行流',
      children: (
        <div>
          <Paragraph>
            在 CommonJS 中，循环依赖的处理是“边执行边暴露”。当 a 被 b 再次 require 时，
            a 的 <Text code>module.exports</Text> 已经存在，但内部可能还是空对象。
          </Paragraph>
          <Steps direction="vertical" current={cjsStep} items={cjsLiveDemoSteps.map((s) => ({ title: s.title, description: s.description }))} />
          <Space style={{ marginTop: 16 }}>
            <Button disabled={cjsStep === 0} onClick={() => setCjsStep((prev) => prev - 1)}>
              上一步
            </Button>
            <Button disabled={cjsStep === cjsLiveDemoSteps.length - 1} onClick={() => setCjsStep((prev) => prev + 1)}>
              下一步
            </Button>
            <Button onClick={() => setCjsStep(0)}>重置</Button>
          </Space>
        </div>
      ),
    },
    {
      key: 'esm',
      label: 'ES Module 三阶段推进器',
      children: (
        <div>
          <Paragraph>
            ES Module 在循环依赖中不会重复执行模块。三阶段模型让所有 binding 先建立链接，
            再执行代码。点击下方按钮逐步观察模块状态变化。
          </Paragraph>
          <Steps
            current={esmStep}
            onChange={setEsmStep}
            direction="horizontal"
            items={esmLiveDemoStages.map((s) => ({ title: s.title }))}
          />
          <Paragraph style={{ marginTop: 16 }}>
            <Text strong>{esmLiveDemoStages[esmStep].title}</Text>：
            {esmLiveDemoStages[esmStep].content}
          </Paragraph>
          <Table
            dataSource={esmLiveDemoStages[esmStep].records}
            columns={esmColumns}
            pagination={false}
            bordered
            size="small"
          />
          <Space style={{ marginTop: 16 }}>
            <Button disabled={esmStep === 0} onClick={() => setEsmStep((prev) => prev - 1)}>
              上一步
            </Button>
            <Button disabled={esmStep === esmLiveDemoStages.length - 1} onClick={() => setEsmStep((prev) => prev + 1)}>
              下一步
            </Button>
            <Button onClick={() => setEsmStep(0)}>重置</Button>
          </Space>
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
