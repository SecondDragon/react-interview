/**
 * IME 组合输入案例元数据
 */
export const IMEInputExamples = {
  description: '中文输入法（IME）合成阶段的内核差异与致命故障分析。',
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
    title: '致命故障 A：光标跳跃与焦点丢失',
    reason: 'React 受控组件模式下，拼音输入触发 setState 导致 DOM 重新渲染，打断输入法缓冲区。',
    phenomenon: '用户输入拼音时，光标乱跳，甚至输入法弹窗闪退。',
    bad: "const [val, setVal] = useState(''); \n<input value={val} onChange={(e) => setVal(e.target.value)} />",
    good: 'const handleEnd = (e) => { setSearchValue(e.target.value); }; \n<input defaultValue={searchValue} onCompositionEnd={handleEnd} />',
  },
  debounceBad: `const [val, setVal] = useState('');
const debouncedSearch = useMemo(() => debounce(doSearch, 300), []);

const handleChange = (e) => {
  setVal(e.target.value);
  debouncedSearch(e.target.value);
  // 输入拼音 "zhuang" 时，中间的自然停顿会导致防抖到期触发，
  // 拼音碎片 "zhua" 仍会被送入业务逻辑，根本无法区分"合成中"与"已确定"
};`,
  isComposingBad: `const handleInput = (e) => {
  // 看似更简单：无需 Ref，直接读取事件属性
  if (e.nativeEvent.isComposing) return;

  doSearch(e.target.value);
  // 在 360安全浏览器、QQ浏览器、微信内置浏览器、UC浏览器等
  // 国产双核浏览器的兼容模式或旧版 Chromium 内核中，
  // isComposing 属性可能始终为 false 或根本不存在，导致锁完全失效
};`,
  naiveLockBad: `const isComposing = useRef(false);

const handleStart = () => { isComposing.current = true; };
const handleEnd = () => {
  isComposing.current = false;
  // ❌ 只解锁，没有主动补偿触发 doSearch
  //
  // 【Chromium / WebKit 时序】input → compositionend
  //   最后一个 input 到来时 isComposing 还是 true，被锁拦截。
  //   compositionend 触发后锁打开，但浏览器不会再补发一次 input。
  //   → 最后一个汉字永远无法触发搜索（必现丢失）
  //
  // 【Gecko (Firefox) 时序】compositionend → input
  //   compositionend 先解锁，随后的 input 正常触发 doSearch。
  //   → 恰好能工作，但这只是侥幸，不是设计。
  //
  // 【信创浏览器时序】完全不可预测
  //   统信 UOS、麒麟等国产系统浏览器基于老旧 Chromium 或定制 WebKit：
  //   · compositionend 根本不触发
  //   · 触发时 e.target.value 尚未更新
  //   · 触发多次，产生幽灵事件
  //   · 触发后不补发任何 input
  //   → 依赖"解锁后等 input"在信创环境下是致命的赌博。
};
const handleInput = (e) => {
  if (isComposing.current) return;
  doSearch(e.target.value);
  // 天真地假设所有浏览器在 compositionend 后都会补发 input
};

return (
  <input
    onCompositionStart={handleStart}
    onCompositionEnd={handleEnd}
    onInput={handleInput}
  />
);`,
};
