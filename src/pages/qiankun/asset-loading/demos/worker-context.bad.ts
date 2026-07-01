// ❌ 反面教材：在 Worker 中继续使用 importScripts 引用相对路径脚本
// Worker 的全局作用域与主线程完全隔离，主线程设置的 __webpack_public_path__ 不会自动传递进来。
// 因此 Worker 内的 importScripts('./sql.js') 会基于 Worker 文件所在 URL 解析，而不是 publicPath。
// 在 qiankun 场景下，Worker 文件本身可能已经被错误加载，内部再加载依赖就会级联 404。

// 主线程虽然设置了 webpack 的 publicPath
__webpack_public_path__ = 'https://sql.example.com/sql/';

// 但 Monaco 创建 Worker 时执行的是 new Worker('./editor.worker.js')，
// 该 Worker 文件执行时，self.importScripts 看到自己的 location 是：
// https://main.example.com/dashboard/editor.worker.js（错误路径）
// 后续 importScripts('./sql.js') 会被解析为：
// https://main.example.com/dashboard/sql.js，导致 404。

function createSQLWorker() {
  // 错误写法：依赖默认相对路径
  return new Worker('./editor.worker.js');
}

// Worker 文件内部（editor.worker.js）
// self.importScripts('./sql.js'); // 相对于 Worker 自身 URL 解析，而不是 __webpack_public_path__
