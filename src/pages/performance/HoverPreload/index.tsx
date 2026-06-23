import React, { lazy, useState, Suspense } from 'react';
import { Card, Button, Typography, Space, Tag, Spin, Row, Col, Tabs, Alert } from 'antd';
import { useAppModal } from '../../../hooks/useAppModal';
import CodeBlock from '../../../components/CodeBlock';
import { HoverPreloadExamples } from './Examples';
import { CheckCircleOutlined } from '@ant-design/icons';
import { loader } from '@monaco-editor/react';

const { Title, Paragraph, Text } = Typography;

// 1. 定义不同的加载器
const HeavyChartLoader = () => import('../../../samples/HeavyChart');
const HeavyEditorLoader = () => import('../../../samples/HeavyEditor');

// 2. 包装为 lazy 组件
const HeavyChart = lazy(HeavyChartLoader);
const HeavyEditor = lazy(HeavyEditorLoader);

const HoverPreloadPage: React.FC = () => {
  const { openFormModal } = useAppModal();

  // 状态 1：图表演示
  const [showChart, setShowChart] = useState(false);
  const [chartPreloaded, setChartPreloaded] = useState(false);

  // 状态 2：Modal 演示（已改用函数式弹窗，无需 useState 管理 visible）
  const [editorPreloaded, setEditorPreloaded] = useState(false);

  // 日志记录
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (msg: string) => {
    const timestamp = performance.now().toFixed(2);
    setLogs((prev) => [`[${timestamp}ms] ${msg}`, ...prev].slice(0, 5));
  };

  // 交互处理器
  const handleChartHover = () => {
    if (chartPreloaded || showChart) return;
    setChartPreloaded(true);
    addLog('【场景 A】鼠标移入图表按钮，后台静默下载 ECharts JS 资源...');
    HeavyChartLoader().then(() => addLog('【场景 A】图表资源已进入缓存！'));
  };

  const handleEditorHover = () => {
    if (editorPreloaded) return;
    setEditorPreloaded(true);

    addLog('【场景 B】触发深度预加载：开始下载壳组件 + Monaco 核心库 (4MB+)...');

    // 关键点：并行触发 壳组件加载 和 Monaco 核心库初始化
    /**
     *   1. “壳组件”与“核心库”的剥离
     *   在 @monaco-editor/react 的架构设计中，为了防止主包（Main Bundle）体积爆炸，它采用了双重异步策略：
     *
     *    * HeavyEditorLoader() (壳组件)：这是你项目里的一个 .tsx 文件。它包含了 React 的逻辑、样式、Modal 的配置等。它很轻量（约
     *      20KB）。
     *    * Monaco Core (核心库)：这是微软开发的真正的编辑器引擎。它非常庞大（4MB+）。为了优化，@monaco-editor/react
     *      默认不会把它打包进你的 JS 里，而是通过异步脚本（通常从 CDN）去下载。
     *
     *   2. 为什么只加 HeavyEditorLoader() 不行？
     *   如果你只写了 HeavyEditorLoader()，流程是这样的：
     *
     *    1. Hover 阶段：浏览器下载了你的 HeavyEditor.tsx 对应的 JS 分片。
     *    2. 点击阶段：React 开始渲染 HeavyEditor 组件。
     *    3. 渲染中途：组件代码执行到 <Editor /> 这一行。
     *    4. 触发下载：此时，@monaco-editor/react 的内部逻辑才会发现：“哎呀，我还没下载 Monaco
     *       核心库呢！”，然后它才临时去创建一个 <script> 标签请求 4MB 的资源。
     *
     *   结果：用户点击按钮后，依然会看到好几秒的 Loading 旋转，因为最耗时的“大头”（Monaco
     *   核心库）是在点击后才开始下载的。预加载失效了。
     *
     *   3. loader.init() 的原理：抢跑
     *   loader.init() 是该库提供的一个“手动触发器”。它的唯一作用就是：不等组件渲染，现在就去下载那 4MB 的核心库。
     *
     *   当你在 onMouseEnter 里面写了 Promise.all([HeavyEditorLoader(), loader.init()]) 时：
     *
     *    1. 并行下载：浏览器同时开启两个通道。一个下载 20KB 的 React 代码，一个下载 4MB 的编辑器引擎。
     *    2. 提前就绪：通常用户从“鼠标移入”到“点击鼠标”之间有 200ms~1000ms 的间隙。在这个间隙里，那 4MB
     *       的大文件已经在后台静默下载并解压完毕，存入浏览器内存了。
     *    3. 秒开体验：当用户最终点击时，React 渲染组件，<Editor /> 发现内存里已经有现成的 Monaco
     *       引擎了，直接拿来用。用户完全感知不到加载过程。
     *
     *   4. 深度原理：打破“执行触发”的限制
     *   在前端工程化中，动态 import() 只能加载静态代码块。但 Monaco 这种库往往包含：
     *    * Main Thread JS (核心逻辑)
     *    * Worker JS (负责语法解析的独立线程)
     *    * WASM 文件 (高性能计算)
     *
     *   这些资源不是简单的 import 就能全部搞定的，它们需要特定的脚本加载器去初始化。loader.init()
     *   内部其实就是在做这件事：它会动态创建 Worker 和注入全局变量。不调用它，这些重型初始化动作永远不会在后台悄悄发生。
     */
    Promise.all([
      HeavyEditorLoader(), // 加载壳组件 (20KB)
      loader.init(), // 手动触发 Monaco 核心库下载 (几MB)
    ]).then(() => {
      addLog('【场景 B】深度预加载完成！壳组件与 Monaco 核心库均已就绪。');
    });
  };

  const reset = () => {
    setShowChart(false);
    setChartPreloaded(false);
    setEditorPreloaded(false);
    setLogs([]);
    addLog('已重置状态');
  };

  return (
    <div>
      <Title level={2}>性能优化专题：意图预判 - Hover 预加载</Title>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="优化核心：按需加载与提前预判" bordered={false}>
            <Paragraph>
              重型业务组件（如大型图表库、富文本编辑器）如果直接放入主包，会导致首屏下载时间剧增。
              <Text strong>Hover 预加载</Text>{' '}
              既保证了组件在不被查看时不加载，又能在用户即将点击的那几百毫秒内“偷跑”加载。
            </Paragraph>
            <Alert
              message="为什么需要 Hover 预加载？"
              description={
                <ul>
                  <li>
                    <Text strong>避免浪费：</Text> 用户如果不点开，JS 资源永远不会被下载。
                  </li>
                  <li>
                    <Text strong>无感体验：</Text> 抵消掉动态 import() 的网络开销，实现秒开。
                  </li>
                  <li>
                    <Text strong>减少主包体积：</Text> 将重型库彻底从主包剥离。
                  </li>
                </ul>
              }
              type="info"
              showIcon
            />
          </Card>
        </Col>

        {/* 场景 A */}
        <Col span={12}>
          <Card
            title="场景 A：业务报表图表"
            extra={
              <Tag color={chartPreloaded ? 'green' : 'default'}>
                {chartPreloaded ? '已预加载' : '未加载'}
              </Tag>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onMouseEnter={handleChartHover}
                onClick={() => setShowChart(true)}
              >
                点击查看业务详情报表
              </Button>
              <div
                style={{
                  height: '350px',
                  border: '1px dashed #d9d9d9',
                  borderRadius: '8px',
                  padding: '10px',
                }}
              >
                {showChart ? (
                  <Suspense
                    fallback={
                      <div style={{ textAlign: 'center', marginTop: '100px' }}>
                        <Spin tip="如果预判成功，你看不到我" />
                      </div>
                    }
                  >
                    <HeavyChart />
                  </Suspense>
                ) : (
                  <div style={{ textAlign: 'center', color: '#bfbfbf', marginTop: '150px' }}>
                    鼠标悬停在上方按钮开始预加载，点击展示图表
                  </div>
                )}
              </div>
            </Space>
          </Card>
        </Col>

        {/* 场景 B */}
        <Col span={12}>
          <Card
            title="场景 B：配置编辑器弹窗"
            extra={
              <Tag color={editorPreloaded ? 'blue' : 'default'}>
                {editorPreloaded ? '已预判' : '待命中'}
              </Tag>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                ghost
                icon={<CheckCircleOutlined />}
                onMouseEnter={handleEditorHover}
                onClick={() =>
                  openFormModal({
                    title: '高级业务配置编辑器',
                    maskClosable: true,
                    width: 800,
                    content: (
                      <Suspense
                        fallback={
                          <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Spin tip="加载编辑器主逻辑中..." />
                          </div>
                        }
                      >
                        <HeavyEditor />
                      </Suspense>
                    ),
                  })
                }
              >
                进入高级业务配置 (Modal)
              </Button>
              <div
                style={{
                  height: '350px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: '#fafafa',
                  borderRadius: '8px',
                }}
              >
                <Paragraph type="secondary">点击后弹出的内容包含了 2MB+ 的业务编辑器资源</Paragraph>
                {editorPreloaded && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    后台已异步完成加载
                  </Tag>
                )}
              </div>
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="网络与性能监控模拟">
            <div
              style={{
                background: '#001529',
                padding: '15px',
                borderRadius: '4px',
                color: '#fff',
                minHeight: '120px',
              }}
            >
              {logs.length === 0 && (
                <div style={{ color: '#555' }}>等待用户交互 (移动鼠标到上方按钮看看)...</div>
              )}
              {logs.map((log, index) => (
                <div
                  key={index}
                  style={{ fontFamily: 'monospace', fontSize: '12px', marginBottom: '4px' }}
                >
                  <Text
                    style={{
                      color: log.includes('缓存') || log.includes('就绪') ? '#52c41a' : '#1677ff',
                    }}
                  >
                    {log}
                  </Text>
                </div>
              ))}
            </div>
            <Button size="small" style={{ marginTop: '10px' }} onClick={reset}>
              重置演示
            </Button>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="代码示例 (规范写法)">
            <Tabs
              items={[
                {
                  key: '1',
                  label: '场景 A：图表预加载实现',
                  children: <CodeBlock code={HoverPreloadExamples.chartOptimized} language="tsx" />,
                },
                {
                  key: '2',
                  label: '场景 B：弹窗编辑器实现',
                  children: <CodeBlock code={HoverPreloadExamples.modalOptimized} language="tsx" />,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HoverPreloadPage;
