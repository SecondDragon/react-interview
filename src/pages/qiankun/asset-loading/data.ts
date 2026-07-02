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

export const urlFormTable = [
  { key: '1', form: '相对路径', example: './js/app.js', standalone: 'https://sql.example.com/sql/js/app.js', qiankun: 'https://main.example.com/js/app.js（404）', scenario: '单页面独立部署，且与资源同域同路径' },
  { key: '2', form: '根路径', example: '/js/app.js', standalone: 'https://sql.example.com/js/app.js', qiankun: 'https://main.example.com/js/app.js（404）', scenario: '资源部署在域名根路径，且只有一个应用' },
  { key: '3', form: '协议相对 URL', example: '//sql.example.com/sql/js/app.js', standalone: 'https://sql.example.com/sql/js/app.js', qiankun: 'https://sql.example.com/sql/js/app.js（命中）', scenario: '需要同时兼容 HTTP/HTTPS，且资源域名固定' },
  { key: '4', form: '绝对路径', example: 'https://sql.example.com/sql/js/app.js', standalone: 'https://sql.example.com/sql/js/app.js', qiankun: 'https://sql.example.com/sql/js/app.js（命中）', scenario: '资源域名和协议都固定，qiankun 嵌入场景最稳' },
  { key: '5', form: '运行时注入', example: '__webpack_public_path__ + "js/app.js"', standalone: 'https://sql.example.com/sql/js/app.js', qiankun: 'https://sql.example.com/sql/js/app.js（命中）', scenario: '同一套构建产物需要同时适配独立运行和 qiankun 嵌入' },
];

export const universalTable = [
  { key: '1', scenario: '子应用可以挂到 /sql/ 这类同域路径前缀下', suitable: '适合', reason: '浏览器地址、资源路径、nginx 转发三者一致，默认即可工作' },
  { key: '2', scenario: '品牌或安全要求必须使用独立域名（如 sql.example.com）', suitable: '不适合', reason: '浏览器地址与资源域分离，需要回退到 getWorkerUrl / 绝对路径方案' },
  { key: '3', scenario: '主应用路径前缀冲突（如主应用已有 /sql/ 路由）', suitable: '需要协调', reason: '需更换前缀或调整主应用路由，避免 nginx 与主应用路由冲突' },
  { key: '4', scenario: '严格的 CORS/COEP/CORP 要求', suitable: '可行但增加复杂度', reason: '需要额外配置跨域响应头、资源隔离策略，nginx 只是入口层' },
  { key: '5', scenario: '子应用需要独立部署、独立灰度/回滚', suitable: '适合', reason: 'nginx 只是入口层，后端子应用仍可独立部署、独立维护' },
];

export const webpackStageTable = [
  { key: '1', stage: '源代码', code: 'import("./mode-sql")', resolvedUrl: '（尚未运行）' },
  { key: '2', stage: 'webpack 编译后', code: '__webpack_require__.e("mode-sql") 内部请求 __webpack_require__.p + "js/chunk-mode-sql.js"', resolvedUrl: '（依赖 __webpack_require__.p 的值）' },
  { key: '3', stage: '未设置 __webpack_public_path__', code: '__webpack_require__.p = "" 或 "/"', resolvedUrl: 'https://main.example.com/.../js/chunk-mode-sql.js（404）' },
  { key: '4', stage: '设置 __webpack_public_path__', code: '__webpack_public_path__ = "https://sql.example.com/sql/"', resolvedUrl: 'https://sql.example.com/sql/js/chunk-mode-sql.js（命中）' },
];

export const workerComparisonTable = [
  { key: '1', phase: '主线程动态加载', code: 'import("./mode-sql")', resolve: 'webpack 改写为 __webpack_require__.p + chunkId', publicPath: '受 __webpack_public_path__ 控制' },
  { key: '2', phase: '创建 Worker', code: 'new Worker("./editor.worker.js")', resolve: '浏览器按 document.baseURI 解析字符串 URL', publicPath: '不受 __webpack_public_path__ 控制' },
  { key: '3', phase: 'Worker 内部加载依赖', code: 'self.importScripts("./sql.js")', resolve: '浏览器按 Worker 文件所在 URL 解析', publicPath: 'Worker 有独立全局作用域，主线程 publicPath 不可见' },
];
