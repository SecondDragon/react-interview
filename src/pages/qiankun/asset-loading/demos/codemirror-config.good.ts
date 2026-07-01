// ✅ 最佳实践：显式配置 CodeMirror.modeURL 和 themeURL

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';

// 在创建编辑器之前，显式设置 mode 和 theme 的加载路径。
// %N 会被替换为 mode 名称，例如 sql 会加载 /sql/codemirror/mode/sql/sql.js。
// 路径建议使用绝对路径，避免浏览器以当前页面为 base 解析错误。
CodeMirror.modeURL = '/sql/codemirror/mode/%N/%N.js';
CodeMirror.themeURL = '/sql/codemirror/theme/%N.css';

const editor = CodeMirror(document.getElementById('container'), {
  value: 'SELECT * FROM users',
  mode: 'sql',
  theme: 'monokai',
});
