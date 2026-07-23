export interface DebounceVersionInfo {
  key: string;
  label: string;
  desc: string;
  highlights: string[];
  limitations: string[];
}

export const debounceVersions: DebounceVersionInfo[] = [
  {
    key: 'simple',
    label: '最简版',
    desc: '只保留 setTimeout + clearTimeout 核心机制，理解防抖的本质。',
    highlights: ['代码量最少，易于理解核心机制', '使用 apply 透传 this 与参数'],
    limitations: ['无 leading / trailing 控制', '无 cancel / flush / pending API', '无 maxWait 保护'],
  },
  {
    key: 'complex',
    label: '复杂版',
    desc: '在简单版基础上加入 leading / trailing 选项，覆盖搜索建议、按钮连点等高频场景。',
    highlights: ['支持 leading：首次触发立即执行', '支持 trailing：停止触发后补齐一次执行', '保留 this 与参数透传'],
    limitations: ['仍无 maxWait，极端高频下可能长期不执行', '无 cancel / flush / pending'],
  },
  {
    key: 'complete',
    label: '完全版',
    desc: '对齐 lodash 语义，补充 maxWait、返回值、cancel / flush / pending 等完整 API。',
    highlights: ['maxWait 避免无限等待', 'cancel / flush / pending 提供完整控制能力', '返回最后一次实际执行结果'],
    limitations: ['代码量增加，边界处理较多'],
  },
];

export const debounceComparisonColumns = [
  { title: '维度', dataIndex: 'dimension', key: 'dimension' },
  { title: '最简版', dataIndex: 'simple', key: 'simple' },
  { title: '复杂版', dataIndex: 'complex', key: 'complex' },
  { title: '完全版', dataIndex: 'complete', key: 'complete' },
];

export const debounceComparisonDataSource = [
  {
    key: '1',
    dimension: '核心能力',
    simple: '延迟执行 + 重新计时',
    complex: '+ leading / trailing',
    complete: '+ maxWait + 返回值 + cancel/flush/pending',
  },
  {
    key: '2',
    dimension: 'this / 参数',
    simple: 'apply 透传',
    complex: 'apply 透传',
    complete: 'apply 透传并保存',
  },
  {
    key: '3',
    dimension: '适用场景',
    simple: '学习 / 简单输入框',
    complex: '搜索建议、按钮防抖',
    complete: '生产级组件库',
  },
];

export const defaultWait = 500;

export const waitOptions = [
  { label: '200ms', value: 200 },
  { label: '500ms', value: 500 },
  { label: '1000ms', value: 1000 },
];

export const maxWaitOptions = [
  { label: '500ms', value: 500 },
  { label: '1000ms', value: 1000 },
  { label: '2000ms', value: 2000 },
];
