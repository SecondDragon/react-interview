import React, { useState, useMemo } from 'react';

const DebounceBad = () => {
  const [val, setVal] = useState('');
  const debouncedSearch = useMemo(() => debounce(doSearch, 300), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value);
    debouncedSearch(e.target.value);
    // 输入拼音 "zhuang" 时，中间的自然停顿会导致防抖到期触发，
    // 拼音碎片 "zhua" 仍会被送入业务逻辑，根本无法区分"合成中"与"已确定"
  };

  return <input value={val} onChange={handleChange} />;
};
