export const ConcurrentExamples = {
  bugPhenomenon:
    "在处理大数据量搜索或复杂图表渲染时，用户在输入框打字会感到明显的'粘滞感'或'卡顿'。这是因为高优先级的交互（打字）被低优先级的渲染任务（大数据过滤和重绘）阻塞了。",
  bugReason:
    "JavaScript 是单线程的。在 React 18 之前，渲染过程是不可中断的（Stack Reconciler）。一旦开始渲染包含上万个节点的列表，主线程就会被死死占用，直到渲染完成，导致浏览器无法响应用户的输入事件。",
  scenarios: [
    "大数据量实时搜索过滤",
    "复杂可视化图表的动态切换",
    "大型表单的实时校验与联动",
    "长列表的快速排序与筛选",
  ],
  badCode: `import React, { useState, memo } from 'react';

// ❌ 反面教材：传统同步渲染 —— 所有更新都是"紧急"的
// 问题：输入和列表过滤同步执行，导致主线程被阻塞，打字卡顿

const HeavyItem: React.FC<{ text: string }> = memo(({ text }) => {
  // 模拟复杂组件的计算开销
  const start = performance.now();
  while (performance.now() - start < 1) { /* 阻塞 1ms */ }

  return (
    <div style={{ padding: 10, margin: 4, background: '#f0f2f5' }}>
      {text}
    </div>
  );
});

const BadSearchPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 生成 5000 条模拟数据
  const items = Array.from({ length: 5000 }, (_, i) =>
    \`数据条目 \${i} - \${Math.random().toString(36).substring(7)}\`
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    // ⚠️ 致命问题：同步触发 5000 个 HeavyItem 的重新渲染
    // 主线程被长时间占用，输入框的响应被阻塞
    setSearchQuery(val);
  };

  const filtered = items.filter((item) => item.includes(searchQuery));

  return (
    <div>
      <input value={inputValue} onChange={handleChange} />
      {/* 每次输入都会同步渲染 5000 个 HeavyItem，导致严重卡顿 */}
      {filtered.map((item, i) => (
        <HeavyItem key={i} text={item} />
      ))}
    </div>
  );
};
`,
  goodCode: `import React, { useState, useTransition, memo } from 'react';

// ✅ 最佳实践：React 18 并发渲染 —— 任务切片，优先级调度
// 核心：用 useTransition 将"非紧急更新"标记为低优先级

const HeavyItem: React.FC<{ text: string }> = memo(({ text }) => {
  // 同样的模拟计算开销
  const start = performance.now();
  while (performance.now() - start < 1) { /* 阻塞 1ms */ }

  return (
    <div style={{ padding: 10, margin: 4, background: '#f0f2f5' }}>
      {text}
    </div>
  );
});

const GoodSearchPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // 1. 获取 startTransition 和 isPending 状态
  const [isPending, startTransition] = useTransition();

  const items = Array.from({ length: 5000 }, (_, i) =>
    \`数据条目 \${i} - \${Math.random().toString(36).substring(7)}\`
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // 2. 紧急任务：立刻更新输入框，保证打字丝滑
    setInputValue(val);

    // 3. 非紧急任务：包裹在 transition 中
    startTransition(() => {
      // React 会将此更新标记为"过渡更新 (Transition)"
      // 它会在浏览器空闲时逐步渲染
      // 如果用户继续打字，React 会中断当前渲染，优先处理新输入
      setSearchQuery(val);
    });
  };

  const filtered = items.filter((item) => item.includes(searchQuery));

  return (
    <div>
      <input value={inputValue} onChange={handleChange} />
      {/* isPending 可用于显示加载状态，给用户反馈 */}
      {isPending && <span>后台渲染中...</span>}
      {/* 列表渲染被标记为低优先级，不会阻塞输入 */}
      <div style={{ opacity: isPending ? 0.7 : 1 }}>
        {filtered.map((item, i) => (
          <HeavyItem key={i} text={item} />
        ))}
      </div>
    </div>
  );
};
`,
  corePrinciple:
    "React 18 的并发模式通过'时间切片（Time Slicing）'将同步的渲染变成可中断的。它利用 Scheduler 调度器，在浏览器每一帧的空闲时间执行部分任务。如果期间有更高优先级的任务（如输入）进入，它会立即暂停当前渲染，优先响应用户交互，等交互完成后再恢复之前的任务。",
};
