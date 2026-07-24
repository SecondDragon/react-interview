export const directives = [
  { key: 'max-age', desc: '资源在多少秒内有效，单位秒', example: 'Cache-Control: max-age=3600' },
  { key: 'no-cache', desc: '使用前必须向服务器验证，不是不缓存', example: 'Cache-Control: no-cache' },
  { key: 'no-store', desc: '完全不缓存，每次都重新请求', example: 'Cache-Control: no-store' },
  { key: 'public', desc: '可被任意中间缓存（CDN 等）缓存', example: 'Cache-Control: public, max-age=86400' },
  { key: 'private', desc: '仅浏览器可缓存，中间 CDN 不应缓存', example: 'Cache-Control: private' },
  { key: 'must-revalidate', desc: '过期后必须重新验证，不允许使用过期缓存', example: 'Cache-Control: must-revalidate' },
  { key: 'immutable', desc: '在 max-age 内资源不会变，浏览器无需再验证', example: 'Cache-Control: immutable' },
];

export const directivesColumns = [
  { title: '指令', dataIndex: 'key', key: 'key' },
  { title: '含义', dataIndex: 'desc', key: 'desc' },
  { title: '示例', dataIndex: 'example', key: 'example' },
];

export const comparisonData = [
  { key: '1', item: '决策位置', strong: '浏览器本地', negotiate: '浏览器 + 服务器协商' },
  { key: '2', item: '状态码', strong: '200 (from memory/disk cache)', negotiate: '304 Not Modified 或 200' },
  { key: '3', item: '是否发请求', strong: '不发请求', negotiate: '发请求，但可能只返回响应头' },
  { key: '4', item: '核心头部', strong: 'Expires / Cache-Control', negotiate: 'Last-Modified / ETag' },
  { key: '5', item: '适用场景', strong: '不常变化的静态资源', negotiate: '可能变化但需要节省带宽的资源' },
];

export const comparisonColumns = [
  { title: '对比项', dataIndex: 'item', key: 'item' },
  { title: '强缓存', dataIndex: 'strong', key: 'strong' },
  { title: '协商缓存', dataIndex: 'negotiate', key: 'negotiate' },
];

export interface InterviewQuestion {
  key: string;
  question: string;
  answer: string;
}

export const interviewQuestions: InterviewQuestion[] = [
  {
    key: '1',
    question: '强缓存和协商缓存的区别是什么？',
    answer: '强缓存由浏览器根据 Expires/Cache-Control 直接决定是否使用本地缓存，状态码通常是 200 (from cache)，不发网络请求。协商缓存是强缓存失效后，浏览器携带 If-Modified-Since / If-None-Match 向服务器验证，服务器返回 304 表示未变化，只返回响应头，不返回响应体。',
  },
  {
    key: '2',
    question: '为什么有了 Last-Modified 还需要 ETag？',
    answer: 'Last-Modified 是秒级时间戳，存在两个缺陷：1) 文件在 1 秒内多次修改无法感知；2) 文件内容未变但修改时间变化时会导致不必要的 200 响应。ETag 是内容指纹（通常基于内容哈希），只要内容不变 ETag 就不变，精度更高。',
  },
  {
    key: '3',
    question: 'F5 和 Ctrl+F5 对缓存的影响分别是什么？',
    answer: '普通地址栏回车/跳转会按正常缓存策略处理。F5 / 点击刷新按钮会让强缓存失效，但协商缓存仍会携带验证字段尝试 304。Ctrl+F5 / Cmd+Shift+R 会强制禁用缓存，不携带验证字段，直接向服务器重新请求完整资源。',
  },
];
