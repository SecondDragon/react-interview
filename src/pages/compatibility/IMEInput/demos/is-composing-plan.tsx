import React from 'react';

const NativeIsComposingInput = () => {
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (!(e.nativeEvent as InputEvent).isComposing) {
      doSearch(e.currentTarget.value);
    }
  };

  return <input onInput={handleInput} />;
};
