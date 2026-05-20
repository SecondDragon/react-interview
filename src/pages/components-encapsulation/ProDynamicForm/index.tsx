import React from 'react';
import { Card, Button, Form, Typography, Space, Alert } from 'antd';
import ProFormGenerator from './ProFormGenerator';
import { bestPracticeSchema, bestPracticeCode } from './Examples.tsx';
import CodeBlock from '@/components/CodeBlock';

const { Title, Paragraph } = Typography;

const ProDynamicFormPage: React.FC = () => {
  const [form] = Form.useForm();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (values: any) => {
    console.log('表单最终提交数据:', values);
  };

  return (
    <div>
      <Typography>
        <Title level={2}>企业级动态表单 - 纯前端架构演进 (Registry + Pure Function)</Title>
        <Paragraph>
          在我们探讨了“字符串表达式”的利弊之后，我们意识到如果项目<b>没有</b>“后端动态下发 JSON 且不发版更新”或者“可视化低代码拖拽存储到数据库”的强制要求，那么为了追求极致的开发体验（完美的 TypeScript 提示、断点调试、极佳性能），使用<b>纯粹的 JavaScript 函数</b>才是纯前端配置体系下的真·最佳实践。
        </Paragraph>
        <Alert
          message="架构核心升级 (转向纯函数配置)"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><b>彻底抛弃表达式沙箱：</b>移除了危险且低效的 `new Function` 字符串解析引擎，大大减轻了运行时的负担和安全风险。</li>
              <li><b>拥抱原生函数与闭包：</b>`hidden: (values) =&gt; values.age &gt; 18`。这样的写法不仅可以在 IDE 中获得无缝的代码高亮和属性补全，更可以直接通过打断点来进行复杂联动逻辑的 Debug。</li>
              <li><b>依然保留了注册制与精准依赖更新：</b>通过底层的 `shouldUpdate` 与 `dependencies` 数组进行阻断，即便是使用了函数调用，也可以完美避免了外层大表单的重绘。</li>
            </ul>
          }
          type="success"
          showIcon
          style={{ marginBottom: '24px' }}
        />
        <Alert
          message="渲染优化验证"
          description="（请在下方表单自由输入并切换用户类型。尽管我们在组件内部进行了函数调用进行状态计算，由于依赖阻断，外层容器的重绘被完全杜绝。）"
          type="info"
          style={{ marginBottom: '24px' }}
        />
      </Typography>

      <Card title="互动演示 (Live Demo) - 切换用户类型查看原生 JS 函数联动" style={{ marginBottom: '24px' }}>
        <ProFormGenerator schema={bestPracticeSchema} form={form} onFinish={onFinish} />
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" onClick={() => form.submit()}>提交获取数据</Button>
          <Button onClick={() => form.resetFields()}>清空表单</Button>
        </Space>
      </Card>

      <Card title="业内最佳实践用法与代码示例" style={{ marginBottom: '24px' }}>
        <CodeBlock code={bestPracticeCode} language="tsx" />
      </Card>
    </div>
  );
};

export default ProDynamicFormPage;
