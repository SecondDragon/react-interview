// ✅ 快照沙箱（SnapshotSandbox）简化实现
// 原理：mount 前拍照，unmount 时逐项恢复

class SnapshotSandbox {
  private windowSnapshot: Record<string, any> = {};
  private modifiedProps: Record<string, any> = {};

  active() {
    // 拍照：遍历 window 所有属性，记录当前值
    for (const key in window) {
      if (window.hasOwnProperty(key)) {
        this.windowSnapshot[key] = (window as any)[key];
      }
    }
  }

  inactive() {
    // 恢复：遍历 window，对比快照
    for (const key in window) {
      if (window.hasOwnProperty(key)) {
        const snapshotValue = this.windowSnapshot[key];
        const currentValue = (window as any)[key];

        if (snapshotValue !== currentValue) {
          // 记录子应用修改了什么（可选）
          this.modifiedProps[key] = currentValue;
          // 恢复为快照值
          (window as any)[key] = snapshotValue;
        }
      }
    }
  }
}

// 使用示例
const snapSandbox = new SnapshotSandbox();

snapSandbox.active();
(window as any).__test = 'app-value';  // 子应用设置的全局变量
console.log('运行时 window.__test:', (window as any).__test);  // 'app-value'

snapSandbox.inactive();
console.log('恢复后 window.__test:', (window as any).__test);  // undefined

// ❌ 缺点：
// 1. 遍历数百个 window 属性，mount/unmount 都很慢
// 2. 运行期间直接修改真实 window，不安全
