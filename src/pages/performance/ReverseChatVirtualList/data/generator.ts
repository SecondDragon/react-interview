import type { ChatMessage } from '../types/chat';

/**
 * 预置的聊天数据，按页码存储，每页包含一问一答的完整对话（20条消息）
 * 页码从 1 开始，1 表示最新数据，数字越大表示越旧的数据
 */

const PAGE_SIZE = 20;
const TOTAL_PRESET_PAGES = 50; // 预置 50 页，共 1000 条消息

const USER_QUESTIONS = [
  '什么是虚拟列表？',
  'React 的 Diff 算法是怎么工作的？',
  '如何优化前端性能？',
  'TypeScript 和 JavaScript 有什么区别？',
  '什么是闭包？',
  'CSS 的 BFC 是什么？',
  '如何实现一个 Promise？',
  'Webpack 和 Vite 有什么区别？',
  '什么是事件循环？',
  '如何优化 React 组件渲染？',
  '什么是函数式编程？',
  'HTTP 和 HTTPS 有什么区别？',
  '什么是跨域？如何解决？',
  '如何设计一个组件库？',
  '什么是 SSR？',
  '什么是微前端？',
  '如何优化首屏加载速度？',
  '什么是 WebSocket？',
  '如何实现文件上传？',
  '什么是 Service Worker？',
  '如何优化图片加载？',
  '什么是 CSS 变量？',
  '如何实现拖拽排序？',
  '什么是防抖和节流？',
  '如何优化大数据表格？',
  '什么是 GraphQL？',
  '如何实现权限管理？',
  '什么是 Docker？',
  '如何优化 SEO？',
  '什么是 PWA？',
];

const AI_ANSWERS = [
  '虚拟列表是一种性能优化技术，只渲染视口内的元素，而不是渲染全部数据。',
  'React 的 Diff 算法通过比较新旧虚拟 DOM 树，找出最小变更集，然后批量更新真实 DOM。',
  '前端性能优化可以从减少 HTTP 请求、压缩资源、使用缓存、懒加载等方面入手。',
  'TypeScript 是 JavaScript 的超集，添加了静态类型检查，可以在编译时发现错误。',
  '闭包是指函数可以访问其外部作用域的变量，即使外部函数已经执行完毕。',
  'BFC（Block Formatting Context）是 CSS 中的一种布局方式，可以隔离内部元素与外部元素。',
  'Promise 是一种异步编程解决方案，通过 then/catch 链式调用处理异步结果。',
  'Webpack 是打包工具，Vite 是构建工具，Vite 使用原生 ESM 提供更快的开发体验。',
  '事件循环是 JavaScript 处理异步任务的机制，包括宏任务和微任务队列。',
  '可以通过 React.memo、useMemo、useCallback 等 API 优化组件渲染。',
  '函数式编程是一种编程范式，强调纯函数、不可变数据和函数组合。',
  'HTTPS 是 HTTP 的安全版本，通过 SSL/TLS 加密传输数据。',
  '跨域是指浏览器的同源策略限制，可以通过 CORS、JSONP、代理等方式解决。',
  '设计组件库需要考虑 API 设计、主题系统、文档、测试等多个方面。',
  'SSR（Server-Side Rendering）是在服务端渲染页面，提高首屏加载速度和 SEO。',
  '微前端是一种架构模式，将大型应用拆分为多个独立部署的小型应用。',
  '可以通过代码分割、资源预加载、骨架屏等方式优化首屏加载速度。',
  'WebSocket 是一种全双工通信协议，可以实现客户端和服务端的实时通信。',
  '文件上传可以通过 input[type=file] 获取文件，然后使用 FormData 发送。',
  'Service Worker 是一种在浏览器后台运行的脚本，可以实现离线缓存和推送通知。',
  '可以通过图片压缩、WebP 格式、懒加载、响应式图片等方式优化图片加载。',
  'CSS 变量（Custom Properties）允许定义可复用的值，通过 var() 函数使用。',
  '拖拽排序可以通过 HTML5 Drag and Drop API 或第三方库（如 react-beautiful-dnd）实现。',
  '防抖是在事件触发后等待一段时间再执行，节流是限制单位时间内的执行次数。',
  '大数据表格可以通过虚拟滚动、分页、列宽优化等方式优化性能。',
  'GraphQL 是一种查询语言，允许客户端精确获取所需数据，减少过度获取。',
  '权限管理可以通过 RBAC（基于角色的访问控制）或 ABAC（基于属性的访问控制）实现。',
  'Docker 是一种容器化技术，可以将应用及其依赖打包为可移植的容器。',
  'SEO 优化包括合理的 HTML 结构、meta 标签、语义化标签、站点地图等。',
  'PWA（Progressive Web App）是一种使用现代 Web 技术提供原生应用体验的 Web 应用。',
];

const CODE_SNIPPETS = [
  '```typescript\ninterface User {\n  id: number;\n  name: string;\n}\n\nconst user: User = { id: 1, name: "Alice" };\n```',
  '```javascript\nconst sum = (a, b) => a + b;\nconsole.log(sum(1, 2)); // 3\n```',
  '```css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n```',
  '```tsx\nfunction Button({ onClick, children }: ButtonProps) {\n  return <button onClick={onClick}>{children}</button>;\n}\n```',
  '```python\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))\n```',
  '```bash\nnpm install react react-dom\nnpm install -D @types/react @types/react-dom\n```',
  '```sql\nSELECT * FROM users WHERE age > 18 ORDER BY created_at DESC;\n```',
  '```json\n{\n  "name": "project",\n  "version": "1.0.0",\n  "dependencies": {}\n}\n```',
  '```html\n<div class="container">\n  <h1>Hello World</h1>\n</div>\n```',
  '```yaml\nversion: \'3\'\nservices:\n  web:\n    image: nginx:latest\n```',
];

/**
 * 生成一页数据（20条消息，一问一答为一组）
 */
function generatePage(pageNumber: number): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const baseTime = new Date('2026-06-01T00:00:00Z').getTime();
  
  // 页码越大，时间越早（反向时间线）
  // 第1页是最新的，第50页是最旧的
  const timeOffset = (TOTAL_PRESET_PAGES - pageNumber) * 20 * 60000;

  for (let i = 0; i < PAGE_SIZE; i++) {
    const questionIndex = (pageNumber * PAGE_SIZE + i) % USER_QUESTIONS.length;
    const answerIndex = (pageNumber * PAGE_SIZE + i) % AI_ANSWERS.length;
    const codeIndex = (pageNumber * PAGE_SIZE + i) % CODE_SNIPPETS.length;
    
    const messageTime = baseTime + timeOffset + i * 60000;

    // 用户提问
    messages.push({
      id: `msg-p${pageNumber}-${i}-user`,
      content: USER_QUESTIONS[questionIndex],
      sender: 'user',
      timestamp: new Date(messageTime).toISOString(),
      status: 'read',
    });

    // AI 回答（部分包含代码）
    const hasCode = i % 3 === 0; // 每3条消息包含一个代码片段
    const answerContent = hasCode
      ? `${AI_ANSWERS[answerIndex]}\n\n${CODE_SNIPPETS[codeIndex]}`
      : AI_ANSWERS[answerIndex];

    messages.push({
      id: `msg-p${pageNumber}-${i}-ai`,
      content: answerContent,
      sender: 'ai',
      timestamp: new Date(messageTime + 30000).toISOString(),
      status: 'read',
    });
  }

  return messages;
}

/**
 * 生成所有预置数据
 */
export function generateAllPages(): Record<string, ChatMessage[]> {
  const pages: Record<string, ChatMessage[]> = {};
  
  for (let page = 1; page <= TOTAL_PRESET_PAGES; page++) {
    pages[page.toString()] = generatePage(page);
  }
  
  return pages;
}

/**
 * 当请求超出预置页码时，动态生成新页
 */
export function generateDynamicPage(pageNumber: number): ChatMessage[] {
  return generatePage(pageNumber);
}

/**
 * 获取总页数
 */
export function getTotalPages(): number {
  return TOTAL_PRESET_PAGES;
}

/**
 * 获取每页大小
 */
export function getPageSize(): number {
  return PAGE_SIZE;
}
