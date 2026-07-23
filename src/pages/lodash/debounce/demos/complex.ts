interface DebounceOptions {
  /** 是否在首次触发时立即执行 */
  leading?: boolean;
  /** 是否在最后一次触发后等待结束再执行 */
  trailing?: boolean;
}

/**
 * 复杂版 debounce
 * 在简单版基础上增加 leading / trailing 选项，覆盖高频业务场景。
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options: DebounceOptions = {}
) {
  const { leading = false, trailing = true } = options;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any;

  const invoke = () => {
    fn.apply(lastThis, lastArgs!);
    timer = null;
    lastArgs = null;
    lastThis = undefined;
  };

  return function (this: any, ...args: Parameters<T>) {
    const isLeading = leading && !timer;

    lastArgs = args;
    lastThis = this;

    if (timer) {
      clearTimeout(timer);
    }

    if (isLeading) {
      invoke();
    }

    if (trailing) {
      timer = setTimeout(invoke, wait);
    }
  };
}

export default debounce;
