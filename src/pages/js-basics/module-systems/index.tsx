import React from 'react';
import { Card, Typography, List } from 'antd';
import { ModuleSystemsMeta, interviewQuestions } from './data';
import CommonJSIntro from './sections/CommonJSIntro';
import ESModuleIntro from './sections/ESModuleIntro';
import Comparison from './sections/Comparison';
import WebpackBundling from './sections/WebpackBundling';
import V8Relation from './sections/V8Relation';
import LiveDemo from './LiveDemo';

const { Title, Paragraph, Text } = Typography;

const ModuleSystems: React.FC = () => {
  return (
    <div>
      <Title level={2}>{ModuleSystemsMeta.title}</Title>
      <Paragraph type="secondary">{ModuleSystemsMeta.description}</Paragraph>

      <Card title="一、为什么需要模块化" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{ModuleSystemsMeta.phenomenon}</Paragraph>
      </Card>

      <Card title="二、CommonJS 详解" style={{ marginBottom: 24 }}>
        <CommonJSIntro />
      </Card>

      <Card title="三、ES Module 详解" style={{ marginBottom: 24 }}>
        <ESModuleIntro />
      </Card>

      <Card title="四、CommonJS vs ES Module 对比" style={{ marginBottom: 24 }}>
        <Comparison />
      </Card>

      <Card title="五、Webpack 打包差异" style={{ marginBottom: 24 }}>
        <WebpackBundling />
      </Card>

      <Card title="六、与 V8 执行模型的关系" style={{ marginBottom: 24 }}>
        <V8Relation />
      </Card>

      <Card title="七、互动演示" style={{ marginBottom: 24 }}>
        <LiveDemo />
      </Card>

      <Card title="八、核心原理与面试考点" style={{ background: '#f0f5ff' }}>
        <List
          dataSource={interviewQuestions}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={<Text strong>{item.question}</Text>}
                description={<Paragraph type="secondary">{item.answer}</Paragraph>}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default ModuleSystems;
