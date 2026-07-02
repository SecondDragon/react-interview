// data.ts - 样式丢失与 CSSOM 注入专题的纯数据定义
// 遵循 AGENTS.md MDX 规范：data.ts 仅存放配置、初始状态、对比表格、小型 snippet

// ============================================================
// 现象对比表
// ============================================================
export const phenomenonTable = [
  { key: '1', scene: '主子应用切换后切回', symptoms: 'DOM 中有组件和 sc-xxxxx 类名，但 head 中无对应 CSS 规则', frequency: '高', recovery: '硬刷新可恢复' },
  { key: '2', scene: '首次从主切子（无反复切换）', symptoms: '首次点菜单进入子应用就白屏/无样式', frequency: '中', recovery: '刷新 1-3 次' },
  { key: '3', scene: '直接 URL 进入子应用路由', symptoms: '随机性白屏/无样式，需刷新 2-3 次才正常', frequency: '中', recovery: '多次刷新' },
  { key: '4', scene: '开发环境（dev server）', symptoms: '从不出现', frequency: '零', recovery: 'N/A' },
];

// ============================================================
// CSSOM vs textContent 对比表
// ============================================================
export const cssomComparisonTable = [
  { key: '1', aspect: 'CSS 规则物理位置', cssom: 'CSSStyleSheet 对象（内存）', textContent: '<style> 标签内（DOM 文本节点）' },
  { key: '2', aspect: 'style.textContent', cssom: '空（或仅注释占位）', textContent: '完整 CSS 规则文本' },
  { key: '3', aspect: 'DevTools Elements 可见性', cssom: '不可见（Styles 面板可见）', textContent: '直接可见 CSS 文本' },
  { key: '4', aspect: 'remove + re-append 后 .sheet', cssom: '被重置为空的新 CSSStyleSheet', textContent: 'textContent 保持完整，浏览器自动 re-parse' },
  { key: '5', aspect: '写入方式', cssom: 'tag.sheet.insertRule()（CSS OM API）', textContent: 'tag.textContent += cssText（DOM Text API）' },
  { key: '6', aspect: '注入触发', cssom: '增量写入 CSSOM，不触发全量 CSS 解析', textContent: '文本追加触发浏览器 re-parse' },
];

// ============================================================
// 分析管线：从现象到根因的步骤
// ============================================================
export const analysisSteps = [
  { step: '第一步', title: '排除 qiankun 配置', detail: '逐一测试 experimentalStyleIsolation（开关）和 sandbox（三种值），均无效 → 问题不在隔离策略' },
  { step: '第二步', title: '聚焦 styled-components', detail: '子应用用 styled-components 运行时注入样式（非构建时 .css），qiankun 生命周期可能清掉了动态 <style> 标签' },
  { step: '第三步', title: '追踪注入机制', detail: 'StyleSheet 全局单例管理标签 → 两种注入模式（CSSOM / textContent）→ hasInjected() 只检查 this.tag !== null，不检查 isConnected' },
  { step: '第四步', title: '复现路径推演', detail: '首次 mount → unmount 清标签 → remount 时 hasInjected() 误判 → CSSOM 的 insertRule 写入 detached sheet → 无渲染效果' },
  { step: '第五步', title: '验证假设', detail: '设置 disableCSSOMInjection: true 部署生产 → 问题消失 → 确认根因' },
];

// ============================================================
// StyleSheet 注入生命周期
// ============================================================
export const injectionLifecycle = [
  { phase: '初始化（模块加载时）', desc: 'StyleSheet 构造函数执行 → this.tag = null → this.names = new Set()。此时还没有 <style> 标签。' },
  { phase: '首次注入（第一个 styled 组件渲染）', desc: 'Component render → StyleSheet.inject() → this.tag 为 null → createStyleElement() → document.head.appendChild(style) → this.tag = style → 写入 CSS。' },
  { phase: '后续注入（其他 styled 组件）', desc: '新组件 render → StyleSheet.inject() → this.tag 非 null → 检查 names 是否已有该组件 ID → 没有 → 追加规则 → 加入 names。' },
  { phase: '卸载后再次注入（remount）', desc: 'Component render → StyleSheet.inject() → this.tag 非 null → names 已有该 ID → 跳过注入（认为样式已存在）⚠️ 这就是误判。' },
];

// ============================================================
// qiankun remount 三步冲突
// ============================================================
export const mountUnmountRemount = [
  {
    step: '① Mount（子应用被激活）',
    effects: [
      'qiankun mount() → React render → styled-components 初始化',
      'createStyleElement() → qiankun 沙箱代理拦截 appendChild → 注入沙箱容器',
      '样式正常 ✅',
    ],
  },
  {
    step: '② Unmount（用户切走）',
    effects: [
      'qiankun unmount() → React 卸载组件树 → 沙箱清理容器 DOM',
      '<style> 从文档树移除（变为 detached）',
      '⚠️ StyleSheet 单例仍在 JS 内存中 → this.tag 引用未释放',
      '⚠️ hasInjected() 永远返回 true',
    ],
  },
  {
    step: '③ Remount（用户切回）',
    effects: [
      'qiankun mount() → React 重新渲染 → 生成 sc-xxxxx 类名',
      'hasInjected() 返回 true → 跳过 <style> 标签重建',
      '新规则：CSSOM → tag.sheet.insertRule() → 写入 detached CSSStyleSheet → 0 渲染效 ❌',
      '新规则：textContent → getTag() 检测 isConnected → 置空 tag → 重建标签 → writeSheet() 批量恢复 ✅',
    ],
  },
];

// ============================================================
// 竞态条件时序表
// ============================================================
export const raceConditionTable = [
  { key: 'A', timing: '沙箱代理先就绪 → 子应用 JS 后执行', result: '样式正常', cssom: '✅', textContent: '✅' },
  { key: 'B', timing: '子应用 JS 先执行 → 沙箱代理后就绪', result: '样式丢失', cssom: '❌ .sheet 重置', textContent: '✅ 自动恢复' },
];

// ============================================================
// 为何只生产环境出现
// ============================================================
export const whyProdOnlyList = [
  '本地开发：只有一个子应用在 dev server 上跑，不会频繁 mount/unmount，qiankun 沙箱几乎不触发 cleanup',
  '开发环境子应用通过 HTTP 拉取 JS bundle → 加载路径更长 → 沙箱初始化时间充裕',
  '生产环境：多子应用 JS 直接从 CDN 加载（极快）→ 沙箱初始化的竞态窗口被急剧压缩',
  '真实用户的浏览器性能参差不齐、网络延迟随机 → 非确定性 Bug 的典型成因',
];

// ============================================================
// LiveDemo 数据
// ============================================================
export const liveDemoData = {
  title: 'CSSOM vs textContent 模式对比演示',
  description: '模拟 qiankun 卸载/重挂载过程：先渲染两个模式下的 styled 容器，然后点击"模拟 qiankun 卸载"移走 <style> 标签，再点击"模拟 qiankun 重挂载"触发 React 重新渲染，观察 CSSOM 模式是否丢失样式、textContent 模式是否自愈。',
  cssomTitle: 'CSSOM Injection 模式（默认）',
  cssomDesc: '样式通过 CSSStyleSheet.insertRule() 注入。点击下方的按钮模拟 qiankun 卸载再重挂载，观察样式是否会永久丢失。',
  textContentTitle: 'textContent 模式（disableCSSOMInjection: true）',
  textContentDesc: '样式通过 style.textContent += cssText 注入。模拟 qiankun 卸载再重挂载后，getTag() 会检测到标签 disconnected 并自动重建。',
};
