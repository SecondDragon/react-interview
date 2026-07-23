export interface ThrottleVersionInfo {
  key: string;
  label: string;
  desc: string;
  highlights: string[];
  limitations: string[];
}

export const throttleVersions: ThrottleVersionInfo[] = [
  {
    key: 'simple',
    label: '最简版',
    desc: '只保留时间戳控制，限制函数在 wait 毫秒内最多执行一次。',
    highlights: ['代码量最少，理解节流本质', '使用 Date.now() 判断时间间隔'],
    limitations: ['无 leading / trailing 控制', '无 cancel / flush API', '首次触发默认立即执行'],
  },
  {
    key: 'complex',
    label: '复杂版',
    desc: '在简单版基础上加入 leading / trailing 选项，覆盖页面滚动、窗口 resize 等场景。',
    highlights: ['支持 leading：周期开始立即执行', '支持 trailing：周期结束补齐一次执行', '可关闭 leading 实现“延迟首执行”'],
    limitations: ['无 cancel / flush API', '无返回值管理'],
  },
  {
    key: 'complete',
    label: '完全版',
    desc: '对齐 lodash 语义，提供 cancel / flush API，并正确处理返回值。',
    highlights: ['完整的 cancel / flush 控制', '返回上一次执行结果', 'this 与参数正确透传'],
    limitations: ['代码量增加，边界判断较多'],
  },
];

export const throttleComparisonColumns = [
  { title: '维度', dataIndex: 'dimension', key: 'dimension' },
  { title: '最简版', dataIndex: 'simple', key: 'simple' },
  { title: '复杂版', dataIndex: 'complex', key: 'complex' },
  { title: '完全版', dataIndex: 'complete', key: 'complete' },
];

export const throttleComparisonDataSource = [
  {
    key: '1',
    dimension: '核心能力',
    simple: '时间戳限制频率',
    complex: '+ leading / trailing',
    complete: '+ cancel / flush + 返回值',
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
    simple: '学习 / 简单滚动监听',
    complex: '滚动、resize、按钮限频',
    complete: '生产级组件库',
  },
];

export const defaultWait = 1000;

export const waitOptions = [
  { label: '500ms', value: 500 },
  { label: '1000ms', value: 1000 },
  { label: '2000ms', value: 2000 },
];
