import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { Card, Typography, Alert, Divider, Tag, Button, Space, Badge } from 'antd';
import { PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import CodeBlock from '@/components/CodeBlock';
import { SSEDemoExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;

// ==================== 类型定义 ====================

interface AnswerChunk {
  table: string;
  content: string;
  type: 'answer';
}
interface FinalChunk {
  ids: { table: string; id: string }[];
  type: 'final';
}
type StreamChunk = AnswerChunk | FinalChunk;

/**
 * 聚合后的卡片数据：每个 table 对应一条累积内容
 * 这是从"流式片段"到"可渲染卡片"的关键数据结构
 */
interface AggregatedCard {
  table: string;
  content: string; // 该 table 下所有片段拼接后的完整 Markdown
}

// ==================== 纯工具函数 ====================

/** 从 AST 节点提取纯文本（用于卡片内部二次渲染 Markdown） */
function extractTextFromNode(node: any): string {
  if (!node.children) return '';
  return node.children
    .map((child: any) => {
      if (child.type === 'text') return child.value;
      if (child.children) return extractTextFromNode(child);
      return '';
    })
    .join('');
}

/**
 * 🔑 核心聚合函数：把流式片段按 table 分组累加
 *
 * 面试要点：这是从 O(n²) 全量解析优化到 O(n) 增量更新的关键。
 * 不再每次把全部 chunks 拼成一个大 Markdown 字符串，
 * 而是维护每张卡片的独立内容，新片段只影响对应卡片。
 */
function aggregateChunks(chunks: AnswerChunk[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const c of chunks) {
    const prev = map.get(c.table) || '';
    map.set(c.table, prev + c.content);
  }
  return map;
}

// ==================== 自定义 remark 插件 ====================

/** 将 remark-directive 解析的 :::asset 节点转换为可渲染的自定义元素 */
function remarkAssetPlugin() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (node.type === 'containerDirective' && node.name === 'asset' && node.data == null) {
        node.data = {
          hName: 'asset',
          hProperties: node.attributes || {},
        };
      }
    });
  };
}

// ==================== 资产卡片组件 ====================

const AssetCard: React.FC<{
  table: string;
  children: React.ReactNode;
  finalIds: { table: string; id: string }[];
  done: boolean;
}> = memo(({ table, children, finalIds, done }) => {
  const matched = finalIds.find((f) => f.table === table);
  const isVerified = !!matched;

  return (
    <div
      style={{
        background: '#fff',
        border: `1.5px solid ${isVerified ? '#3b82f6' : '#e5e7eb'}`,
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 14,
        transition: 'all 0.3s',
        boxShadow: isVerified ? '0 2px 12px rgba(59,130,246,0.1)' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
          paddingBottom: 10,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            margin: 0,
            color: isVerified ? '#3b82f6' : '#374151',
            cursor: isVerified ? 'pointer' : 'default',
          }}
          onClick={() => {
            if (isVerified && matched) alert(`跳转: /asset/${matched.id}`);
          }}
        >
          {table} {isVerified && <span style={{ fontSize: '0.85rem' }}>#</span>}
        </h3>
        <Space>
          {isVerified && (
            <span
              style={{
                background: '#dbeafe',
                color: '#1e40af',
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: 12,
              }}
            >
              已入库
            </span>
          )}
          {!done && (
            <span
              style={{
                background: '#fef3c7',
                color: '#92400e',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: 12,
              }}
            >
              接收中
            </span>
          )}
        </Space>
      </div>
      <div style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.7 }}>{children}</div>
    </div>
  );
});
AssetCard.displayName = 'AssetCard';

// ==================== 单卡片 Markdown 渲染器（流式追加版）====================

/**
 * 🔑 优化的关键：每个 table 对应一张 MemoCard，content 是聚合后的完整字符串。
 *
 * 与之前版本的区别：
 * - 之前：每条 SSE 消息 = 一张完整卡片，content 不再变化
 * - 现在：多条 SSE 消息 = 一张卡片，content 随新片段到达而追加
 *
 * 所以 memo 对比函数要比较 content 字符串，只有本卡片内容变化时才重渲染。
 * 其他卡片的 ReactMarkdown 完全不受影响。
 */
interface MemoCardProps {
  table: string;
  content: string; // 聚合后的完整 Markdown 内容（会随流式片段到达而增长）
  finalIds: { table: string; id: string }[];
  done: boolean;
}

const MemoCard = memo(
  ({ table, content, finalIds, done }: MemoCardProps) => {
    /**
     * 生成单卡片的 Markdown 指令块。
     * 注意：content 是聚合后的完整字符串，所以 react-markdown 每次只解析这一张卡片的内容。
     */
    const markdown = `:::asset{table="${table}"}\n${content}\n:::`;

    /**
     * components 只在 finalIds 或 done 变化时重建。
     * finalIds 只变一次（final 消息到达时），done 也只变一次。
     */
    const components = useMemo(
      () => ({
        asset: (props: any) => {
          const { table: t } = props.node?.attributes ?? {};
          const text = extractTextFromNode(props.node);
          return (
            <AssetCard table={t} finalIds={finalIds} done={done}>
              {/* 卡片内部的 Markdown 内容交给子 ReactMarkdown 渲染 */}
              <ReactMarkdown>{text}</ReactMarkdown>
            </AssetCard>
          );
        },
      }),
      [finalIds, done]
    );

    return (
      <ReactMarkdown
        remarkPlugins={[remarkDirective, remarkAssetPlugin]}
        components={components as any}
      >
        {markdown}
      </ReactMarkdown>
    );
  },
  (prev, next) => {
    /**
     * 🛡 自定义比较函数：精确到单张卡片的数据变化
     *
     * 返回 true 表示"不需要重渲染"，返回 false 表示"需要重渲染"。
     *
     * 对于流式场景，关键优化点：
     * - prev.content === next.content：本卡片内容没变 → 跳过（最常见，高频触发）
     * - prev.done === next.done：全局完成状态没变
     * - prev.finalIds === next.finalIds：final 消息没变（引用比较，只变一次）
     *
     * 这样只有"收到属于本卡片的新片段"或"final 消息到达"时才会重渲染。
     */
    return (
      prev.content === next.content && prev.done === next.done && prev.finalIds === next.finalIds
    );
  }
);
MemoCard.displayName = 'MemoCard';

// ==================== 互动演示组件 ====================

const SSELiveDemo: React.FC = () => {
  /**
   * 原始 SSE 片段数组：按接收顺序存储，用于左侧原始数据展示
   * 结构不变，还是 AnswerChunk[]，但每条 content 只有 1-3 个字符
   */
  const [rawChunks, setRawChunks] = useState<AnswerChunk[]>([]);

  /**
   * 聚合后的卡片数据：由 rawChunks 派生，按 table 分组累加
   * 这是右侧渲染面板的数据源
   */
  const [cards, setCards] = useState<AggregatedCard[]>([]);

  const [finalIds, setFinalIds] = useState<FinalChunk['ids']>([]);
  const [connected, setConnected] = useState(false);
  const [done, setDone] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  /**
   * 连接 SSE：清空状态，建立 EventSource 连接
   */
  const connect = useCallback(() => {
    esRef.current?.close();
    setRawChunks([]);
    setCards([]);
    setFinalIds([]);
    setDone(false);
    setConnected(true);

    const es = new EventSource('/api/sse');
    esRef.current = es;

    /**
     * 处理 SSE 消息：
     * 1. 收到 answer 片段 → 追加到 rawChunks，并重新聚合生成 cards
     * 2. 收到 final 消息 → 设置 finalIds，标记 done，关闭连接
     */
    es.onmessage = (event) => {
      try {
        const chunk: StreamChunk = JSON.parse(event.data);

        if (chunk.type === 'final') {
          // final 消息到达：设置入库 ID 列表，标记完成
          setFinalIds(chunk.ids);
          setDone(true);
          es.close();
        } else {
          // answer 片段到达：追加到 rawChunks
          setRawChunks((prev) => {
            const next = [...prev, chunk];

            /**
             * 🔑 关键优化：在 setState 回调里直接计算聚合结果
             * 避免额外的 useMemo 依赖数组开销，也保证数据一致性
             */
            const aggregated = aggregateChunks(next);

            /**
             * 把 Map 转成数组，保持 table 首次出现的顺序（即卡片顺序稳定）
             * 这样新片段不会导致卡片位置跳动
             */
            const orderedCards: AggregatedCard[] = [];
            const seen = new Set<string>();
            // 先按首次出现顺序收集 table
            for (const c of next) {
              if (!seen.has(c.table)) {
                seen.add(c.table);
                orderedCards.push({ table: c.table, content: aggregated.get(c.table)! });
              }
            }

            setCards(orderedCards);
            return next;
          });
        }
      } catch {
        /* 忽略解析错误 */
      }
    };

    es.onerror = () => setConnected(false);
  }, []);

  // 组件卸载时关闭连接
  useEffect(
    () => () => {
      esRef.current?.close();
    },
    []
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={connect}
          disabled={connected && !done}
        >
          {connected && !done ? '接收中...' : '连接 SSE'}
        </Button>
        <Button icon={<ReloadOutlined />} onClick={connect} disabled={!done}>
          重放
        </Button>
        <Badge
          status={done ? 'success' : connected ? 'processing' : 'default'}
          text={done ? '完成' : connected ? '接收中' : '未连接'}
        />
        <Tag>{rawChunks.length} 条片段</Tag>
        <Tag>{cards.length} 张卡片</Tag>
      </Space>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* 左侧：原始 JSON（展示逐字符片段） */}
        <Card
          title="📡 原始 SSE 数据（逐字符片段）"
          size="small"
          style={{ flex: 1, background: '#1e1e1e', color: '#d4d4d4' }}
        >
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {rawChunks.length === 0 && <Text style={{ color: '#9ca3af' }}>等待 SSE 数据...</Text>}
            {rawChunks.map((c, i) => (
              <pre
                key={i}
                style={{
                  background: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: 6,
                  padding: '10px 14px',
                  marginBottom: 10,
                  fontSize: '0.75rem',
                  lineHeight: 1.6,
                  color: '#9cdcfe',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {JSON.stringify(c, null, 2)}
              </pre>
            ))}
          </div>
        </Card>

        {/* 右侧：逐卡聚合渲染 */}
        <Card title="🎨 逐卡聚合渲染 + memo 保护" size="small" style={{ flex: 1.2 }}>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {cards.length === 0 && <Text style={{ color: '#9ca3af' }}>等待渲染...</Text>}
            {cards.map((c) => (
              <MemoCard
                key={c.table} // table 作为 key，保证同一张卡片始终复用同一组件实例
                table={c.table}
                content={c.content} // 聚合后的完整内容，随片段到达而增长
                finalIds={finalIds}
                done={done}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ==================== 主页面 ====================

const SSEDemoPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>{SSEDemoExamples.title}</Title>
      <Paragraph>
        SSE（Server-Sent Events）是一种服务端到客户端的单向推送协议。当后端推送结构化 JSON 时，
        可以通过 <Text code>JSON → Markdown 转换</Text> + <Text code>react-markdown</Text>{' '}
        自定义渲染的方式， 实现流式数据到丰富 UI 的优雅映射。
      </Paragraph>

      {/* 一、问题场景 */}
      <Card title="一、问题场景" style={{ marginBottom: 24 }}>
        <Paragraph>{SSEDemoExamples.problem}</Paragraph>
      </Card>

      {/* 二、SSE 协议格式 */}
      <Card title="二、SSE 协议格式" style={{ marginBottom: 24 }}>
        <Paragraph>
          浏览器通过 <Text code>EventSource</Text> API 连接 SSE 端点， 服务端按{' '}
          <Text code>data: ...\n\n</Text> 格式逐条推送，浏览器自动处理断线重连。
        </Paragraph>
        <CodeBlock
          code={SSEDemoExamples.sseSpec}
          title="SSE 原始数据格式"
          type="info"
          language="text"
        />
      </Card>

      {/* 三、解决方案：JSON → Markdown 转换层 */}
      <Card title="三、解决方案：JSON → Markdown 转换层" style={{ marginBottom: 24 }}>
        <Paragraph>
          核心思路是<Text strong>在 JSON 和 react-markdown 之间加一个转换层</Text>。 利用{' '}
          <Text code>remark-directive</Text> 插件的 <Text code>:::xxx</Text> 自定义指令语法， 将每条
          JSON 消息翻译为对应的 Markdown 指令块。
        </Paragraph>
        <CodeBlock
          code={SSEDemoExamples.buildMarkdown}
          title="转换层核心代码"
          type="success"
          language="typescript"
        />
        <Divider />
        <CodeBlock
          code={SSEDemoExamples.reactMarkdownRender}
          title="react-markdown 拦截 :::asset 指令"
          type="success"
          language="tsx"
        />
      </Card>

      {/* 四、互动演示 */}
      <Card
        title={
          <span>
            四、互动演示 <Tag color="blue">Live Demo（逐字符流式聚合）</Tag>
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <Alert
          type="info"
          showIcon
          message="点击连接按钮，观察左侧逐字符片段如何实时聚合为右侧的完整卡片"
          style={{ marginBottom: 16 }}
        />
        <SSELiveDemo />
      </Card>

      {/* 五、整体架构 */}
      <Card title="五、整体架构" style={{ marginBottom: 24 }}>
        <pre
          style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 6,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {SSEDemoExamples.architecture}
        </pre>
      </Card>

      {/* 六、核心原理 */}
      <Card title="六、核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>SSE 单向推送：</Text>与 WebSocket 不同，SSE 是纯服务端→客户端单向流，基于
            HTTP 协议，天然支持断线重连，比轮询省资源。
          </li>
          <li>
            <Text strong>JSON → Markdown 转换：</Text>
            不直接操作 DOM，而是把 JSON 翻译成 Markdown 字符串。这一步完全纯函数，可测试、可预测。
          </li>
          <li>
            <Text strong>remark-directive 拦截：</Text>
            通过 <Text code>:::asset</Text> 这种自定义指令，将 Markdown 中的结构化块映射到 React
            组件，实现"数据→UI"的声明式渲染。
          </li>
          <li>
            <Text strong>流式聚合不闪烁：</Text>
            每个 table 的片段到达时，只更新对应卡片的内容，其他卡片不会重渲染。通过 React.memo
            自定义比较函数实现精确控制。
          </li>
          <li>
            <Text strong>O(n) 增量更新：</Text>
            每张卡片独立 ReactMarkdown，只解析自己的内容。新片段不会触发全量 Markdown
            重解析，复杂度从 O(n²) 降到 O(n)。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default SSEDemoPage;
