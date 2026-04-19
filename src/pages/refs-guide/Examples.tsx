/**
 * 本文件存放 Refs 最佳实践相关的示例代码
 * 归属组件: src/pages/refs-guide/RefsBestPractice.tsx
 */

// --- 场景 1: 在 Render 中读取/修改 Ref (错误示范) ---
/*
  位置: RefsBestPractice.tsx -> RenderPhaseIssue 组件
  错误原因: 修改 ref.current 不会触发重渲染，且在 Render 阶段读取它会导致 UI 与数据状态不一致。
*/
export const renderPhaseErrorExample = `
function RenderPhaseIssue() {
  const countRef = useRef(0);

  // ❌ 错误：在 render 过程中直接修改 ref
  countRef.current = countRef.current + 1;

  return (
    <div>
      <p>尝试计数的 Ref: {countRef.current}</p>
      <button onClick={() => console.log(countRef.current)}>打印最新值</button>
    </div>
  );
}
`;

// --- 场景 1: 正确解法 (使用 State 或 Effect) ---
/*
  位置: RefsBestPractice.tsx -> RenderPhaseFixed 组件
  解法: 如果值需要参与 UI 渲染，请使用 useState；如果只是记录副作用，请在 useEffect 中操作。
*/
export const renderPhaseFixedExample = `
function RenderPhaseFixed() {
  // ✅ 正确：如果 UI 需要响应变化，使用 State
  const [count, setCount] = useState(0);
  
  // ✅ 正确：如果只是想记录渲染次数（不显示在 UI 上），在 Effect 中修改
  const renderCountRef = useRef(0);
  useEffect(() => {
    renderCountRef.current += 1;
  });

  return (
    <div>
      <p>当前计数 (State): {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加计数</button>
    </div>
  );
}
`;
