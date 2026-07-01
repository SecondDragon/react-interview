// ✅ 最佳实践：在 Worker 中显式使用绝对路径，并避免依赖主线程的 publicPath
// Web Worker 有独立的全局作用域，self.__webpack_public_path__ 与主线程不同。
// 正确的做法是在创建 Worker 时传入完整 URL，在 Worker 内部也通过绝对路径或相对于 Worker 文件的正确路径加载依赖。

// 主线程：先定义 MonacoEnvironment，再引入 monaco
window.MonacoEnvironment = {
  getWorkerUrl(_moduleId, label) {
    // 使用完整 URL，绕过浏览器对当前页面 base 的依赖
    const workerMap: Record<string, string> = {
      sql: 'https://sql.example.com/sql/monaco/vs/language/sql/sqlWorker.js',
      json: 'https://sql.example.com/sql/monaco/vs/language/json/jsonWorker.js',
      default: 'https://sql.example.com/sql/monaco/vs/base/worker/worker-main.js',
    };
    return workerMap[label] || workerMap.default;
  },
};

import * as monaco from 'monaco-editor';

// 创建编辑器，worker 会由 getWorkerUrl 返回的绝对 URL 加载
monaco.editor.create(document.getElementById('container')!, {
  value: 'SELECT * FROM users',
  language: 'sql',
});

// Worker 内部（例如 sqlWorker.js）
// 使用绝对路径引入依赖，或基于 Worker 文件自身 URL 计算
// self.importScripts('https://sql.example.com/sql/monaco/vs/language/sql/sqlWorkerDeps.js');
