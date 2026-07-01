// ✅ 最佳实践：配置 MonacoEnvironment.getWorkerUrl
// 显式指定 worker 文件的加载 URL，避免浏览器按当前页面路径解析。

// 在加载 monaco-editor 之前设置全局 MonacoEnvironment。
// 注意：window.MonacoEnvironment 必须在 import monaco 之前定义，
// 因为 monaco 内部会在初始化时读取它。
window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    // 这里返回 worker 文件的绝对路径或相对于域名根的路径。
    // 如果子应用部署在 /sql/ 下，worker 文件在 /sql/monaco/editor.worker.js，
    // 直接返回该路径，确保浏览器能正确请求到。
    return `/sql/monaco/vs/base/worker/worker-main.js`;
  },
};

import * as monaco from 'monaco-editor';

monaco.editor.create(document.getElementById('container'), {
  value: 'SELECT * FROM users',
  language: 'sql',
});

// 更高级的方案：按 label 返回不同 worker 文件，例如 json worker、css worker 等。
// window.MonacoEnvironment = {
//   getWorkerUrl: function (moduleId, label) {
//     const workerMap = {
//       sql: '/sql/monaco/vs/language/sql/sqlWorker.js',
//       json: '/sql/monaco/vs/language/json/jsonWorker.js',
//       default: '/sql/monaco/vs/base/worker/worker-main.js',
//     };
//     return workerMap[label] || workerMap.default;
//   },
// };
