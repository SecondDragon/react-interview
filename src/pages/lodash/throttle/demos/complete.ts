interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

interface ThrottledFunc<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
}

/**
 * 完全版 throttle
 * 对齐 lodash 语义：
 * 1. 支持 leading / trailing 组合
 * 2. 提供 cancel / flush API
 * 3. 正确保存 this 与参数
 * 4. 返回上一次执行的结果
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options: ThrottleOptions = {}
): ThrottledFunc<T> {
  const { leading = true, trailing = true } = options;

  let lastTime = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any;
  let result: ReturnType<T> | undefined;

  const invoke = () => {
    result = fn.apply(lastThis, lastArgs!);
    lastTime = leading ? Date.now() : 0;
    lastArgs = null;
    lastThis = undefined;
    return result;
  };

  const throttled = function (this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();

    if (!lastTime && !leading) {
      lastTime = now;
    }

    const remaining = wait - (now - lastTime);

    lastArgs = args;
    lastThis = this;

    if (remaining <= 0 || remaining > wait) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (leading) {
        invoke();
      } else {
        lastTime = now;
      }
    } else if (!timer && trailing) {
      timer = setTimeout(() => {
        timer = null;
        invoke();
      }, remaining);
    }

    return result;
  } as ThrottledFunc<T>;

  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    lastTime = 0;
    lastArgs = null;
    lastThis = undefined;
    timer = null;
  };

  throttled.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      return invoke();
    }
    return result;
  };

  return throttled;
}

export default throttle;
