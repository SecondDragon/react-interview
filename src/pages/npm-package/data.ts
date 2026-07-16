export const packageJsonFields = {
  columns: [
    { title: '字段名', dataIndex: 'field', key: 'field', width: 160 },
    { title: '用途', dataIndex: 'purpose', key: 'purpose', width: 200 },
    { title: '发布时的影响', dataIndex: 'impact', key: 'impact' },
  ],
  dataSource: [
    {
      key: '1',
      field: 'main',
      purpose: 'CommonJS 入口',
      impact: 'Node.js require() 解析时使用。如未指定，默认找 index.js',
    },
    {
      key: '2',
      field: 'module',
      purpose: 'ES Module 入口',
      impact: '打包工具（Webpack/Rollup）解析 import 时优先使用，支持 tree-shaking',
    },
    {
      key: '3',
      field: 'types',
      purpose: 'TypeScript 类型声明入口',
      impact: '使用者安装包后能获得完整的类型提示。缺失则无法 d.ts 推导',
    },
    {
      key: '4',
      field: 'exports',
      purpose: '子路径导出映射',
      impact: '精确控制包的导出范围，可做条件导出（require vs import）和环境隔离',
    },
    {
      key: '5',
      field: 'files',
      purpose: '发布白名单',
      impact: '限定 npm publish 时哪些文件上传到 registry，减少包体积',
    },
    {
      key: '6',
      field: 'sideEffects',
      purpose: '副作用标记',
      impact: '告知打包工具哪些文件有副作用，影响 tree-shaking 的正确性',
    },
    {
      key: '7',
      field: 'peerDependencies',
      purpose: '对等依赖',
      impact: '声明宿主环境需要提供的依赖（如 React），避免重复安装',
    },
    {
      key: '8',
      field: 'scripts',
      purpose: '生命周期脚本',
      impact: 'prepublishOnly / prepack 等钩子在发布前后自动执行',
    },
  ],
};

export const buildToolComparison = {
  columns: [
    { title: '特性', dataIndex: 'feature', key: 'feature', width: 120 },
    { title: 'tsup', dataIndex: 'tsup', key: 'tsup' },
    { title: 'Rollup', dataIndex: 'rollup', key: 'rollup' },
    { title: 'tsc', dataIndex: 'tsc', key: 'tsc' },
  ],
  dataSource: [
    { key: '1', feature: '配置复杂度', tsup: '极低（~5 行）', rollup: '中等（~30 行）', tsc: '最低（仅 tsconfig）' },
    { key: '2', feature: '输出格式', tsup: 'ESM + CJS + dts', rollup: 'ESM + CJS（需插件）', tsc: '仅 JS（需额外工具）' },
    { key: '3', feature: 'TypeScript', tsup: '原生支持', rollup: '需 @rollup/plugin-typescript', tsc: '原生支持' },
    { key: '4', feature: '代码压缩', tsup: '内置 esbuild 压缩', rollup: '需 @rollup/plugin-terser', tsc: '不支持' },
    { key: '5', feature: 'Tree Shaking', tsup: 'esbuild 级别', rollup: 'Rollup 级别（最佳）', tsc: '不支持' },
    { key: '6', feature: '构建速度', tsup: '极快（Go 语言）', rollup: '中等', tsc: '较慢' },
    { key: '7', feature: '类型声明生成', tsup: '内置 --dts', rollup: '需 rollup-plugin-dts', tsc: 'declaration: true' },
    { key: '8', feature: '应用场景', tsup: '组件库/工具库', rollup: '复杂库/框架', tsc: '简单包/学习用途' },
  ],
};

export const semverTable = {
  columns: [
    { title: '版本示例', dataIndex: 'version', key: 'version', width: 140 },
    { title: '含义', dataIndex: 'meaning', key: 'meaning' },
    { title: '兼容性要求', dataIndex: 'compatibility', key: 'compatibility' },
  ],
  dataSource: [
    { key: '1', version: '1.0.0', meaning: '正式版（Major.Minor.Patch）', compatibility: '首次发布，无兼容承诺' },
    { key: '2', version: '1.1.0 → 1.2.0', meaning: '次版本号递增（Minor）', compatibility: '新增功能，向后兼容' },
    { key: '3', version: '1.1.0 → 1.1.1', meaning: '补丁版本递增（Patch）', compatibility: 'Bug 修复，向后兼容' },
    { key: '4', version: '2.0.0', meaning: '主版本号递增（Major）', compatibility: '破坏性变更，不兼容' },
    { key: '5', version: '^1.2.3', meaning: '兼容范围（向上兼容次版本）', compatibility: '允许安装 1.x.x 最高版本' },
    { key: '6', version: '~1.2.3', meaning: '近似范围（仅补丁版本）', compatibility: '允许安装 1.2.x 最高版本' },
    { key: '7', version: '0.x.x', meaning: '开发阶段', compatibility: '不保证 API 稳定' },
    { key: '8', version: '1.0.0-alpha.1', meaning: '预发布版本', compatibility: '测试用途，不用于生产' },
  ],
};
