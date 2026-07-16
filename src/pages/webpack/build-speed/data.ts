import type { ColumnsType } from 'antd/es/table';

export const chapterOverviewColumns: ColumnsType = [
  { title: '章节', dataIndex: 'chapter', key: 'chapter', width: 70 },
  { title: '优化手段', dataIndex: 'method', key: 'method', width: 160 },
  { title: '核心思路', dataIndex: 'idea', key: 'idea' },
  { title: 'W4 vs W5', dataIndex: 'evolution', key: 'evolution', width: 140 },
];

export const chapterOverviewData = [
  {
    key: '1',
    chapter: '一',
    method: '公共依赖提取（SplitChunks）',
    idea: '将公共模块提取为独立 Chunk，缩小单文件规模，提升缓存复用率和并行压缩效率',
    evolution: 'CommonsChunkPlugin → SplitChunksPlugin',
  },
  {
    key: '2',
    chapter: '二',
    method: 'Loader 范围限制 + oneOf',
    idea: '缩小文件搜索范围，减少规则匹配次数',
    evolution: 'W5 新增 oneOf',
  },
  {
    key: '3',
    chapter: '三',
    method: '多线程编译',
    idea: '将耗时 Loader 放到 Worker 池中并行处理',
    evolution: 'happypack → thread-loader',
  },
  {
    key: '4',
    chapter: '四',
    method: '持久化缓存',
    idea: '缓存已编译模块，二次构建跳过未变更部分',
    evolution: '三件套 → 内置 cache.filesystem',
  },
  {
    key: '5',
    chapter: '五',
    method: '模块标识符稳定化',
    idea: '确定性 Module/Chunk ID 避免缓存大面积失效',
    evolution: '需插件 → 默认 deterministic',
  },
  {
    key: '6',
    chapter: '六',
    method: 'JavaScript 并行压缩',
    idea: '多线程并行压缩 JS，缩短构建总时长',
    evolution: 'uglifyjs → terser（内置）',
  },
  {
    key: '7',
    chapter: '七',
    method: 'CSS 压缩',
    idea: '压缩和去重 CSS，减少产物体积',
    evolution: 'optimize-css-assets → css-minimizer',
  },
  {
    key: '8',
    chapter: '八',
    method: '构建信息与进度展示',
    idea: '优化构建日志输出，提升开发体验',
    evolution: 'friendly-errors → WebpackBar',
  },
];

export const wp4wp5CacheColumns: ColumnsType = [
  { title: '维度', dataIndex: 'dimension', key: 'dimension', width: 120 },
  { title: 'Webpack 4 做法', dataIndex: 'wp4', key: 'wp4' },
  { title: 'Webpack 5 做法', dataIndex: 'wp5', key: 'wp5' },
];

export const wp4wp5CacheData = [
  {
    key: '1',
    dimension: '配置量',
    wp4: '需安装 3 个插件 + 各自配置',
    wp5: '一行 cache.type = "filesystem"',
  },
  {
    key: '2',
    dimension: '缓存粒度',
    wp4: 'Loader 级(cache-loader) + 模块级(HardSource) + Babel 自身',
    wp5: '统一模块级缓存，自动管理',
  },
  {
    key: '3',
    dimension: '缓存失效',
    wp4: '手动处理，容易遗漏导致缓存不命中',
    wp5: 'buildDependencies 自动追踪配置文件变更',
  },
  {
    key: '4',
    dimension: '产物体积',
    wp4: '缓存文件散落在 node_modules/.cache/ 下',
    wp5: '统一放在 .cache/webpack/，管理更清晰',
  },
];

export const splitChunksColumns: ColumnsType = [
  { title: 'API', dataIndex: 'api', key: 'api', width: 200 },
  { title: '说明', dataIndex: 'desc', key: 'desc' },
];

export const splitChunksData = [
  { key: '1', api: 'chunks: "async" | "initial" | "all"', desc: '控制哪些 Chunk 参与分割。all 是最推荐的值，同时处理同步和异步 Chunk' },
  { key: '2', api: 'minSize / maxSize', desc: '控制生成 Chunk 的最小/最大体积（bytes），合理配置可避免碎片化' },
  { key: '3', api: 'minChunks', desc: '一个模块被引用至少 N 次才被提取为公共模块（默认 1）' },
  { key: '4', api: 'cacheGroups', desc: '自定义提取规则分组。最常用的是把 node_modules 中的第三方库提取为 vendor' },
];

export const threadLoaderWarningColumns: ColumnsType = [
  { title: '问题', dataIndex: 'issue', key: 'issue' },
  { title: '说明', dataIndex: 'desc', key: 'desc' },
];

export const threadLoaderWarningData = [
  { key: '1', issue: '线程通信开销', desc: '文件很小（<100KB）时，创建 Worker 的开销可能反而超过省下的时间' },
  { key: '2', issue: '无法处理文件类型', desc: 'thread-loader 不支持 mini-css-extract-plugin 的 loader（需要文件写入）' },
  { key: '3', issue: '不适用于 webpack-dev-server', desc: 'HMR 场景下 thread-loader 可能引发模块更新不同步' },
  { key: '4', issue: 'Worker 数不是越多越好', desc: '一般建议 workers = CPU 核数 - 1' },
];
