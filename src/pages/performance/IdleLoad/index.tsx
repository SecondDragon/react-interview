import React, { lazy, useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Tag, Spin, Row, Col, Divider, Alert } from 'antd';
import SmartIdleLoad from '../../../components/SmartIdleLoad';
import TransitionIdleLoad from '../../../components/TransitionIdleLoad';
import CodeDiff from '../../../components/CodeDiff';
import { IdleLoadExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;

// 懒加载重型 ECharts 组件
const ComplexChart = lazy(() => import('../../../samples/ComplexChart'));

const IdleLoadPage: React.FC = () => {
  const [isBlocking, setIsBlocking] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = performance.now().toFixed(2);
    setLogs((prev) => [`[${timestamp}ms] ${msg}`, ...prev].slice(0, 5));
  };

  // 模拟主线程阻塞
  const handleBlockMainThread = () => {
    setIsBlocking(true);
    addLog('开始手动阻塞主线程 (3秒)...');

    setTimeout(() => {
      const start = performance.now();
      while (performance.now() - start < 3000) {
        /* empty */
      }
      addLog('主线程阻塞结束！');
      setIsBlocking(false);
    }, 10);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleBlockMainThread();
  }, []);

  return (
    <div>
      <Title level={2}>性能优化专题：闲时加载 (Idle Load)</Title>

      <Row gutter={[24, 24]}>
        {/* ==================== 核心原理说明 ==================== */}
        <Col span={24}>
          <Card title="核心原理说明" bordered={false}>
            <Paragraph>
              在现代前端应用中，某些重型第三方库（如 ECharts, Monaco Editor
              等）的初始化和渲染会占用大量主线程时间。
              如果这些组件在页面初始化时就加载，可能会导致页面响应迟缓、交互卡顿，甚至阻塞用户输入。
            </Paragraph>
            <Paragraph>
              <Text strong>闲时加载策略：</Text> 将非紧急的渲染任务推迟到浏览器空闲时段执行，
              既保证首屏关键内容的快速呈现，又能让重型组件在不打扰用户的时机完成加载。
            </Paragraph>

            <Alert
              message="两种实现方案对比"
              description={
                <div style={{ lineHeight: 2 }}>
                  <p>
                    <b>方案一（SmartIdleLoad）：</b>基于 <code>requestIdleCallback</code>，
                    等浏览器空闲帧才执行。兼容性好（有 setTimeout 垫片），但不可被中断。
                  </p>
                  <p>
                    <b>方案二（TransitionIdleLoad）：</b>基于 React 18 <code>useTransition</code>，
                    利用 React 内部 Scheduler 调度。可被用户交互中断，提供 <code>isPending</code>{' '}
                    过渡状态反馈。
                  </p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />

            <Paragraph style={{ marginTop: 16 }}>
              <Text strong>典型实战场景：</Text>
            </Paragraph>
            <ul>
              <li>
                <Text strong>数据可视化大屏</Text>：首屏只需展示核心 KPI 卡片， 下方的 ECharts / D3
                复杂图表可在用户浏览完关键数据后再闲时渲染， 避免图表初始化阻塞页面滚动和点击。
              </li>
              <li>
                <Text strong>后台管理系统的富文本编辑器</Text>：Monaco Editor、 CodeMirror
                等编辑器体积大、初始化慢。用户进入页面时通常先浏览列表，
                点击编辑按钮后才需要编辑器，完全可以用闲时加载预初始化。
              </li>
              <li>
                <Text strong>长页面的非首屏模块</Text>：如商品详情页的评论区域、 推荐商品列表、FAQ
                折叠面板等，用户需要滚动才能看到， 没必要在页面加载时就抢占主线程资源。
              </li>
              <li>
                <Text strong>日志埋点与数据上报</Text>：非实时的用户行为数据，
                可以在浏览器空闲时批量上报，避免在关键交互时刻发起网络请求。
              </li>
              <li>
                <Text strong>复杂表单的动态校验规则加载</Text>：如金融系统的表单，
                首屏只展示基础字段，高级校验规则库（如复杂的正则引擎）可在用户填写时闲时加载。
              </li>
            </ul>

            <Paragraph>
              <Text strong>核心收益：</Text>
            </Paragraph>
            <ul>
              <li>
                <Tag color="green">提升首屏可交互时间 (TTI)</Tag>
                关键路径不被阻塞，用户更快能点击和输入
              </li>
              <li>
                <Tag color="green">减少主线程占用</Tag>
                重型组件的解析、编译、执行被推迟到空闲时段
              </li>
              <li>
                <Tag color="green">渐进式体验</Tag>
                页面内容逐步呈现，避免白屏等待的焦虑感
              </li>
            </ul>
          </Card>
        </Col>

        {/* ==================== 公共演示控制区 ==================== */}
        <Col span={24}>
          <Card title="演示控制区" extra={<Tag color="blue">实时测试</Tag>}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>
                点击按钮模拟 3 秒的计算密集型任务，观察下方两种方案的图表加载表现差异。
              </Paragraph>

              <Button type="primary" danger onClick={handleBlockMainThread} loading={isBlocking}>
                {isBlocking ? '主线程阻塞中 (UI 已冻结)...' : '点击模拟阻塞主线程 3 秒'}
              </Button>

              <div
                style={{
                  marginTop: '16px',
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>运行状态日志：</div>
                {logs.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      color: log.includes('结束') ? '#52c41a' : '#1677ff',
                    }}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </Space>
          </Card>
        </Col>

        {/* ==================== 方案一：SmartIdleLoad ==================== */}
        <Col span={24}>
          <Divider>
            <Tag color="blue">方案一</Tag>
            <Text strong style={{ marginLeft: 8 }}>
              requestIdleCallback（SmartIdleLoad）
            </Text>
          </Divider>
        </Col>

        <Col span={24}>
          <Card title="一、Bug 出现的现象" bordered={false}>
            <Paragraph>
              当页面初始化时直接加载重型组件（如 ECharts 图表），如果此时主线程正在处理其他任务，
              图表的初始化和渲染会阻塞页面交互，导致用户感受到明显的卡顿甚至 UI 冻结。
            </Paragraph>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="二、Bug 出现的底层原因" bordered={false}>
            <Paragraph>
              JavaScript 是单线程执行的。重型组件的初始化涉及大量 DOM 操作、样式计算和布局重排，
              这些同步任务会长时间占用主线程，导致浏览器无法响应用户的点击、滚动等交互事件。
            </Paragraph>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="三、Bug 如何解决">
            <CodeDiff
              oldValue={IdleLoadExamples.traditional}
              newValue={IdleLoadExamples.optimizedSmart}
              leftTitle="传统直接渲染（反面教材）"
              rightTitle="SmartIdleLoad 闲时加载（最佳实践）"
              type="success"
              language="tsx"
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="四、为什么要这样解决 & 互动演示">
            <Paragraph>
              <code>requestIdleCallback</code> 让浏览器在空闲帧时执行回调，
              确保关键交互（如点击、输入）不被阻塞。
              下方的图表会在主线程空闲后才渲染；如果点击阻塞主线程按钮，图表会智能等待。
            </Paragraph>
            <div style={{ marginTop: '20px' }}>
              <SmartIdleLoad
                fallback={
                  <div
                    style={{
                      height: '400px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#fafafa',
                      borderRadius: '8px',
                    }}
                  >
                    <Spin tip="等待主线程空闲中 (SmartIdleLoad)..." />
                  </div>
                }
                timeout={10000}
              >
                <ComplexChart />
              </SmartIdleLoad>
            </div>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="五、核心组件源码">
            <Paragraph>
              <Text strong>SmartIdleLoad</Text> 利用 <code>requestIdleCallback</code> API
              在浏览器空闲帧时渲染子组件，内置 setTimeout 垫片兼容 Safari。
            </Paragraph>
            <CodeDiff
              code={IdleLoadExamples.smartIdleLoadSource}
              title="SmartIdleLoad.jsx 完整实现"
              type="info"
              language="jsx"
            />
          </Card>
        </Col>

        {/* ==================== 方案二：TransitionIdleLoad ==================== */}
        <Col span={24}>
          <Divider>
            <Tag color="purple">方案二</Tag>
            <Text strong style={{ marginLeft: 8 }}>
              React 18 useTransition（TransitionIdleLoad）
            </Text>
          </Divider>
        </Col>

        <Col span={24}>
          <Card title="一、Bug 出现的现象" bordered={false}>
            <Paragraph>
              在 React 18 之前，所有状态更新都是同步且不可中断的。当用户在一个输入框中打字时，
              如果同时触发了一个重型列表的过滤渲染，打字会感到明显的粘滞感——
              因为输入框的更新被列表渲染阻塞了。
            </Paragraph>
            <Paragraph>
              类似地，当页面挂载重型组件（如复杂图表）时，如果用户在此期间进行交互，
              交互响应会被延迟，直到组件完全渲染完毕。
            </Paragraph>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="二、Bug 出现的底层原因" bordered={false}>
            <Paragraph>
              React 18 之前使用 Stack Reconciler，渲染过程是同步且不可中断的。 一旦开始渲染，React
              会一口气把所有组件更新完才交还控制权给浏览器。
              这意味着：即使浏览器正在处理用户的输入事件，React 也会霸占主线程直到渲染结束。
            </Paragraph>
            <Paragraph>
              React 18 引入了 Fiber 架构和并发模式（Concurrent Mode）， 配合{' '}
              <code>useTransition</code> Hook，可以将某些更新标记为过渡更新（Transition Update）。
              这类更新被 React Scheduler 视为低优先级，可以被更高优先级的任务（如用户输入）中断。
            </Paragraph>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="三、Bug 如何解决">
            <CodeDiff
              oldValue={IdleLoadExamples.traditional}
              newValue={IdleLoadExamples.optimizedTransition}
              leftTitle="传统直接渲染（反面教材）"
              rightTitle="TransitionIdleLoad 闲时加载（最佳实践）"
              type="success"
              language="tsx"
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="四、为什么要这样解决 & 互动演示">
            <Paragraph>
              <code>useTransition</code> 将组件挂载标记为低优先级过渡更新。 React Scheduler
              会在处理完所有紧急更新后执行它，且期间如有用户交互可立即中断当前渲染。
              下方的图表会以过渡方式挂载，过程中会显示 <code>isPending</code> 状态指示器。
            </Paragraph>
            <Alert
              message="与方案一的差异"
              description="方案一（requestIdleCallback）等浏览器空闲才执行，不可中断；方案二（useTransition）由 React 内部调度，可被用户交互中断，且提供 isPending 过渡状态反馈。"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ marginTop: '20px' }}>
              <TransitionIdleLoad
                fallback={
                  <div
                    style={{
                      height: '400px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#fafafa',
                      borderRadius: '8px',
                    }}
                  >
                    <Spin tip="Scheduler 调度渲染中 (TransitionIdleLoad)..." />
                  </div>
                }
              >
                <ComplexChart />
              </TransitionIdleLoad>
            </div>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="五、核心组件源码 & 优缺点">
            <Paragraph>
              <Text strong>TransitionIdleLoad</Text> 利用 React 18 <code>useTransition</code>
              将组件挂载标记为低优先级过渡更新，由 React Scheduler 统一调度。
            </Paragraph>
            <CodeDiff
              code={IdleLoadExamples.transitionIdleLoadSource}
              title="TransitionIdleLoad.tsx 完整实现"
              type="info"
              language="tsx"
            />

            <Divider />

            <Paragraph>
              <Text strong>方案二优缺点清单：</Text>
            </Paragraph>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card
                  size="small"
                  title={<Tag color="green">优点</Tag>}
                  bordered={false}
                  style={{ background: '#f6ffed' }}
                >
                  <ul>
                    <li>可被高优先级更新中断，交互响应更及时</li>
                    <li>提供 isPending 过渡状态，UI 反馈更丰富</li>
                    <li>React 18+ 原生支持，无需浏览器 API</li>
                    <li>与 React 生命周期深度集成，自动处理</li>
                    <li>Safari 等浏览器全兼容</li>
                  </ul>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  size="small"
                  title={<Tag color="red">缺点</Tag>}
                  bordered={false}
                  style={{ background: '#fff2f0' }}
                >
                  <ul>
                    <li>仅适用于 React 18+ 项目</li>
                    <li>不适用于非 React 逻辑（如纯数据上报）</li>
                    <li>无法控制等待空闲的精确时机（由 Scheduler 决定）</li>
                    <li>过渡更新可能被频繁中断，导致渲染延迟</li>
                    <li>需要理解并发模式和优先级概念，学习成本较高</li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* ==================== 两种方案并排对比 ==================== */}
        <Col span={24}>
          <Divider>
            <Text strong>两种方案并排对比</Text>
          </Divider>
        </Col>

        <Col span={24}>
          <Card title="方案一 vs 方案二：核心差异">
            <CodeDiff
              code={IdleLoadExamples.comparisonCode}
              title="两种方案的核心差异对比"
              type="info"
              language="tsx"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default IdleLoadPage;
