/**
 * SSE 流式推送演示 - 案例元数据
 */
export const SSEDemoExamples = {
  title: "SSE 流式推送 + react-markdown 自定义渲染",

  problem: "后端通过 SSE 推送的是结构化 JSON（如 {table:'Apple', content:'...', type:'answer'}），前端需要将这些 JSON 流实时渲染为丰富的自定义卡片组件，同时保持流式输出的丝滑感。如果用原生 DOM 操作直接拼接，代码会非常难以维护。",

  sseSpec: `// SSE 协议格式：服务端 → 客户端单向流
// Content-Type: text/event-stream

data: {"table":"Apple","content":"苹果公司...","type":"answer"}

data: {"table":"Microsoft","content":"微软...","type":"answer"}

data: {"ids":[{"table":"Apple","id":"AAPL"}],"type":"final"}

// 每条消息以 "data:" 开头，以两个换行结束
// 浏览器通过 EventSource API 自动处理重连和解析`,

  buildMarkdown: `/**
 * 转换层：将 JSON 块拼装成 Markdown 字符串
 * 利用 remark-directive 的自定义指令语法 :::xxx
 */
function buildMarkdownFromChunks(chunks: StreamChunk[]): string {
  let md = ''
  for (const c of chunks) {
    if (c.type === 'answer') {
      // 动态拼装成 remark-directive 支持的语法
      md += \`\\n\\n:::asset{table="\${c.table}"}\\n\${c.content}\\n:::\\n\\n\`
    }
    // type: 'final' 由 React 状态单独管理，不放入 Markdown
  }
  return md
}`,

  reactMarkdownRender: `import ReactMarkdown from 'react-markdown'
import remarkDirective from 'remark-directive'

// 自定义组件映射
const customComponents = {
  asset: ({ table, children, finalIds }) => (
    <AssetCard table={table} finalIds={finalIds}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </AssetCard>
  ),
}

<ReactMarkdown
  remarkPlugins={[remarkDirective]}
  components={customComponents}
>
  {markdownText}
</ReactMarkdown>`,

  architecture: `┌─────────────────────────────────────────────────────────┐
│                    流式渲染架构                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  后端 SSE (/api/sse)                                    │
│  ├─ Content-Type: text/event-stream                    │
│  └─ 逐条推送 JSON: {table, content, type}              │
│       │                                                 │
│       ▼                                                 │
│  EventSource.onmessage                                  │
│  ├─ JSON.parse(event.data)                             │
│  └─ setChunks(prev => [...prev, chunk])                │
│       │                                                 │
│       ▼                                                 │
│  buildMarkdownFromChunks(chunks)                        │
│  ├─ answer → :::asset{table="X"} 内容 :::              │
│  └─ final → 提取 ids，单独管理                          │
│       │                                                 │
│       ▼                                                 │
│  ReactMarkdown + remarkDirective                        │
│  ├─ 解析 :::asset 指令                                 │
│  └─ 渲染 AssetCard 组件（支持内部 Markdown）            │
│                                                         │
└─────────────────────────────────────────────────────────┘`,
};
