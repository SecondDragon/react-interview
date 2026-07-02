import React from 'react';
import { Typography, List, Alert, Space, Divider } from 'antd';
import { borderCssData } from '../data';

const SectionBorderCss: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{borderCssData.title}</Typography.Title>

      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={4}>一、现象/问题</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {borderCssData.phenomenon.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </Typography.Paragraph>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>二、底层原因</Typography.Title>
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            {borderCssData.cause.map((item, index) => (
              <Typography.Paragraph key={index}>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </Typography.Paragraph>
            ))}
          </Space>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>三、如何解决</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {borderCssData.solution.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </Typography.Paragraph>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
          <Typography.Paragraph>
            使用绝对路径或 CDN 路径，能彻底摆脱主应用 <strong>document.baseURI</strong> 的干扰；对 CSS 资源做构建时后处理，可以避免手动维护大量路径；base64 内联小图标能减少网络往返，但会增加 <strong>bundle</strong> 体积，需要权衡。
          </Typography.Paragraph>
          <Alert
            type="info"
            message="结论"
            description="在 qiankun 嵌入场景下，CSS 中的相对路径是最容易遗漏的坑，统一使用绝对路径或 CDN 是最稳的兜底方案。"
            showIcon
          />
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>五、核心原理</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {borderCssData.principle.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </Typography.Paragraph>
        </div>

        <Alert
          type="warning"
          message="注意事项"
          description={
            <List
              size="small"
              dataSource={borderCssData.notes}
              renderItem={(item) => (
                <List.Item>
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </List.Item>
              )}
            />
          }
          showIcon
        />
      </Space>
    </section>
  );
};

export default SectionBorderCss;
