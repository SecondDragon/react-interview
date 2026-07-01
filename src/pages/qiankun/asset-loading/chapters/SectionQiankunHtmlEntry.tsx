import React from 'react';
import { Typography, List, Alert } from 'antd';
import { htmlEntryData } from '../data';

const SectionQiankunHtmlEntry: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{htmlEntryData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {htmlEntryData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{htmlEntryData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <Typography.Paragraph>
        <ul>
          <li>使用绝对路径或 "//" 协议相对 URL；</li>
          <li>运行时动态设置 __webpack_public_path__；</li>
          <li>对 CSS 中的相对路径进行处理或使用 CDN。</li>
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{htmlEntryData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {htmlEntryData.principle.map((item, index) => (
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
            dataSource={htmlEntryData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionQiankunHtmlEntry;
