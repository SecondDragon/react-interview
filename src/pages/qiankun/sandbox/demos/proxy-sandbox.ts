// ✅ ProxySandbox 简化实现
// 原理：Proxy 拦截 get/set，fakeWindow 不继承原型链

export class ProxySandbox {
  private fakeWindow: Record<string, any>;
  private proxy: any;
  public sandboxRunning = false;

  constructor() {
    // 创建无原型链的空对象，避免原型污染
    this.fakeWindow = Object.create(null);
    const rawWindow = window;

    this.proxy = new Proxy(this.fakeWindow, {
      get: (target, key: string) => {
        // 优先返回沙箱内自己设置的值
        if (target.hasOwnProperty(key)) {
          return target[key];
        }
        // 对于 document/location/top 等特殊属性，直接返回真实 window 的
        if (key === 'document' || key === 'location' || key === 'top' || key === 'parent') {
          return (rawWindow as any)[key];
        }
        // 回退到真实 window
        const value = (rawWindow as any)[key];
        return value;
      },
      set: (target, key: string, value: any) => {
        if (this.sandboxRunning) {
          target[key] = value;  // 只写入 fakeWindow
        }
        return true;
      },
      has: (target, key: string) => {
        return key in target || key in window;
      },
    });
  }

  active() {
    this.sandboxRunning = true;
  }

  inactive() {
    // 清空 fakeWindow 上所有子应用设置的值
    Object.keys(this.fakeWindow).forEach((key) => {
      delete this.fakeWindow[key];
    });
    this.sandboxRunning = false;
  }

  getProxy() {
    return this.proxy;
  }
}

// 使用示例
const proxySandbox = new ProxySandbox();
const proxyWindow = proxySandbox.getProxy() as any;

proxySandbox.active();
proxyWindow.__test = 'app-value';
console.log('沙箱内 window.__test:', proxyWindow.__test);  // 'app-value'
console.log('真实 window.__test:', (window as any).__test);  // undefined（真实 window 没被污染）

proxySandbox.inactive();
console.log('停用后 window.__test:', proxyWindow.__test);  // undefined（fakeWindow 被清空）

// ✅ 优点：
// 1. 不遍历 window 属性，性能好
// 2. 运行时改动只影响 fakeWindow，真实 window 完全未污染
// 3. unmount 时只需清空 fakeWindow，无需逐项恢复
