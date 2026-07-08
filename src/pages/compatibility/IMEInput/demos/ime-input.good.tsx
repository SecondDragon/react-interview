import React, { useRef } from 'react';

const PerfectChineseInput = () => {
  const isComposing = useRef(false);
  const requestCount = useRef(0);
  const abortRef = useRef(new AbortController());

  const handleStart = () => { isComposing.current = true; };
  const handleEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposing.current = false;
    doSearch(e.currentTarget.value);
  };
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (isComposing.current) return;
    doSearch(e.currentTarget.value);
  };

  const doSearch = async (val: string) => {
    const currentId = ++requestCount.current;
    abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await api.search(val, { signal: abortRef.current.signal });
      if (currentId === requestCount.current) {
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
};
