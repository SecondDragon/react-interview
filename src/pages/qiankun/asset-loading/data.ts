export const pageData = {
  title: 'qiankun 专题：子应用资源的加载',
  subtitle: '从 webpack publicPath 到 Monaco Worker 的资源加载陷阱',
};

export const webpackOutputData = {
  title: '一、webpack 产物与 publicPath',
  phenomenon: [
    '本地开发时代码高亮、命令补全正常，部署到子应用路径后这些功能消失；',
    '控制台报 404，资源路径是 /js/xxx 而不是 /subapp/js/xxx；',
    '改了 publicPath 后，主资源包能加载，但 worker、grammar 文件还是 404；',
    '不同环境（开发、测试、生产）需要反复改 publicPath。',
  ],
  cause: [
    'webpack 打包时，代码里的动态加载路径（如 import("./mode-sql")）会被编译成基于 <strong>__webpack_require__.p</strong> 的 URL。',
    '<strong>__webpack_require__.p</strong> 就是 <code>output.publicPath</code>（或运行时 <code>__webpack_public_path__</code>）的值。',
    '如果它是空字符串或 "/"，产物会假设自己部署在当前页面路径或域名根路径。',
    '当子应用部署在 "/subapp/" 下，或者在 qiankun 里通过 <strong>HTML Entry</strong> 加载时，浏览器当前页面地址仍是主应用，导致动态 chunk 被拼到主应用路径上。',
  ],
  solution: [
    '按环境配置 <code>output.publicPath</code>，或在运行时通过 <code>__webpack_public_path__</code> 动态设置。',
    '设置后 webpack 的 <strong>__webpack_require__.p</strong> 会指向子应用真实路径，所有动态 import 和按需 chunk 都会自动带上正确前缀。',
  ],
  principle: [
    'webpack 的 <strong>__webpack_require__.p</strong> 就是 <strong>publicPath</strong>；',
    '所有 <code>import()</code>、动态加载的 <code>chunk</code>、图片、字体等 URL 都会拼上 <strong>__webpack_require__.p</strong>；',
    '运行时 <code>__webpack_public_path__ = "https://sql.example.com/sql/"</code> 等价于把 <strong>__webpack_require__.p</strong> 改成这个值；',
    '如果子应用被 qiankun 以 <strong>HTML Entry</strong> 方式加载，子应用内部的 <code>location</code> 仍然是主应用的 URL，因此静态 publicPath 容易错，需要运行时动态修正。',
  ],
  example: [
    '未设置 <code>__webpack_public_path__</code>：import("./mode-sql") → 请求 https://main.example.com/dashboard/qiankun/sql/js/chunk-mode-sql.js（404）。',
    '设置 <code>__webpack_public_path__ = "https://sql.example.com/sql/"</code> 后：import("./mode-sql") → 请求 https://sql.example.com/sql/js/chunk-mode-sql.js（命中）。',
  ],
  notes: [
    '<code>publicPath</code> 可以是字符串、auto 或函数；',
    '<code>auto</code> 会根据 <code>import.meta.url</code> 自动推断，但在某些旧浏览器或特殊部署下可能不准确；',
    '运行时 <code>__webpack_public_path__</code> 会覆盖构建时的 <code>output.publicPath</code>。',
  ],
};

export const deploymentPathData = {
  title: '二、部署路径与 nginx 转发',
  phenomenon: [
    '子应用独立部署正常，通过 nginx 转发到 /sql/ 后部分资源 404；',
    '刷新页面或直接访问 /sql/list 时，HTML 能加载，但 CSS/JS 404；',
    '改了 publicPath 后有些资源能加载，但有些还是从 "/" 请求。',
  ],
  cause: [
    '<strong>nginx</strong> 转发改变了浏览器看到的 URL，但子应用代码里仍然按原始路径构建。',
    '如果 <code>publicPath</code> 是 "/" 或 <code>auto</code>，在 "/sql/" 路径下请求 <code>/js/xxx</code> 会被发到主应用根路径，而不是子应用。',
    '当浏览器地址栏是 <code>main.example.com/sql/</code> 时，<strong>document.baseURI</strong> 就是 <code>main.example.com/sql/</code>。',
    'Monaco 默认使用 <code>new Worker("./editor.worker.js")</code>，浏览器会相对于 <code>/sql/</code> 解析，得到 <code>/sql/editor.worker.js</code>。',
    '只要 nginx 把 <code>/sql/*</code> 正确转发到子应用真实资源路径，这个请求就会命中。',
    '这和 qiankun 直接加载独立域名子应用完全不同：后者浏览器地址是主应用路径，而 worker 文件在子应用域名下，所以必须靠 <strong>getWorkerUrl</strong> 强制指定绝对路径。',
  ],
  solution: [
    '<strong>nginx</strong> 配置 <code>location /sql/</code> 转发到子应用；',
    '子应用 <code>publicPath</code> 设置为 <code>/sql/</code>、<code>./</code> 或 <code>auto</code>；',
    '运行时通过 <code>__webpack_public_path__</code> 动态设置。',
  ],
  principle: [
    '<strong>nginx</strong> 转发只是反向代理，浏览器请求的 URL 仍然是 <code>/sql/js/xxx</code>；',
    '子应用必须知道自己的"外部可见路径"，才能正确拼接资源 URL；',
    '<strong>__webpack_public_path__</strong> 是 webpack <strong>runtime</strong> 的全局变量，可以覆盖构建时的 <code>output.publicPath</code>。',
  ],
  notes: [
    '<code>location /sql/</code> 末尾的斜杠会影响 <code>proxy_pass</code> 的路径拼接；',
    '如果子应用使用 history 路由，nginx 需要配置 <code>try_files</code> 回退到 <code>index.html</code>；',
    'qiankun 环境可以通过 <code>window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__</code> 获取注入路径。',
    'nginx 转发后，浏览器请求的 <code>/sql/xxx</code> 会被转发到子应用真实路径，因此 Monaco 默认的 worker 路径（如 <code>/sql/editor.worker.js</code>）也会命中，无需额外配置 <strong>getWorkerUrl</strong>。',
  ],
  universalSummary: [
    'nginx 相对路径转发是<strong>最简单、最接近“万能”</strong>的方案——前提是子应用可以被暴露到主应用域名的某个路径前缀下。',
    '在“同域路径前缀”前提下，浏览器地址栏和子应用的资源路径天然对齐，<strong>document.baseURI</strong> 就是 <code>/sql/</code>，Monaco、CodeMirror、CSS 字体/图片等依赖浏览器原生相对路径解析的资源默认行为就是正确的。',
    '如果因为品牌或独立域名要求不能走这个方案，才需要回退到 <strong>getWorkerUrl</strong> / <strong>modeURL</strong> / 绝对路径 / <strong>CORS</strong> 配置等方案。',
  ],
  universalTable: [
    { key: '1', scenario: '子应用可以挂到 /sql/ 这类同域路径前缀下', suitable: '适合', reason: '浏览器地址、资源路径、nginx 转发三者一致，默认即可工作' },
    { key: '2', scenario: '品牌或安全要求必须使用独立域名（如 sql.example.com）', suitable: '不适合', reason: '浏览器地址与资源域分离，需要回退到 getWorkerUrl / 绝对路径方案' },
    { key: '3', scenario: '主应用路径前缀冲突（如主应用已有 /sql/ 路由）', suitable: '需要协调', reason: '需更换前缀或调整主应用路由，避免 nginx 与主应用路由冲突' },
    { key: '4', scenario: '严格的 CORS/COEP/CORP 要求', suitable: '可行但增加复杂度', reason: '需要额外配置跨域响应头、资源隔离策略，nginx 只是入口层' },
    { key: '5', scenario: '子应用需要独立部署、独立灰度/回滚', suitable: '适合', reason: 'nginx 只是入口层，后端子应用仍可独立部署、独立维护' },
  ],
  universalConclusion: 'nginx 相对路径转发不是绝对万能，但在“同域路径前缀”这个前提下，它是最省心、代码侵入最小的方案。如果因为品牌或独立域名要求不能走这个方案，才需要回退到 getWorkerUrl / modeURL / 绝对路径 / CORS 配置等方案。',
};

export const htmlEntryData = {
  title: '三、qiankun HTML Entry 如何改变资源 base',
  phenomenon: [
    '子应用独立访问（如 https://sql.example.com/sql/）完全正常，嵌入主应用后 CSS 背景图、字体图标、动态加载的 chunk 404；',
    '子应用 HTML 里的 <code>&lt;script src="./js/app.js"&gt;</code> 被解析成了主应用域下的 <code>/js/app.js</code>；',
    '在独立域名下能加载的 JS 资源，嵌入后却从主应用的 /dashboard/qiankun/... 路径请求。',
  ],
  cause: [
    'qiankun 默认使用 <strong>HTML Entry</strong>：它会 fetch 子应用入口 HTML，解析出 <code>&lt;script src&gt;</code>、<code>&lt;link href&gt;</code>、<code>&lt;style&gt;</code>、<code>&lt;img src&gt;</code> 等，然后插入主应用的 <strong>container</strong>。',
    '浏览器解析相对路径的 base 始终是 <strong>document.baseURI</strong>，也就是当前页面地址。',
    'qiankun 嵌入后，当前页面地址仍是主应用，因此子应用 HTML 中的相对路径会基于主应用路径解析。',
    '子应用 JS 内部用 <code>new URL("./worker.js", import.meta.url)</code> 或 <code>document.currentScript</code> 推断路径时，也会拿到主应用域作为错误 base。',
  ],
  solution: [
    '使用绝对路径或 <code>//</code> 协议相对 URL；',
    '运行时动态设置 <code>__webpack_public_path__</code>；',
    '对 CSS 中的相对路径进行处理或使用 CDN。',
  ],
  principle: [
    '浏览器解析相对路径的 base 是 <strong>document.baseURI</strong>，而不是资源来源的 HTML；qiankun 把子应用 HTML 插入主应用后，base 仍然是主应用的；',
    '子应用原来写在 HTML 里的 <code>&lt;script src="./js/app.js"&gt;</code> 会被解析成主应用域下的 <code>/js/app.js</code>，而不是子应用域下的 <code>/sql/js/app.js</code>；',
    '<strong>__webpack_public_path__</strong> 修改的是 webpack 的 <strong>__webpack_require__.p</strong>，只在 webpack 模块系统内部生效；它不会自动修复 HTML 标签、CSS <code>url()</code>、原生 <code>new Worker()</code> 的 URL；',
    '协议相对 URL <code>//</code> 省略协议但保留域名，不会被主应用 base 带偏，适合跨 HTTP/HTTPS 的固定域名资源；',
    '这也是 webpack 官方推荐生产环境使用绝对路径或 CDN 的原因之一：它消除了「当前页面路径」对资源解析的依赖。',
  ],
  notes: [
    'qiankun 不会自动重写子应用资源 URL；',
    '<strong>HTML Entry</strong> 中 <code>&lt;base href&gt;</code> 标签可以影响相对路径解析，但也会带来副作用；',
    'CSS 中的相对路径不受 webpack <code>publicPath</code> 控制；',
    '协议相对 URL 在 <code>file://</code> 协议或某些严格安全策略下会失效，生产环境优先使用 HTTPS 绝对路径。',
  ],
  urlFormTable: [
    {
      key: '1',
      form: '相对路径',
      example: './js/app.js',
      standalone: 'https://sql.example.com/sql/js/app.js',
      qiankun: 'https://main.example.com/js/app.js（404）',
      scenario: '单页面独立部署，且与资源同域同路径',
    },
    {
      key: '2',
      form: '根路径',
      example: '/js/app.js',
      standalone: 'https://sql.example.com/js/app.js',
      qiankun: 'https://main.example.com/js/app.js（404）',
      scenario: '资源部署在域名根路径，且只有一个应用',
    },
    {
      key: '3',
      form: '协议相对 URL',
      example: '//sql.example.com/sql/js/app.js',
      standalone: 'https://sql.example.com/sql/js/app.js',
      qiankun: 'https://sql.example.com/sql/js/app.js（命中）',
      scenario: '需要同时兼容 HTTP/HTTPS，且资源域名固定',
    },
    {
      key: '4',
      form: '绝对路径',
      example: 'https://sql.example.com/sql/js/app.js',
      standalone: 'https://sql.example.com/sql/js/app.js',
      qiankun: 'https://sql.example.com/sql/js/app.js（命中）',
      scenario: '资源域名和协议都固定，qiankun 嵌入场景最稳',
    },
    {
      key: '5',
      form: '运行时注入',
      example: '__webpack_public_path__ + "js/app.js"',
      standalone: 'https://sql.example.com/sql/js/app.js',
      qiankun: 'https://sql.example.com/sql/js/app.js（命中）',
      scenario: '同一套构建产物需要同时适配独立运行和 qiankun 嵌入',
    },
  ],
};

export const monacoWorkerData = {
  title: '四、Monaco worker 为什么走不通 publicPath',
  phenomenon: [
    '改了 <code>__webpack_public_path__</code> 后，主包资源正常，但 Monaco 语法高亮、命令补全仍失效；',
    '控制台看到 worker 文件 404；',
    '有时 worker 能加载，但加载的是主应用根路径下的错误文件。',
  ],
  cause: [
    'Monaco 的语法分析是在 <strong>Web Worker</strong> 中进行的。',
    'worker 文件通过 <code>new Worker(url)</code> 加载，这个 URL 的解析与主线程 webpack 的 <strong>__webpack_public_path__</strong> 完全无关：浏览器收到的是普通字符串 URL，会按 <strong>document.baseURI</strong> 解析。',
    'worker 被创建后，其内部执行 <code>importScripts()</code> 时运行在 worker 自己的全局上下文，也看不到主线程的 <code>__webpack_public_path__</code>。',
    '因此，即使主线程已经正确设置 publicPath，worker 及其依赖脚本仍可能从错误路径请求。',
  ],
  solution: [
    '配置 <code>window.MonacoEnvironment.getWorkerUrl</code>，返回 worker 文件的绝对路径或正确处理过的相对路径；',
    '在 Worker 内部加载依赖时也使用绝对路径或基于 Worker 文件自身 URL 计算的路径。',
  ],
  principle: [
    'HTML/主线程中的动态 import（如 <code>import("./mode-sql")</code>）会被 webpack 改写为 <strong>__webpack_require__.p</strong> + chunkId，因此 <strong>__webpack_public_path__</strong> 能控制这些 URL；',
    '<strong>Web Worker</strong> 的创建 URL 由 <code>new Worker(url)</code> 时的字符串决定，这是浏览器原生 API，不走 webpack 的模块系统；',
    'Worker 创建后运行在一个独立全局上下文，<code>self.importScripts()</code> 加载其他脚本时基于 worker 文件所在 URL 解析，主线程的 <strong>__webpack_public_path__</strong> 不会传递给它；',
    '因此 <strong>__webpack_public_path__</strong> 只能影响主线程的 webpack <strong>chunk</strong> 加载，不能影响原生 Worker 的 URL 解析。',
  ],
  comparison: [
    '主线程：<code>import("./mode-sql")</code> → webpack 编译成 <strong>__webpack_require__.e("mode-sql")</strong> → 最终请求 <strong>__webpack_require__.p</strong> + "js/mode-sql.chunk.js"；<strong>__webpack_public_path__</strong> 设置的就是 <strong>__webpack_require__.p</strong>。',
    'Worker：<code>new Worker("./editor.worker.js")</code> → 浏览器直接解析为当前页面 base + "./editor.worker.js"；<strong>__webpack_public_path__</strong> 不参与。',
    'Worker 内部：<code>self.importScripts("./sql.js")</code> → 浏览器基于 Worker 文件 URL 解析；同样与 <strong>__webpack_public_path__</strong> 无关。',
  ],
  notes: [
    'Monaco 的 worker 路径必须指向真实可访问的 <code>.js</code> 文件；',
    'worker 文件最好和主应用同源，避免 <strong>COEP/CORP</strong> 等跨域安全策略限制；',
    '可以使用 <code>monaco-editor-webpack-plugin</code> 或 <code>@monaco-editor/loader</code> 简化配置，但本质仍是提供正确的 worker URL。',
  ],
};

export const editorBaseUrlData = {
  title: '五、CodeMirror 的 baseUrl 与 Monaco 的 getWorkerUrl',
  phenomenon: [
    'CodeMirror 的 mode、theme、addon 动态加载失败，嵌入子应用后也 404；',
    '命令补全、语法高亮消失；',
    '控制台显示 mode/sql.js 404。',
  ],
  cause: [
    'CodeMirror 的 <strong>modeURL</strong> 默认是 "%N.js"，加载时会按当前页面路径拼接。',
    '在子应用路径下，它错误地去主应用根路径下找 <code>mode/sql.js</code>。',
    '这与 Monaco 的问题本质相同：都是"运行时按需加载资源"的库，绕过了 webpack 的 <strong>publicPath</strong>。',
  ],
  solution: [
    '配置 <strong>CodeMirror.modeURL</strong> 和 <strong>CodeMirror.themeURL</strong>，指向子应用或 CDN 上的正确资源路径。',
  ],
  principle: [
    'CodeMirror 和 Monaco 都是"运行时按需加载资源"的库，不是 webpack 打包后全部内联；',
    '它们的加载逻辑绕过了 webpack 的 <strong>publicPath</strong>，需要开发者自己维护 base URL；',
    '这也是为什么只改 <code>publicPath</code> 或 <code>__webpack_public_path__</code> 不足以解决编辑器资源问题。',
  ],
  notes: [
    'CodeMirror 5 和 CodeMirror 6 的资源加载方式不同，配置方式也不同；',
    '可以把 CodeMirror 资源放到 CDN 并用绝对路径，减少子应用路径变化的影响；',
    'Mode 文件加载是异步的，需要在 mode 加载完成后再启用对应语法高亮。',
  ],
};

export const borderCssData = {
  title: '六、边框/图标/字体等资源丢失',
  phenomenon: [
    '改用 nginx 相对路径转发后，代码高亮和命令补全恢复了，但边框样式偶尔丢失；',
    '图标字体显示成方框；',
    '背景图片不显示。',
  ],
  cause: [
    'CSS 中的 <code>background: url("./border.png")</code> 或 <code>@font-face { src: url("./iconfont.woff") }</code> 是相对路径。',
    '这些路径在独立运行时基于子应用路径正确，但在 qiankun 中基于主应用路径解析，导致 404。',
    '有时 CDN 或浏览器缓存会让问题偶尔出现，偶尔正常，导致排查困难。',
  ],
  solution: [
    '使用绝对路径或 CDN 路径；',
    '对 CSS 中的相对资源路径做后处理；',
    '使用 CSS 变量或 base64 内联小图标。',
  ],
  principle: [
    'CSS 资源路径解析由浏览器负责，base 是 CSS 文件所在 URL；',
    '如果 CSS 被 qiankun 从 HTML 中提取后插入主应用，base 可能变为主应用域；',
    '字体、图片、SVG 等"非 JS 资源"最容易被忽略，也最难排查。',
  ],
  notes: [
    'CSS 中的 <code>url()</code> 解析基于 CSS 文件的 URL，而不是当前 HTML 页面；',
    'postcss 的 public-path 插件可以在构建时统一处理 CSS 资源路径；',
    '字体文件建议使用 <code>font-display: swap</code>，避免阻塞渲染。',
  ],
};

export const liveDemoData = {
  title: '资源路径对比器',
  description: '输入子应用部署路径和 Monaco worker 文件名，查看在独立运行、qiankun 嵌入、nginx 转发三种场景下资源 URL 的差异。',
  inputs: [
    { key: 'deployPath', label: '子应用部署路径', defaultValue: '/sql/' },
    { key: 'workerName', label: 'Monaco worker 文件名', defaultValue: 'editor.worker.js' },
  ],
  switches: [
    { key: 'qiankunEntry', label: '启用 qiankun HTML Entry' },
    { key: 'nginxForward', label: '启用 nginx 相对路径转发' },
    { key: 'publicPath', label: '运行时设置 __webpack_public_path__' },
    { key: 'getWorkerUrl', label: '配置 MonacoEnvironment.getWorkerUrl' },
  ],
  scenarios: [
    { key: 'standalone', label: '子应用独立运行' },
    { key: 'qiankun', label: 'qiankun 嵌入主应用' },
    { key: 'nginx', label: 'nginx 相对路径转发' },
  ],
  decisionTreeTitle: '资源加载问题排查决策树',
};
