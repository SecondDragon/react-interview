import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Alert,
  Tag,
  Progress,
  Statistic,
  Row,
  Col,
  Radio,
  Divider,
  Spin,
  Table,
  Space,
} from 'antd';
import {
  ThunderboltOutlined,
  StopOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import CodeDiff from '@/components/CodeDiff';
import CodeBlock from '@/components/CodeBlock';
import {
  BigJsonParseExamples,
  generateBigJSON,
  parseJSONInWorker,
  parseJSONInChunks,
} from './Examples';

const { Title, Paragraph, Text } = Typography;

// ============================================
// 类型定义
// ============================================
interface ParseResult {
  method: string;
  duration: number;
  itemCount: number;
  jsonSize: string;
  blocked: boolean;
}

interface TableRecord {
  key: string;
  id: string;
  name: string;
  type: string;
  status: string;
  amount: number;
}

// ============================================
// 动画组件：检测主线程是否被阻塞
// ============================================
const BlockDetector: React.FC<{ running: boolean }> = ({ running }) => {
  const [frameCount, setFrameCount] = useState(0);
  const frameRef = useRef(0);
  const runningRef = useRef(running);

  runningRef.current = running;

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      frameRef.current += 1;
      setFrameCount(frameRef.current);
      if (runningRef.current) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [running]);

  const isBlocked = running && frameCount > 0 && frameCount % 60 !== 0;
  // 实际检测：如果 running 为 true 但 frameCount 长时间不增加，说明被阻塞
  const [lastFrame, setLastFrame] = useState(0);
  const [blockedTime, setBlockedTime] = useState(0);

  useEffect(() => {
    if (!running) {
      setBlockedTime(0);
      return;
    }
    const interval = setInterval(() => {
      if (frameRef.current === lastFrame) {
        setBlockedTime((t) => t + 100);
      } else {
        setBlockedTime(0);
        setLastFrame(frameRef.current);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [running, lastFrame]);

  const actuallyBlocked = blockedTime > 200;

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: 8,
        background: actuallyBlocked ? '#fff2f0' : '#f6ffed',
        border: `1px solid ${actuallyBlocked ? '#ffccc7' : '#b7eb8f'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.3s',
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: actuallyBlocked ? '#ff4d4f' : '#52c41a',
          animation: running ? 'pulse 0.5s infinite' : 'none',
        }}
      />
      <Text strong style={{ color: actuallyBlocked ? '#cf1322' : '#389e0d' }}>
        {actuallyBlocked
          ? '🔴 主线程被阻塞！动画已冻结'
          : running
            ? '🟢 主线程正常，动画流畅运行'
            : '⚪ 等待开始测试'}
      </Text>
      <Text type="secondary" style={{ marginLeft: 'auto' }}>
        RAF 帧数: {frameCount}
      </Text>
    </div>
  );
};

// ============================================
// 主页面组件
// ============================================
const BigJsonParsePage: React.FC = () => {
  // --- 状态 ---
  const [parseMethod, setParseMethod] = useState<'sync' | 'worker' | 'chunk'>('sync');
  const [dataSize, setDataSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ParseResult[]>([]);
  const [tableData, setTableData] = useState<TableRecord[]>([]);
  const [currentJsonText, setCurrentJsonText] = useState('');
  const [parseTime, setParseTime] = useState(0);
  const [jsonSizeText, setJsonSizeText] = useState('');

  const abortRef = useRef<(() => void) | null>(null);

  // 获取数据条数
  const getItemCount = useCallback(() => {
    switch (dataSize) {
      case 'small':
        return 3000;
      case 'medium':
        return 15000;
      case 'large':
        return 50000;
    }
  }, [dataSize]);

  // 生成数据
  const generateData = useCallback(() => {
    const count = getItemCount();
    const json = generateBigJSON(count);
    const sizeMB = (json.length / 1024 / 1024).toFixed(2);
    setCurrentJsonText(json);
    setJsonSizeText(sizeMB + ' MB');
    setTableData([]);
    setProgress(0);
    setParseTime(0);
    return { json, sizeMB };
  }, [getItemCount]);

  // 开始解析测试
  const startParse = useCallback(async () => {
    if (isRunning) return;

    const { json, sizeMB } = currentJsonText
      ? { json: currentJsonText, sizeMB: jsonSizeText.replace(' MB', '') }
      : generateData();

    setIsRunning(true);
    setProgress(0);
    setTableData([]);
    setParseTime(0);

    const startTime = performance.now();
    let duration = 0;

    try {
      if (parseMethod === 'sync') {
        // ❌ 同步解析 - 会阻塞主线程
        const parsed = JSON.parse(json);
        duration = performance.now() - startTime;
        const items = parsed.data?.items || [];
        setTableData(
          items.slice(0, 100).map((item: any, idx: number) => ({
            key: String(idx),
            id: item.id,
            name: item.name,
            type: item.type,
            status: item.status,
            amount: item.amount,
          }))
        );
        setProgress(100);
      } else if (parseMethod === 'worker') {
        // ✅ Web Worker 解析
        const { promise, terminate } = parseJSONInWorker(json, (p) => {
          setProgress(p);
        });
        abortRef.current = terminate;

        const parsed = await promise;
        duration = performance.now() - startTime;
        const items = parsed.data?.items || [];
        setTableData(
          items.slice(0, 100).map((item: any, idx: number) => ({
            key: String(idx),
            id: item.id,
            name: item.name,
            type: item.type,
            status: item.status,
            amount: item.amount,
          }))
        );
        setProgress(100);
      } else if (parseMethod === 'chunk') {
        // ✅ 分片解析
        const chunkSize = 500;
        await parseJSONInChunks(
          json,
          chunkSize,
          (chunk, prog) => {
            setProgress(prog);
            // 渐进式更新表格，只显示最新的 100 条
            setTableData((prev) => {
              const combined = [...prev];
              chunk.forEach((item: any) => {
                combined.push({
                  key: item.id,
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  status: item.status,
                  amount: item.amount,
                });
              });
              return combined.slice(-100);
            });
          }
        );
        duration = performance.now() - startTime;
        setProgress(100);
      }

      setParseTime(Math.round(duration));
      setResults((prev) => [
        ...prev,
        {
          method: parseMethod,
          duration: Math.round(duration),
          itemCount: getItemCount(),
          jsonSize: sizeMB + ' MB',
          blocked: parseMethod === 'sync',
        },
      ]);
    } catch (err) {
      console.error('解析失败:', err);
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [isRunning, currentJsonText, jsonSizeText, parseMethod, generateData, getItemCount]);

  // 终止测试
  const stopParse = useCallback(() => {
    if (abortRef.current) {
      abortRef.current();
      abortRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // 表格列定义
  const columns = [
    { title: '资产ID', dataIndex: 'id', key: 'id', width: 180 },
    { title: '名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          正常: 'success',
          冻结: 'error',
          核销: 'default',
          转让: 'processing',
          质押: 'warning',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
  ];

  // 历史结果表格列
  const resultColumns = [
    {
      title: '解析方式',
      dataIndex: 'method',
      key: 'method',
      render: (m: string) =>
        m === 'sync' ? (
          <Tag color="error">同步 JSON.parse</Tag>
        ) : m === 'worker' ? (
          <Tag color="processing">Web Worker</Tag>
        ) : (
          <Tag color="success">分片解析</Tag>
        ),
    },
    { title: '数据条数', dataIndex: 'itemCount', key: 'itemCount' },
    { title: 'JSON 大小', dataIndex: 'jsonSize', key: 'jsonSize' },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      render: (d: number) => <Text strong>{d} ms</Text>,
    },
    {
      title: '是否阻塞',
      dataIndex: 'blocked',
      key: 'blocked',
      render: (b: boolean) =>
        b ? <Tag color="error">阻塞主线程</Tag> : <Tag color="success">非阻塞</Tag>,
    },
  ];

  return (
    <div>
      <Title level={2}>性能优化：大数据量 JSON 解析</Title>

      {/* 面试考点提示 */}
      <Alert
        message="面试高频考点"
        description="银行数据资产管理系统中，后端接口返回 MB 级 JSON 数据时，JSON.parse 会阻塞主线程导致页面假死。本页面对比同步解析、Web Worker、分片解析三种方案的实际效果。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[24, 24]}>
        {/* 左侧：控制面板 */}
        <Col xs={24} lg={8}>
          <Card title="测试配置" bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* 数据规模选择 */}
              <div>
                <Text strong>数据规模：</Text>
                <Radio.Group
                  value={dataSize}
                  onChange={(e) => {
                    setDataSize(e.target.value);
                    setCurrentJsonText('');
                    setTableData([]);
                  }}
                  style={{ marginTop: 8 }}
                >
                  <Radio.Button value="small">
                    <DatabaseOutlined /> 3,000 条 (~1MB)
                  </Radio.Button>
                  <Radio.Button value="medium">
                    <DatabaseOutlined /> 15,000 条 (~5MB)
                  </Radio.Button>
                  <Radio.Button value="large">
                    <DatabaseOutlined /> 50,000 条 (~15MB)
                  </Radio.Button>
                </Radio.Group>
              </div>

              {/* 解析方式选择 */}
              <div>
                <Text strong>解析方式：</Text>
                <Radio.Group
                  value={parseMethod}
                  onChange={(e) => setParseMethod(e.target.value)}
                  style={{ marginTop: 8 }}
                >
                  <Radio.Button value="sync">
                    <StopOutlined /> 同步 JSON.parse
                  </Radio.Button>
                  <Radio.Button value="worker">
                    <ThunderboltOutlined /> Web Worker
                  </Radio.Button>
                  <Radio.Button value="chunk">
                    <ClockCircleOutlined /> 分片解析
                  </Radio.Button>
                </Radio.Group>
              </div>

              {/* 操作按钮 */}
              <Space>
                <Button
                  type="primary"
                  onClick={startParse}
                  loading={isRunning}
                  disabled={isRunning}
                  size="large"
                >
                  {isRunning ? '解析中...' : '开始解析测试'}
                </Button>
                {isRunning && (
                  <Button danger onClick={stopParse} size="large">
                    终止测试
                  </Button>
                )}
              </Space>

              {/* 当前状态 */}
              {jsonSizeText && (
                <div style={{ padding: 12, background: '#f6ffed', borderRadius: 8 }}>
                  <Text type="success">已生成测试数据：{jsonSizeText}</Text>
                </div>
              )}

              {/* 进度条 */}
              {isRunning && (
                <div>
                  <Text>解析进度：</Text>
                  <Progress percent={progress} status="active" />
                </div>
              )}

              {/* 耗时统计 */}
              {parseTime > 0 && !isRunning && (
                <Statistic
                  title="解析耗时"
                  value={parseTime}
                  suffix="ms"
                  valueStyle={{
                    color: parseMethod === 'sync' && parseTime > 1000 ? '#cf1322' : '#52c41a',
                  }}
                />
              )}
            </Space>
          </Card>

          {/* 主线程阻塞检测 */}
          <Card title="主线程状态监测" style={{ marginTop: 16 }} bordered={false}>
            <BlockDetector running={isRunning} />
            <Paragraph type="secondary" style={{ marginTop: 12, fontSize: 12 }}>
              通过 requestAnimationFrame 检测主线程是否被阻塞。
              如果圆点变红，说明 JSON.parse 占用了主线程，页面无法响应交互。
            </Paragraph>
          </Card>
        </Col>

        {/* 右侧：数据展示 */}
        <Col xs={24} lg={16}>
          <Card
            title="解析结果预览（仅展示前 100 条）"
            bordered={false}
            extra={
              tableData.length > 0 ? (
                <Tag color="blue">已加载 {tableData.length} 条</Tag>
              ) : null
            }
          >
            {isRunning && tableData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" tip="正在解析 JSON 数据..." />
              </div>
            ) : tableData.length > 0 ? (
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                scroll={{ y: 400 }}
                size="small"
                bordered
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                点击"开始解析测试"生成数据并查看结果
              </div>
            )}
          </Card>

          {/* 历史对比 */}
          {results.length > 0 && (
            <Card title="测试结果对比" style={{ marginTop: 16 }} bordered={false}>
              <Table
                columns={resultColumns}
                dataSource={results.map((r, i) => ({ ...r, key: i }))}
                pagination={false}
                size="small"
                bordered
              />
            </Card>
          )}
        </Col>
      </Row>

      <Divider style={{ margin: '40px 0' }} />

      {/* ============================================
          一、现象描述
      ============================================ */}
      <Title level={3}>一、现象描述</Title>
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <div style={{ whiteSpace: 'pre-line', lineHeight: 2 }}>
          {BigJsonParseExamples.phenomenon}
        </div>
      </Card>

      {/* ============================================
          二、底层原因
      ============================================ */}
      <Title level={3}>二、底层原因</Title>
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <div style={{ whiteSpace: 'pre-line', lineHeight: 2 }}>
          {BigJsonParseExamples.rootCause}
        </div>
      </Card>

      {/* ============================================
          三、解决方案对比
      ============================================ */}
      <Title level={3}>三、解决方案对比</Title>

      <Alert
        message="方案选择建议"
        description="优先推服务端分页；必须全量时用流式解析；Worker 作为兜底；同步解析仅用于小数据。"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* 3.1 反面教材 */}
      <CodeDiff
        oldValue={BigJsonParseExamples.badCode}
        newValue={BigJsonParseExamples.goodCodePagination}
        leftTitle="❌ 反面教材：直接同步解析"
        rightTitle="✅ 最佳实践：服务端分页"
        type="error"
        hideDiffMarkers={true}
        language="typescript"
      />

      {/* 3.2 Web Worker 方案 */}
      <Title level={4} style={{ marginTop: 24 }}>
        方案二：Web Worker 异步解析
      </Title>
      <Paragraph>
        将 JSON.parse 放到 Worker 线程执行，主线程保持响应。注意 Worker 解析后回传大对象仍有开销。
      </Paragraph>
      <CodeBlock code={BigJsonParseExamples.goodCodeWorker} language="typescript" type="success" title="Web Worker 实现" />

      {/* 3.3 分片解析方案 */}
      <Title level={4} style={{ marginTop: 24 }}>
        方案三：分片解析 + 渐进渲染
      </Title>
      <Paragraph>
        利用 ReadableStream 逐块读取响应数据，每解析一批就渲染一批，配合 requestIdleCallback 让出主线程。
      </Paragraph>
      <CodeBlock code={BigJsonParseExamples.goodCodeChunked} language="typescript" type="success" title="分片解析实现" />

      {/* 3.4 流式解析方案 */}
      <Title level={4} style={{ marginTop: 24 }}>
        方案四：流式 JSON 解析（终极方案）
      </Title>
      <Paragraph>
        使用流式解析器（如 @streamparser/json-whatwg）边接收边解析，内存占用最低，适合 20MB+ 超大数据。
      </Paragraph>
      <CodeBlock code={BigJsonParseExamples.goodCodeStreaming} language="typescript" type="success" title="流式解析实现" />

      <Divider style={{ margin: '40px 0' }} />

      {/* ============================================
          四、权衡与互动演示
      ============================================ */}
      <Title level={3}>四、权衡分析与方案对比</Title>
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <div style={{ whiteSpace: 'pre-line', lineHeight: 2 }}>
          {BigJsonParseExamples.rationale}
        </div>
      </Card>

      <Divider style={{ margin: '40px 0' }} />

      {/* ============================================
          五、核心原理
      ============================================ */}
      <Title level={3}>五、核心原理</Title>
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <div style={{ whiteSpace: 'pre-line', lineHeight: 2 }}>
          {BigJsonParseExamples.corePrinciple}
        </div>
      </Card>

      {/* CSS 动画 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default BigJsonParsePage;
