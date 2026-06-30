import React from 'react';
import { Card, Typography, List, Steps } from 'antd';

const { Paragraph, Text } = Typography;

const V8Relation: React.FC = () => {
  const stepItems = [
    { title: '解析', description: 'Parser / Pre-parser 生成 AST' },
    { title: '编译', description: 'Ignition 字节码 / TurboFan 机器码' },
    { title: '执行', description: '运行字节码或机器码' },
  ];

  return (
    <>
      <Card title="V8 执行流水线" style={{ marginBottom: 24 }}>
        <Steps direction="horizontal" current={3} items={stepItems} />
      </Card>

      <Card title="CommonJS 与 V8" style={{ marginBottom: 24 }}>
        <Paragraph>
          每次 require 时，Node.js 读取文件内容并通过包装函数执行。这直接触发 V8 的解析→编译→执行流程，没有独立的实例化阶段。
          因此 module.exports 是执行后得到的对象快照，不支持 live binding。
        </Paragraph>
      </Card>

      <Card title="ES Module 与 V8" style={{ marginBottom: 24 }}>
        <List>
          <List.Item>
            <Text strong>构造阶段：</Text>模块加载器在 V8 外部维护 Module Map，不直接执行 V8
          </List.Item>
          <List.Item>
            <Text strong>实例化阶段：</Text>V8 创建 Module Environment Record，分配 bindings；由模块加载器驱动
          </List.Item>
          <List.Item>
            <Text strong>求值阶段：</Text>调用 V8 的 Module::Evaluate，执行顶层代码，触发解析→编译→执行
          </List.Item>
          <List.Item>
            <Text strong>循环依赖：</Text>evaluating 状态由模块加载器维护，V8 只负责执行单个模块的脚本
          </List.Item>
        </List>
      </Card>
    </>
  );
};

export default V8Relation;
