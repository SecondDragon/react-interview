import React from 'react';
import { Card, Typography, Alert, Divider, Tag, List } from 'antd';
import { BankCSPExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * 银行 CSP 重构页面
 */
const BankCSP: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>银行级内容安全策略 (CSP) 限制</Title>
      
      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          在银行内网或严格合规环境下，网页的部分功能（如三方图标、动态脚本）会突然失效。
        </Paragraph>
        <Alert message="合规拦截" description={BankCSPExamples.phenomenon} type="error" showIcon />
        <div style={{ marginTop: '16px' }}>
          <Text strong>控制台常见报错：</Text>
          <div style={{ background: '#000', color: '#ff4d4f', padding: '10px', marginTop: '8px', fontSize: '12px', fontFamily: 'monospace' }}>
            Refused to load the script 'https://cdn.com/xxx.js' because it violates the following Content Security Policy directive...
          </div>
        </div>
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>白名单信任模型：</Text>
        </Paragraph>
        <Paragraph>
          {BankCSPExamples.reason}
        </Paragraph>
        <Paragraph>
          为了防范 XSS 攻击，银行系统通常会关闭浏览器的“宽容模式”，强制要求所有资源必须同源或经过 Nonce 校验。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <CodeDiff
          oldValue={BankCSPExamples.bad}
          newValue={BankCSPExamples.good}
          leftTitle="❌ 反面教材"
          rightTitle="✅ 最佳实践"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      {/* 四、 为什么要这样解决 且互动演示 */}
      <Card 
        title={<span>四、 为什么要这样解决 且现状模拟 <Tag color="blue">Live Simulation</Tag></span>} 
        style={{ marginBottom: '24px' }}
      >
        <Paragraph>
          “全量本地化”是银行前端开发的铁律。它不仅解决了安全审计问题，还避免了由于外网 CDN 波动导致的生产事故。
        </Paragraph>
        <Divider />
        <List size="small" header={<Text strong>模拟拦截清单：</Text>} bordered>
          <List.Item><Tag color="red">unsafe-inline</Tag> 拦截：所有 style="color:red" 的行内样式失效。</List.Item>
          <List.Item><Tag color="red">script-src</Tag> 拦截：所有外链 SDK（如统计代码、地图）无法加载。</List.Item>
          <List.Item><Tag color="red">img-src</Tag> 拦截：所有未备案的图床图片显示为碎裂图。</List.Item>
        </List>
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>基于源的信任限制：</Text>
            CSP 在浏览器的渲染引擎层级拦截了未授权的 HTTP 请求。它在 DOM 树构建之前就完成了安全检查。
          </li>
          <li>
            <Text strong>Nonce (Number once) 机制：</Text>
            服务器在下发 HTML 时，随机生成一个 Token 并放入 CSP 头。只有携带相同 Nonce 的内联脚本才会被执行，这从数学层面杜绝了恶意脚本注入。
          </li>
          <li>
            <Text strong>Subresource Integrity (SRI)：</Text>
            通过校验资源的 Hash 值（如 <Text code>sha384-...</Text>），确保本地化存储的资源没有被恶意篡改。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default BankCSP;
