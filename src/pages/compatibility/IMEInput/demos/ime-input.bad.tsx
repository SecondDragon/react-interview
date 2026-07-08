import React, { useState } from 'react';

const IMEInputBad = () => {
  const [val, setVal] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value);
    doSearch(e.target.value);
    // ❌ 拼音输入过程中，每次 input 事件都会触发 doSearch，
    //    拼音碎片 "zhuang" 中的 "zh"、"hua" 等中间态
    //    都会进入业务逻辑，造成无效搜索
  };

  return <input value={val} onChange={handleChange} />;
};
