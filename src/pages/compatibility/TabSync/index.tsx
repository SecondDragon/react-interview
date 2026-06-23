import React, { useEffect, useState } from 'react';
import { Card, Typography, Alert, Divider, Tag, List, Button } from 'antd';
import { TabSyncExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * 互动演示：多标签同步模拟
 */
const TabSyncDemo = () => {
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const bc = new BroadcastChannel('auth_channel');
    bc.onmessage = (event) => {
      setLog((prev) => [`收到同步指令: ${event.data}`, ...prev]);
    };
    return () => bc.close();
  }, []);

  const sendLogout = () => {
    const bc = new BroadcastChannel('auth_channel');
    bc.postMessage('logout_action');
    setLog((prev) => ['主动发起退出...', ...prev]);
    bc.close();
  };

  return (
    <Card title="🔄 互动演示：模拟跨窗口通信" size="small">
      <Paragraph>
        点击按钮模拟“退出登录”操作，当前页面的指令会瞬间广播到所有打开的同域标签页中。
      </Paragraph>
      <Button onClick={sendLogout} type="primary" danger>
        全站安全退出
      </Button>
      <Divider />
      <List
        size="small"
        header={<div>通信日志:</div>}
        bordered
        dataSource={log}
        renderItem={(item) => <List.Item>{item}</List.Item>}
        style={{ background: '#f5f5f5', maxHeight: '100px', overflowY: 'auto' }}
      />
    </Card>
  );
};

/**
 * 多标签页同步重构页面
 */
const TabSync: React.FC = () => {
  return (
    <div>
      <Title level={2}>{TabSyncExamples.title}</Title>

      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          用户在一个浏览器标签页中点击了“退出登录”，但其他已打开的业务页面仍然保持登录态，甚至可以继续进行敏感操作。
        </Paragraph>
        <Alert
          message="安全合规漏洞"
          description={TabSyncExamples.phenomenon}
          type="error"
          showIcon
        />
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>标签页隔离（Tab Isolation）：</Text>
        </Paragraph>
        <Paragraph>
          浏览器默认将每个标签页作为独立的进程或上下文运行。在一个页面中清除 Session 或
          Cookie，其他页面如果由于 JS 变量缓存或未刷新页面，无法实时感知到后端凭证的失效。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <CodeDiff
          oldValue={TabSyncExamples.bad}
          newValue={TabSyncExamples.good}
          leftTitle="❌ 反面教材"
          rightTitle="✅ 最佳实践"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      {/* 四、 为什么要这样解决 且互动演示 */}
      <Card
        title={
          <span>
            四、 为什么要这样解决 且互动演示 <Tag color="blue">Live Demo</Tag>
          </span>
        }
        style={{ marginBottom: '24px' }}
      >
        <Paragraph>
          <Text code>BroadcastChannel</Text>{' '}
          是最优雅的跨标签通信手段。它不依赖于存储介质的变更，消息通过浏览器内核直接在内存间传递，实时性极高。
        </Paragraph>
        <Divider />
        <TabSyncDemo />
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>同源广播协议：</Text>
            浏览器在内核进程中维护了一个通道映射表。任何符合同源策略的上下文都可以通过名称订阅该通道，实现点对多点的数据分发。
          </li>
          <li>
            <Text strong>避免磁盘 I/O：</Text>
            与监听 <Text code>localStorage</Text> 的变动事件相比，BroadcastChannel
            不需要进行数据序列化和磁盘写入，响应时间缩短了几个数量级。
          </li>
          <li>
            <Text strong>解耦业务逻辑：</Text>
            它允许“登录管理”模块与“业务展示”模块完全解耦。业务页面只需订阅“退出”频道，而不需要关心用户是在哪个具体页面点击的按钮。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default TabSync;
