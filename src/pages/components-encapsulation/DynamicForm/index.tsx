import React, { useRef } from 'react';
import { Card, Button, Form, Typography, Space, Alert } from 'antd';
import DynamicFormGenerator from './DynamicFormGenerator';
import { defaultSchema, defaultCode } from './Examples';
import CodeBlock from '@/components/CodeBlock';
import PerformanceContrast from "./PerformanceContrast.tsx";
import MiniFormTheory from "./MiniFormTheory.tsx";

const { Title, Paragraph } = Typography;
/* eslint-disable react-hooks/exhaustive-deps */
const DynamicFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const renderCount = useRef(0);
  renderCount.current += 1;

  const onFinish = (values: any) => {
    console.log('表单提交:', values);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Typography>
        <Title level={2}>JSON 驱动的动态表单 (Dynamic Form Generator)</Title>
        <Paragraph>
          通过传入一套 JSON Schema 自动渲染对应的表单结构。内置表单项联动（如根据用户类型显示税号输入框），并采用局部渲染机制（借助 Antd rc-field-form 的发布订阅模式），保证大表单时在输入单个字符也不会引起整个外层表单的重渲染。
        </Paragraph>
        <Alert
          message={`当前外层组件渲染次数：${renderCount.current}`}
          description="在下方表单中任意输入，观察外层组件是否会重新渲染。你会发现哪怕频繁输入，此处的数字依然不会变动，证明采用了高性能局部渲染。"
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      </Typography>

      <Card title="互动演示 (Live Demo) - 动态联动与高性能渲染" style={{ marginBottom: '24px' }}>
        <DynamicFormGenerator schema={defaultSchema} form={form} onFinish={onFinish} />
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" onClick={() => form.submit()}>提交验证</Button>
          <Button onClick={() => form.resetFields()}>重置表单</Button>
        </Space>
      </Card>

      <PerformanceContrast />

      <MiniFormTheory />

      <Card title="核心原理及用法" style={{ marginBottom: '24px' }}>
        <CodeBlock code={defaultCode} language="tsx" />
      </Card>
    </div>
  );
};

export default DynamicFormPage;
/* eslint-disable react-hooks/exhaustive-deps */
