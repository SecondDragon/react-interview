/**
 * 最简版 debounce
 * 核心机制：每次触发后，延迟 wait 毫秒执行；若等待期间再次触发，则重新计时。
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, wait: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, wait);
  };
}

export default debounce;
