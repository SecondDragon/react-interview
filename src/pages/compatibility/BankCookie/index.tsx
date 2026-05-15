import React from 'react';
import { Card, Typography, Alert, Divider, Tag, Table } from 'antd';
import { BankCookieExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * 银行 Cookie SameSite 重构页面
 */
const BankCookie: React.FC = () => {
  const dataSource = [
    { key: '1', attr: 'Strict', behavior: '完全禁止跨站发送。仅在同站请求时携带。', security: '最高' },
    { key: '2', attr: 'Lax (默认)', behavior: '禁止第三方 POST，但允许顶级导航的 GET。', security: '中' },
    { key: '3', attr: 'None', behavior: '允许跨站发送。前提是必须开启 Secure。', security: '低 (需 HTTPS)' },
  ];

  const columns = [
    { title: 'SameSite 属性', dataIndex: 'attr', key: 'attr' },
    { title: '浏览器行为', dataIndex: 'behavior', key: 'behavior' },
    { title: '安全等级', dataIndex: 'security', key: 'security' },
  ];

  return (
    <div style={{ padding: '24px', margin: '0 auto' }}>
      <Title level={2}>{BankCookieExamples.title}</Title>

      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          在微前端架构或使用 iframe 嵌入银行系统时，用户明明已经登录，但在嵌入页面中却显示“未登录”或“会话超时”。
        </Paragraph>
        <Alert message="登录态丢失" description={BankCookieExamples.phenomenon} type="error" showIcon />
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>Chrome 80+ 的安全强制策略：</Text>
        </Paragraph>
        <Paragraph>
          {BankCookieExamples.reason}
        </Paragraph>
        <Table dataSource={dataSource} columns={columns} pagination={false} size="small" bordered />
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <CodeDiff
          oldValue={BankCookieExamples.bad}
          newValue={BankCookieExamples.good}
          leftTitle="❌ 反面教材"
          rightTitle="✅ 最佳实践"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      {/* 四、 为什么要这样解决 且现状模拟 */}
      <Card
        title={<span>四、 为什么要这样解决 且现状模拟 <Tag color="blue">Live Simulation</Tag></span>}
        style={{ marginBottom: '24px' }}
      >
        <Paragraph>
          设置 <Text code>SameSite=None</Text> 是目前解决跨域 iframe 登录的唯一标准路径。但在银行系统中，这必须配合 <Text code>Secure</Text> 和 <Text code>HttpOnly</Text> 使用，以防止 Cookie 被脚本窃取或在明文网络中泄露。
        </Paragraph>
        <Divider />
        <Alert
          message="模拟测试环境"
          description="如果你在 localhost (HTTP) 下测试，即便设置了 None 也无法生效，因为浏览器要求 None 必须与 Secure 绑定。"
          type="warning"
        />
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>CSRF 防御升级：</Text>
            浏览器通过引入 <Text code>SameSite</Text> 属性，将“跨站请求是否携带凭证”的控制权交还给开发者，从协议层面解决了跨站请求伪造的隐患。
          </li>
          <li>
            <Text strong>HTTPS 强绑定：</Text>
            当声明 <Text code>SameSite=None</Text> 时，浏览器强制要求 <Text code>Secure</Text> 属性，这意味着所有的敏感凭证必须在加密隧道中传输，进一步提升了银行系统的安全性。
          </li>
          <li>
            <Text strong>Set-Cookie 头部解析：</Text>
            浏览器在解析响应头时，会检查当前域名与请求源的关系。若符合 None 策略且环境安全，则会将 Cookie 存入第三方存储分区。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default BankCookie;
