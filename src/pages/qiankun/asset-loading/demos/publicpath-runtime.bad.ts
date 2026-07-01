// ❌ 反面教材：未设置 __webpack_public_path__，chunk 请求被错误拼接
// 假设构建产物中 app 主包 hash 为 123，动态 chunk 为 456。
// 当页面地址是 https://main.example.com/dashboard/qiankun/sql/ 时，
// webpack 的 __webpack_require__.p 默认是空字符串 ""，动态 chunk 请求会变成：
//   https://main.example.com/dashboard/qiankun/sql/js/chunk-456.js（404）
// 主应用并没有这个 chunk，只有子应用真实域名 https://sql.example.com/sql/ 才有。

// 主应用页面地址
console.log(window.location.href); // https://main.example.com/dashboard/qiankun/sql/

// 子应用代码中的动态 import
import('./mode-sql');

// 未设置 __webpack_public_path__ 时，实际请求（错误）：
// GET https://main.example.com/dashboard/qiankun/sql/js/chunk-456.js 404
// 因为浏览器把相对路径拼到了当前页面 base 上。
