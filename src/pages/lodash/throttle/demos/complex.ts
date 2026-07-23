interface ThrottleOptions {
  /** 是否在节流周期开始时执行 */
  leading?: boolean;
  /** 是否在节流周期结束时执行 */
  trailing?: boolean;
}

/**
 * 复杂版 throttle
 * 在简单版基础上增加 leading / trailing 选项。
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options: ThrottleOptions = {}
) {
  const { leading = true, trailing = true } = options;

  let lastTime = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any;

  const invoke = () => {
    fn.apply(lastThis, lastArgs!);
    lastTime = leading ? Date.now() : 0;
    lastArgs = null;
    lastThis = undefined;
  };

  return function (this: any, ...args: Parameters<T>) {
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
  };
}

export default throttle;
