import React from 'react';
import { Typography, Card } from 'antd';
import { introData } from '../data';

const SectionIntro: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{introData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {introData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{introData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <Card>
        <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: 14 }}>
{`用户访问 /dashboard/micro-vue/list
            ↓
主应用路由匹配 /dashboard/micro-vue/*
            ↓
qiankun activeRule 命中
            ↓
请求 entry（//localhost:8082）
            ↓
解析 HTML → 提取 JS/CSS
            ↓
挂载到 #micro-viewport
            ↓
子应用 Vue Router 接管 /list`}
        </pre>
      </Card>

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{introData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {introData.principle.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>
    </section>
  );
};

export default SectionIntro;
