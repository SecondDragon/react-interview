import React, { useRef } from 'react';

const NaiveLockBad = () => {
  const isComposing = useRef(false);

  const handleStart = () => { isComposing.current = true; };
  const handleEnd = () => {
    isComposing.current = false;
    // ❌ 只解锁，没有主动补偿触发 doSearch
    //
    // 【Chromium / Blink / WebKit 时序】input → compositionend（主流实现）
    //   最后一个 input 到来时 isComposing 还是 true，被锁拦截。
    //   compositionend 触发后锁打开，但浏览器不会再补发一次 input。
    //   → 最后一个汉字永远无法触发搜索（必现丢失）
    //
    // 【Gecko (Firefox) 时序】compositionend → input（典型情况）
    //   compositionend 先解锁，随后的 input 正常触发 doSearch。
    //   → 恰好能工作，但这只是侥幸，不是设计。
    //
    // 【老旧 / 国产定制内核时序】完全不可预测
    //   统信 UOS、麒麟、微信 XWeb 等环境基于老旧 Chromium 或定制内核：
    //   · compositionend 根本不触发
    //   · 触发时 e.target.value 尚未更新
    //   · 触发多次，产生幽灵事件
    //   · 触发后不补发任何 input
    //   → 依赖"解锁后等 input"在这些环境下是致命的赌博。
  };
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (isComposing.current) return;
    doSearch(e.currentTarget.value);
  };

  return (
    <input
      onCompositionStart={handleStart}
      onCompositionEnd={handleEnd}
      onInput={handleInput}
    />
  );
};
