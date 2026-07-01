// ✅ 最佳实践：运行时设置 __webpack_public_path__，让 chunk URL 指向子应用真实路径
// 在子应用入口 JS 最顶部设置 __webpack_public_path__，qiankun 注入的路径会覆盖默认值。
// 设置后，webpack 的 __webpack_require__.p 变成 https://sql.example.com/sql/，
// 所有动态 chunk 请求都会自动带上这个前缀。

// 子应用入口最顶部，所有 import 和动态加载之前执行
__webpack_public_path__ =
  window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ ||
  (process.env.NODE_ENV === 'production' ? 'https://sql.example.com/sql/' : '/');

// 主应用页面地址仍然是：https://main.example.com/dashboard/qiankun/sql/
console.log(window.location.href); // 未变，还是主应用 URL

// 子应用代码中的动态 import
import('./mode-sql');

// 设置 __webpack_public_path__ 后，实际请求（正确）：
// GET https://sql.example.com/sql/js/chunk-456.js 200
// 因为 webpack 用 __webpack_require__.p + "js/chunk-456.js" 拼接了完整 URL。
