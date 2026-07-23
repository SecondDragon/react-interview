/**
 * 最简版 throttle
 * 核心机制：限制函数在 wait 毫秒内最多执行一次。
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, wait: number) {
  let lastTime = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastTime >= wait) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

export default throttle;
