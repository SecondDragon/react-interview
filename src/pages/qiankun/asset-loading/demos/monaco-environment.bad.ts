// ❌ 反面教材：未配置 MonacoEnvironment.getWorkerUrl
// Monaco 默认会尝试从当前页面路径加载 worker，在 qiankun 中通常 404。

// 子应用入口或组件中直接创建 Monaco Editor，没有配置 MonacoEnvironment。
// 这会导致 Monaco 在创建 editor 时，尝试通过 new Worker('./editor.worker.js') 加载 worker。
// 在独立运行时，./editor.worker.js 可能对应 /editor.worker.js；
// 但在 qiankun 中，当前页面是主应用的 /dashboard/sql，
// 于是请求变成了 /dashboard/editor.worker.js，显然 404。

import * as monaco from 'monaco-editor';

monaco.editor.create(document.getElementById('container'), {
  value: 'SELECT * FROM users',
  language: 'sql',
});
