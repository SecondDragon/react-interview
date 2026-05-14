export const ConcurrentExamples = {
  bugPhenomenon: "在处理大数据量搜索或复杂图表渲染时，用户在输入框打字会感到明显的‘粘滞感’或‘卡顿’。这是因为高优先级的交互（打字）被低优先级的渲染任务（大数据过滤和重绘）阻塞了。",
  bugReason: "JavaScript 是单线程的。在 React 18 之前，渲染过程是不可中断的（Stack Reconciler）。一旦开始渲染包含上万个节点的列表，主线程就会被死死占用，直到渲染完成，导致浏览器无法响应用户的输入事件。",
  scenarios: [
    "大数据量实时搜索过滤",
    "复杂可视化图表的动态切换",
    "大型表单的实时校验与联动",
    "长列表的快速排序与筛选"
  ],
  badCode: `
// ❌ 传统写法：所有更新都是紧急的
const handleChange = (e) => {
  // 输入即刻触发搜索，导致 UI 冻结
  setInputValue(e.target.value);
  setSearchQuery(e.target.value); // 触发繁重的过滤渲染
};
  `,
  goodCode: `
// ✅ React 18 并发写法：任务切片
const [isPending, startTransition] = useTransition();

const handleChange = (e) => {
  // 1. 紧急任务：立刻更新输入框状态，保证打字丝滑
  setInputValue(e.target.value);

  // 2. 非紧急任务：包裹在 transition 中
  startTransition(() => {
    // React 会在后台低优先级渲染这个更新
    // 如果用户继续打字，React 会中断当前的渲染，优先处理新的输入
    setSearchQuery(e.target.value);
  });
};
  `,
  corePrinciple: "React 18 的并发模式通过‘时间切片（Time Slicing）’将同步的渲染变成可中断的。它利用 Scheduler 调度器，在浏览器每一帧的空闲时间执行部分任务。如果期间有更高优先级的任务（如输入）进入，它会立即暂停当前渲染，优先响应用户交互，等交互完成后再恢复之前的任务。"
};
