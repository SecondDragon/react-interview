import React from 'react';

const IsComposingBad = () => {
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if ((e.nativeEvent as InputEvent).isComposing) return;

    doSearch(e.currentTarget.value);
    // 在 360安全浏览器、QQ浏览器、搜狗浏览器、微信内置浏览器、UC浏览器等
    // 国产双核浏览器的兼容模式或旧版 Chromium 内核中，
    // isComposing 属性可能始终为 false 或根本不存在，导致锁完全失效
    // 现代极速模式通常与 Chrome 一致，因此不能单独依赖它作为唯一兜底
  };

  return <input onInput={handleInput} />;
};
