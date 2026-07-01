import React from 'react';
import { Typography, List, Alert } from 'antd';
import { borderCssData } from '../data';

const SectionBorderCss: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{borderCssData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {borderCssData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{borderCssData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <Typography.Paragraph>
        <ul>
          <li>使用绝对路径或 CDN 路径；</li>
          <li>对 CSS 中的相对资源路径做后处理（如 postcss 的 public-path 插件）；</li>
          <li>使用 CSS 变量或 base64 内联小图标。</li>
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{borderCssData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {borderCssData.principle.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Alert
        type="warning"
        message="注意事项"
        description={
          <List
            size="small"
            dataSource={borderCssData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionBorderCss;
