interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  /** 最大等待时间，超过该时间强制执行一次 */
  maxWait?: number;
}

interface DebouncedFunc<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
  pending: () => boolean;
}

/**
 * 完全版 debounce
 * 对齐 lodash 语义：
 * 1. 正确保存并透传 this 与 arguments
 * 2. 支持 maxWait，避免高频场景下长时间不执行
 * 3. 返回 debounced 函数，并提供 cancel / flush / pending API
 * 4. 函数返回最后一次实际调用 fn 的结果（若未调用则返回 undefined）
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options: DebounceOptions = {}
): DebouncedFunc<T> {
  const { leading = false, trailing = true, maxWait } = options;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let maxTimer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let result: ReturnType<T> | undefined;

  const invoke = (time: number) => {
    const args = lastArgs!;
    const thisArg = lastThis;

    lastArgs = null;
    lastThis = undefined;
    lastInvokeTime = time;
    result = fn.apply(thisArg, args);
    return result;
  };

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  };

  const trailingEdge = (time: number) => {
    if (timer) clearTimeout(timer);
    if (maxTimer) clearTimeout(maxTimer);
    timer = null;
    maxTimer = null;

    if (trailing && lastArgs) {
      return invoke(time);
    }

    lastArgs = null;
    lastThis = undefined;
    return result;
  };

  const debounced = function (this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timer === null) {
        lastInvokeTime = time;
      }

      if (maxWait !== undefined && maxTimer === null) {
        maxTimer = setTimeout(() => {
          if (timer) clearTimeout(timer);
          timer = null;
          maxTimer = null;
          trailingEdge(Date.now());
        }, maxWait);
      }

      if (leading && timer === null) {
        timer = setTimeout(() => {
          trailingEdge(Date.now());
        }, wait);
        return invoke(time);
      }
    }

    if (timer === null) {
      timer = setTimeout(() => {
        trailingEdge(Date.now());
      }, wait);
    }

    return result;
  } as DebouncedFunc<T>;

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    if (maxTimer) clearTimeout(maxTimer);
    lastInvokeTime = 0;
    lastCallTime = 0;
    lastArgs = null;
    lastThis = undefined;
    timer = null;
    maxTimer = null;
  };

  debounced.flush = () => {
    if (timer || maxTimer) {
      return trailingEdge(Date.now());
    }
    return result;
  };

  debounced.pending = () => timer !== null || maxTimer !== null;

  return debounced;
}

export default debounce;
