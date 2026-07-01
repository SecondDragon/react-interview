// ❌ 反面教材：CodeMirror 默认 modeURL 在子应用下出错
// CodeMirror 会按需加载 mode 文件，但默认路径在 qiankun 中解析错误。

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';

// 创建编辑器时没有配置 modeURL，CodeMirror 默认使用 "%N.js"。
// 当设置 mode: 'sql' 时，它会尝试加载当前页面路径下的 "sql.js"。
// 在 qiankun 主应用 /dashboard/sql 下，这变成了 /dashboard/sql.js，404。

const editor = CodeMirror(document.getElementById('container'), {
  value: 'SELECT * FROM users',
  mode: 'sql',
});
