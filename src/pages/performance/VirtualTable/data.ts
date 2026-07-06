export const principleSteps = [
  {
    title: '滚动事件触发',
    description: '用户滚动容器时，容器触发 onScroll 事件，useVirtualizer 开始重新计算当前视口对应的行索引范围。',
  },
  {
    title: '计算可见范围',
    description: '根据 scrollTop + clientHeight 计算出视口在总内容中的位置，再结合 estimateSize 预估行高，推算出哪些行的索引应该出现在视口中。',
  },
  {
    title: '更新虚拟行列表',
    description: 'rowVirtualizer.getVirtualItems() 返回本次渲染需要的虚拟行数组，只包含视口内 + overscan 缓冲区的行。',
  },
  {
    title: 'React 重新渲染',
    description: 'React 只对 virtualRows 中的行进行 reconciliation，DOM 数量从 10000 降至 ~20 行。',
  },
  {
    title: '定位行位置',
    description: '通过 transform: translateY(virtualRow.start) 将每行 DOM "钉"在正确滚动位置，模拟完整内容的高度。',
  },
];

export const scenarioList = [
  '后台管理系统的数据表格（如用户列表、订单列表、日志列表）',
  '实时监控仪表盘中的滚动列表',
  '聊天记录/消息列表的历史消息加载',
  '大数据量下拉选择器的选项渲染',
  '财务报表/交易流水等长列表场景',
];

export const featureComparison = [
  { dimension: 'DOM 节点数', without: '10000+ 个 <tr>', with: '15~30 个 <div>（仅视口内）' },
  { dimension: '初始渲染时间', without: '~500ms（可能触发 Long Task）', with: '~30ms（瞬间完成）' },
  { dimension: '内存占用', without: '高（完整 DOM 树）', with: '低（仅渲染可见行）' },
  { dimension: '勾选功能', without: '原生支持（但卡顿）', with: '结合 TanStack Table 逻辑支持' },
  { dimension: '滚动性能', without: '严重卡顿 / 掉帧', with: '60fps 流畅滚动' },
  { dimension: '开发复杂度', without: '低（直接 map）', with: '中（需集成虚拟库）' },
];
