export interface LodashFunction {
  name: string;
  desc: string;
  done: boolean;
  path?: string;
}

export interface FunctionCategory {
  key: string;
  title: string;
  functions: LodashFunction[];
}

export const lodashCategories: FunctionCategory[] = [
  {
    key: 'function-control',
    title: '函数控制',
    functions: [
      { name: 'debounce', desc: '防抖：延迟执行，合并高频触发', done: true, path: '/dashboard/lodash/debounce' },
      { name: 'throttle', desc: '节流：限制执行频率', done: true, path: '/dashboard/lodash/throttle' },
      { name: 'once', desc: '只执行一次', done: false },
      { name: 'memoize', desc: '缓存函数结果', done: false },
    ],
  },
  {
    key: 'collection',
    title: '集合 / 数组',
    functions: [
      { name: 'chunk', desc: '按大小分块', done: false },
      { name: 'uniqBy', desc: '按字段去重', done: false },
      { name: 'groupBy', desc: '按条件分组', done: false },
      { name: 'orderBy', desc: '多字段排序', done: false },
      { name: 'flattenDeep', desc: '递归打平数组', done: false },
    ],
  },
  {
    key: 'object',
    title: '对象',
    functions: [
      { name: 'cloneDeep', desc: '深拷贝', done: false },
      { name: 'merge', desc: '递归合并对象', done: false },
      { name: 'pick', desc: '选取指定属性', done: false },
      { name: 'omit', desc: '排除指定属性', done: false },
      { name: 'get', desc: '安全读取路径值', done: false },
      { name: 'set', desc: '安全设置路径值', done: false },
      { name: 'has', desc: '判断路径是否存在', done: false },
    ],
  },
  {
    key: 'lang',
    title: 'Lang',
    functions: [
      { name: 'isEqual', desc: '深比较', done: false },
      { name: 'isEmpty', desc: '判断是否为空', done: false },
      { name: 'isNil', desc: '判断 null 或 undefined', done: false },
    ],
  },
  {
    key: 'string',
    title: '字符串',
    functions: [
      { name: 'camelCase', desc: '转驼峰', done: false },
      { name: 'snakeCase', desc: '转蛇形', done: false },
      { name: 'kebabCase', desc: '转短横线', done: false },
    ],
  },
  {
    key: 'math',
    title: '数学',
    functions: [
      { name: 'random', desc: '随机数', done: false },
      { name: 'range', desc: '生成范围数组', done: false },
      { name: 'clamp', desc: '限制数值范围', done: false },
      { name: 'sumBy', desc: '按字段求和', done: false },
    ],
  },
];
