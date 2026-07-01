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
  cause: 'webpack 打包时，代码里的动态加载路径（如 import("./mode-sql")）会基于 output.publicPath 生成 URL。如果 publicPath 是 "/"（默认），产物会假设自己部署在域名根路径。当子应用部署在 "/subapp/" 下，或者在 qiankun 里通过 "//localhost:8082" 加载时，浏览器解析相对路径的 base 发生了变化。',
  solution: '按环境配置 publicPath，或在运行时通过 __webpack_public_path__ 动态设置。',
  principle: [
    'webpack 的 __webpack_require__.p 就是 publicPath；',
    '所有 import()、动态加载的 chunk、图片、字体等 URL 都会拼上这个前缀；',
    '如果子应用被 qiankun 以 HTML Entry 方式加载，子应用内部的 location 仍然是主应用的 URL，因此静态 publicPath 容易错。',
  ],
  notes: [
    'publicPath 可以是字符串、auto 或函数；',
    'auto 会根据 import.meta.url 自动推断，但在某些旧浏览器或特殊部署下可能不准确；',
    '运行时 __webpack_public_path__ 会覆盖构建时的 output.publicPath。',
  ],
};

export const deploymentPathData = {
  title: '二、部署路径与 nginx 转发',
  phenomenon: [
    '子应用独立部署正常，通过 nginx 转发到 /sql/ 后部分资源 404；',
    '刷新页面或直接访问 /sql/list 时，HTML 能加载，但 CSS/JS 404；',
    '改了 publicPath 后有些资源能加载，但有些还是从 "/" 请求。',
  ],
  cause: 'nginx 转发改变了浏览器看到的 URL，但子应用代码里仍然按原始路径构建。如果 publicPath 是 "/" 或 auto，在 "/sql/" 路径下请求 /js/xxx 会被发到主应用根路径，而不是子应用。',
  solution: 'nginx 配置 location /sql/ 转发到子应用；子应用 publicPath 设置为 /sql/ 或 ./ 或 auto；运行时通过 __webpack_public_path__ 动态设置。',
  principle: [
    'nginx 转发只是反向代理，浏览器请求的 URL 仍然是 /sql/js/xxx；',
    '子应用必须知道自己的"外部可见路径"，才能正确拼接资源 URL；',
    '__webpack_public_path__ 是 webpack runtime 的全局变量，可以覆盖构建时的 output.publicPath。',
  ],
  notes: [
    'location /sql/ 末尾的斜杠会影响 proxy_pass 的路径拼接；',
    '如果子应用使用 history 路由，nginx 需要配置 try_files 回退到 index.html；',
    'qiankun 环境可以通过 window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ 获取注入路径。',
  ],
};

export const htmlEntryData = {
  title: '三、qiankun HTML Entry 如何改变资源 base',
  phenomenon: [
    '子应用独立访问正常，嵌入主应用后 CSS 背景图、字体图标、动态加载的 chunk 404；',
    '子应用 HTML 里的 <script src="./js/app.js"> 变成了主应用域下的请求。',
  ],
  cause: 'qiankun 默认 HTML Entry：请求子应用入口 HTML，解析其中的 <script src>、<link href>，然后插入主应用的沙箱容器。这些资源标签的相对路径会被浏览器以主应用域名为 base 解析，而不是子应用域名。子应用内部用 new URL("./worker.js", import.meta.url) 或 document.currentScript 之类的方式推断路径时，会拿到错误 base。',
  solution: '使用绝对路径或 "//" 协议相对 URL；运行时动态设置 __webpack_public_path__；对 CSS 中的相对路径进行处理或使用 CDN。',
  principle: [
    '浏览器解析相对路径的 base 是 document.baseURI，qiankun 把子应用 HTML 插入主应用后，base 仍然是主应用的；',
    '子应用原来写在 HTML 里的 <script src="./js/app.js"> 会被解析成主应用域下的 /js/app.js，而不是子应用域下的 /js/app.js；',
    '这也是 webpack 推荐生产环境使用绝对路径或 CDN 的原因之一。',
  ],
  notes: [
    'qiankun 不会自动重写子应用资源 URL；',
    'HTML Entry 中 <base href> 标签可以影响相对路径解析，但也会带来副作用；',
    'CSS 中的相对路径不受 webpack publicPath 控制。',
  ],
};

export const monacoWorkerData = {
  title: '四、Monaco worker 为什么走不通 publicPath',
  phenomenon: [
    '改了 __webpack_public_path__ 后，主包资源正常，但 Monaco 语法高亮、命令补全仍失效；',
    '控制台看到 worker 文件 404；',
    '有时 worker 能加载，但加载的是主应用根路径下的错误文件。',
  ],
  cause: 'Monaco 的语法分析是在 Web Worker 中进行的，worker 文件通过 new Worker(url) 加载。worker 的 importScripts() 运行在 worker 自己的全局上下文，和主线程的 __webpack_public_path__ 不是同一个作用域。webpack 打包 Monaco 时，worker 的 URL 通常来自 MonacoEnvironment.getWorkerUrl 或 getWorker，如果未配置，会默认从当前页面 base 路径加载。',
  solution: '配置 window.MonacoEnvironment.getWorkerUrl，返回 worker 文件的绝对路径或正确处理过的相对路径。',
  principle: [
    'Web Worker 的创建 URL 由 new Worker(url) 时的字符串决定，这个 URL 是浏览器层面的请求，不是 webpack 模块系统；',
    'worker 内部再通过 importScripts() 加载其他脚本，这些路径也是相对于 worker 文件所在 URL 解析；',
    '因此 __webpack_public_path__ 只能影响主线程的 webpack chunk 加载，不能影响原生 Worker 的 URL 解析。',
  ],
  notes: [
    'Monaco 的 worker 路径必须指向真实可访问的 .js 文件；',
    'worker 文件最好和主应用同源，避免 COEP/ CORP 等跨域安全策略限制；',
    '可以使用 monaco-editor-webpack-plugin 或 @monaco-editor/loader 简化配置。',
  ],
};

export const editorBaseUrlData = {
  title: '五、CodeMirror 的 baseUrl 与 Monaco 的 getWorkerUrl',
  phenomenon: [
    'CodeMirror 的 mode、theme、addon 动态加载失败，嵌入子应用后也 404；',
    '命令补全、语法高亮消失；',
    '控制台显示 mode/sql.js 404。',
  ],
  cause: 'CodeMirror 的 modeURL 默认是 "%N.js"，加载时会按当前页面路径拼接。在子应用路径下，它错误地去主应用根路径下找 mode/sql.js。这与 Monaco 的问题本质相同：都是"运行时按需加载资源"的库，绕过了 webpack 的 publicPath。',
  solution: '配置 CodeMirror.modeURL 和 CodeMirror.themeURL，指向子应用或 CDN 上的正确资源路径。',
  principle: [
    'CodeMirror 和 Monaco 都是"运行时按需加载资源"的库，不是 webpack 打包后全部内联；',
    '它们的加载逻辑绕过了 webpack 的 publicPath，需要开发者自己维护 base URL；',
    '这也是为什么只改 publicPath 或 __webpack_public_path__ 不足以解决编辑器资源问题。',
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
  cause: 'CSS 中的 background: url("./border.png") 或 @font-face { src: url("./iconfont.woff") } 是相对路径。这些路径在独立运行时基于子应用路径正确，但在 qiankun 中基于主应用路径解析，导致 404。有时 CDN 或浏览器缓存会让问题偶尔出现，偶尔正常，导致排查困难。',
  solution: '使用绝对路径或 CDN 路径；对 CSS 中的相对资源路径做后处理；使用 CSS 变量或 base64 内联小图标。',
  principle: [
    'CSS 资源路径解析由浏览器负责，base 是 CSS 文件所在 URL；',
    '如果 CSS 被 qiankun 从 HTML 中提取后插入主应用，base 可能变为主应用域；',
    '字体、图片、SVG 等"非 JS 资源"最容易被忽略，也最难排查。',
  ],
  notes: [
    'CSS 中的 url() 解析基于 CSS 文件的 URL，而不是当前 HTML 页面；',
    'postcss 的 public-path 插件可以在构建时统一处理 CSS 资源路径；',
    '字体文件建议使用 font-display: swap，避免阻塞渲染。',
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
