/**
 * IME 组合输入案例元数据
 */
export const IMEInputExamples = {
  description: "中文输入法（IME）合成阶段的内核差异与致命故障分析。",
  ultimatePlan: `
const PerfectChineseInput = () => {
  const isComposing = useRef(false);
  const requestCount = useRef(0);
  const abortRef = useRef(new AbortController());

  const handleStart = () => { isComposing.current = true; };
  const handleEnd = (e) => {
    isComposing.current = false;
    doSearch(e.target.value); // 补偿触发
  };
  const handleInput = (e) => {
    if (isComposing.current) return;
    doSearch(e.target.value);
  };

  const doSearch = async (val) => {
    const currentId = ++requestCount.current;
    abortRef.current.abort(); // 物理取消
    abortRef.current = new AbortController();

    try {
      const res = await api.search(val, { signal: abortRef.current.signal });
      if (currentId === requestCount.current) { // 逻辑校验
        setList(res);
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
  };

  return (
    <input 
      onCompositionStart={handleStart} 
      onCompositionEnd={handleEnd} 
      onInput={handleInput} 
    />
  );
};`,
  cursorJumping: {
    title: "致命故障 A：光标跳跃与焦点丢失",
    reason: "React 受控组件模式下，拼音输入触发 setState 导致 DOM 重新渲染，打断输入法缓冲区。",
    phenomenon: "用户输入拼音时，光标乱跳，甚至输入法弹窗闪退。",
    bad: "const [val, setVal] = useState(''); \n<input value={val} onChange={(e) => setVal(e.target.value)} />",
    good: "const handleEnd = (e) => { setSearchValue(e.target.value); }; \n<input defaultValue={searchValue} onCompositionEnd={handleEnd} />"
  }
};
