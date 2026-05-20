import React from 'react';
import { Card, Typography, Alert, Divider, Tag } from 'antd';
import { MixedContentExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * HTTPS 混合内容重构页面
 */
const MixedContent: React.FC = () => {
  return (
    <div>
      <Title level={2}>{MixedContentExamples.title}</Title>

      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          当银行页面升级到 HTTPS 后，原本正常显示的内网图片或三方接口突然报错，无法加载。
        </Paragraph>
        <Alert message="加载失败" description={MixedContentExamples.phenomenon} type="error" showIcon />
        <div style={{ background: '#000', color: '#ff4d4f', padding: '10px', marginTop: '16px', fontSize: '12px', fontFamily: 'monospace' }}>
          Mixed Content: The page at 'https://bank.com' was loaded over HTTPS, but requested an insecure image 'http://old.com/logo.png'. This content should also be served over HTTPS.
        </div>
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>全链路加密强制性：</Text>
        </Paragraph>
        <Paragraph>
          {MixedContentExamples.reason}
        </Paragraph>
        <Paragraph>
          浏览器禁止在安全上下文（HTTPS）中加载非安全（HTTP）的主动资源（如 JS）和被动资源（如图片）。这是为了防止中间人攻击者向安全页面注入恶意内容。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <CodeDiff
          oldValue={MixedContentExamples.bad}
          newValue={MixedContentExamples.good}
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
          手动将成千上万个 URL 改为 HTTPS 既耗时又容易遗漏。使用 CSP 的 <Text code>upgrade-insecure-requests</Text> 是一种低成本、高效率的批量修复手段，特别适用于包含大量旧资源的遗留系统。
        </Paragraph>
        <Divider />
        <Alert
          message="模拟测试"
          description="如果你正在 localhost 下开发，浏览器通常会允许混合内容，因为 localhost 被视为安全源。但在部署到生产 HTTPS 环境后，拦截会立即生效。"
          type="warning"
        />
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>协议级重写：</Text>
            当浏览器检测到该指令后，其网络层组件会在发起 TCP 握手前，拦截所有非 HTTPS 的 URL 字符串，并自动替换其协议前缀。
          </li>
          <li>
            <Text strong>无感跳转：</Text>
            这种替换发生在客户端内部，不需要服务器进行 301/302 重定向，从而减少了一个网络往返（RTT），对性能几乎无影响。
          </li>
          <li>
            <Text strong>严格合规性：</Text>
            如果自动升级后的 HTTPS 资源由于 SSL 证书错误或其他原因无法加载，浏览器会直接将其拦截，而不会回退到 HTTP，确保了安全闭环。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default MixedContent;
