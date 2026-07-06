# qiankun 专题 — JS 沙箱 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在主应用 react-interview 的 `qiankun 专题` 下新增 `JS 沙箱` 知识体系页面，覆盖沙箱的必要性、三代演进、实现原理和逃逸防御。

**Architecture:** 采用 `content.mdx` 单文件结构，prose text 写在 `.mdx` 中，结构化数据放 `data.ts`，JSX 逻辑放组件，代码示例从 `demos/` 通过 `?raw` 导入。路由注册在所有组件创建完成后最后进行。

**Tech Stack:** React 18 + TypeScript + Vite + Ant Design + `react-diff-viewer-continued`（CodeDiff 组件）。

---

## 文件结构

```text
src/pages/qiankun/sandbox/
  index.tsx
  content.mdx
  data.ts
  LiveDemo.tsx
  demos/
    sandbox-collision.ts       # 全局变量冲突演示
    snapshot-sandbox.ts        # 快照沙箱实现
    proxy-sandbox.ts           # 代理沙箱实现
    sandbox-escape.ts          # 沙箱逃逸演示
src/router/config.tsx          # 最后一步注册路由
```

---

## Task 1: 创建目录结构与数据文件

**Files:**
- Create: `src/pages/qiankun/sandbox/data.ts`
- Create directories: `src/pages/qiankun/sandbox/demos`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p src/pages/qiankun/sandbox/demos
```

- [ ] **Step 2: 编写 data.ts**

```typescript
export const sandboxComparisonTable = {
  columns: [
    { title: '特性', dataIndex: 'feature', key: 'feature' },
    { title: 'SnapshotSandbox', dataIndex: 'snapshot', key: 'snapshot' },
    { title: 'LegacySandbox', dataIndex: 'legacy', key: 'legacy' },
    { title: 'ProxySandbox', dataIndex: 'proxy', key: 'proxy' },
  ],
  dataSource: [
    { key: '1', feature: '技术', snapshot: '遍历 window 属性', legacy: 'Proxy 拦截 set', proxy: 'Proxy 拦截 get/set/has' },
    { key: '2', feature: '性能', snapshot: '差（遍历所有属性）', legacy: '好（只记录变动的）', proxy: '好' },
    { key: '3', feature: '安全性', snapshot: '低（运行期直接改 window）', legacy: '中（set 拦截但 get 穿透）', proxy: '高（get/set 均拦截）' },
    { key: '4', feature: '浏览器', snapshot: '全部兼容', legacy: 'Proxy（Chrome 49+）', proxy: 'Proxy（Chrome 49+）' },
    { key: '5', feature: 'qiankun 默认', snapshot: 'IE11 降级', legacy: '—', proxy: '现代浏览器默认' },
  ],
};

export const escapeTable = {
  columns: [
    { title: '逃逸方式', dataIndex: 'method', key: 'method' },
    { title: '代码示例', dataIndex: 'code', key: 'code' },
    { title: '防御策略', dataIndex: 'defense', key: 'defense' },
  ],
  dataSource: [
    { key: '1', method: '原型链污染', code: "Object.prototype.xxx = 'escape'", defense: 'fakeWindow = Object.create(null) 无原型链，可部分防御' },
    { key: '2', method: 'document.defaultView', code: 'const realWin = document.defaultView', defense: '拦截 getter 中 document 属性的访问' },
    { key: '3', method: '创建 iframe', code: 'const iframe = document.createElement("iframe"); iframe.contentWindow', defense: '较难防御，需劫持 createElement' },
    { key: '4', method: '闭包缓存 window', code: '子应用 mount 前就缓存了 window 引用', defense: '无法防御，需子应用配合' },
  ],
};
```

- [ ] **Step 3: 验证 TypeScript**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/sandbox/data.ts`
Expected: 通过。

- [ ] **Step 4: Commit**

```bash
git add src/pages/qiankun/sandbox/data.ts
git commit -m "feat(qiankun-sandbox): add data.ts"
```

---

## Task 2: 创建 demo 文件

**Files:**
- Create: `src/pages/qiankun/sandbox/demos/sandbox-collision.ts`
- Create: `src/pages/qiankun/sandbox/demos/snapshot-sandbox.ts`
- Create: `src/pages/qiankun/sandbox/demos/proxy-sandbox.ts`
- Create: `src/pages/qiankun/sandbox/demos/sandbox-escape.ts`

- [ ] **Step 1: sandbox-collision.ts**

```typescript
// ❌ 全局变量冲突演示
// 两个子应用先后在 window 上设置同名变量

// 子应用 A
function mountAppA() {
  window.__token = 'token-from-app-a';
  window.__user = { name: 'Alice', role: 'admin' };
  window.__config = { baseUrl: '/api/v1' };
  console.log('App A mounted, window.__user:', window.__user);
}

// 子应用 A unmount
function unmountAppA() {
  // (假设)子应用没有清理全局变量
  // 这些值会一直留在 window 上
}

// 子应用 B
function mountAppB() {
  // 子应用 B 没有设置 __user，它有自己的 __currentUser
  window.__token = 'token-from-app-b';
  window.__currentUser = { name: 'Bob', role: 'viewer' };
  console.log('App B mounted, window.__token:', window.__token);
}

function unmountAppB() {
  // 子应用 B 没有清理 window.__token 和 window.__currentUser
}

// 流程：
mountAppA();
// window.__token = 'token-from-app-a'
// window.__user = { name: 'Alice', role: 'admin' }

unmountAppA();
// 没有清理，__token 和 __user 仍然留在 window 上

mountAppB();
// window.__token 被覆盖为 'token-from-app-b'
// window.__user 仍然是 A 的 { name: 'Alice', role: 'admin' }

// 问题：如果 A 重新 mount，它发现 window.__user 还在
// 但 window.__token 被 B 覆盖了
// A 的内部状态会出现混乱

// ❌ 没有沙箱的话，全局变量冲突是必然的
```

- [ ] **Step 2: snapshot-sandbox.ts**

```typescript
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
const sandbox = new SnapshotSandbox();

sandbox.active();
(window as any).__test = 'app-value';  // 子应用设置的全局变量
console.log('运行时 window.__test:', (window as any).__test);  // 'app-value'

sandbox.inactive();
console.log('恢复后 window.__test:', (window as any).__test);  // undefined

// ❌ 缺点：
// 1. 遍历数百个 window 属性，mount/unmount 都很慢
// 2. 运行期间直接修改真实 window，不安全
```

- [ ] **Step 3: proxy-sandbox.ts**

```typescript
// ✅ ProxySandbox 简化实现
// 原理：Proxy 拦截 get/set，fakeWindow 不继承原型链

class ProxySandbox {
  private fakeWindow: Record<string, any>;
  private proxy: Window;
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
const sandbox = new ProxySandbox();
const proxyWindow = sandbox.getProxy() as any;

sandbox.active();
proxyWindow.__test = 'app-value';
console.log('沙箱内 window.__test:', proxyWindow.__test);  // 'app-value'
console.log('真实 window.__test:', (window as any).__test);  // undefined（真实 window 没被污染）

sandbox.inactive();
console.log('停用后 window.__test:', proxyWindow.__test);  // undefined（fakeWindow 被清空）

// ✅ 优点：
// 1. 不遍历 window 属性，性能好
// 2. 运行时改动只影响 fakeWindow，真实 window 完全未污染
// 3. unmount 时只需清空 fakeWindow，无需逐项恢复
```

- [ ] **Step 4: sandbox-escape.ts**

```typescript
// ❌ 沙箱逃逸演示
// 展示子应用如何绕过 Proxy 拦截而直接操作真实 window

import { ProxySandbox } from './proxy-sandbox';

const sandbox = new ProxySandbox();
const proxyWindow = sandbox.getProxy() as any;

sandbox.active();

// ===== 方式 1：原型链污染 =====
// Proxy 的 fakeWindow 是 Object.create(null)，没有原型链
// 但子应用仍然可以通过 Object.prototype 污染全局
Object.prototype.__polluted = 'yes';
console.log('Object.prototype 被污染:', ({} as any).__polluted);  // 'yes'

// ===== 方式 2：document.defaultView =====
// document.defaultView 返回的是真实 window
const realWindow = (proxyWindow.document as any).defaultView;
realWindow.__escaped = true;
console.log('通过 document.defaultView 逃逸:', (window as any).__escaped);  // true

// ===== 方式 3：创建新的 iframe =====
// 新 iframe 的 contentWindow 不受沙箱控制
// const iframe = document.createElement('iframe');
// document.body.appendChild(iframe);
// const iframeWindow = iframe.contentWindow;
// iframeWindow.__escaped = true;

// ===== 方式 4：闭包缓存 window 引用 =====
// 子应用在 mount 前就缓存了 window
// const cachedWindow = window;
// cachedWindow.__escaped = true;

sandbox.inactive();

// 总结：
// ProxySandbox 能拦截 window.xxx 的读写，
// 但不能拦截 Object.prototype、document.defaultView、
// iframe.contentWindow 等已知逃逸路径。
// qiankun 对已知路径做了针对性防御，
// 但理论上不可能 100% 拦截所有逃逸。
```

- [ ] **Step 5: 验证**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/sandbox/demos/sandbox-collision.ts src/pages/qiankun/sandbox/demos/snapshot-sandbox.ts src/pages/qiankun/sandbox/demos/proxy-sandbox.ts src/pages/qiankun/sandbox/demos/sandbox-escape.ts`
Expected: 通过。

- [ ] **Step 6: Commit**

```bash
git add src/pages/qiankun/sandbox/demos/
git commit -m "feat(qiankun-sandbox): add demo files"
```

---

## Task 3: 创建 LiveDemo 组件

**Files:**
- Create: `src/pages/qiankun/sandbox/LiveDemo.tsx`

- [ ] **Step 1: 编写 LiveDemo.tsx**

```tsx
import React, { useState, useRef, useCallback } from 'react';
import { Card, Space, Typography, Tag, Button, Divider, Alert } from 'antd';

interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

const LiveDemo: React.FC = () => {
  const [currentApp, setCurrentApp] = useState<'none' | 'appA' | 'appB'>('none');
  const [sandboxEnabled, setSandboxEnabled] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [windowState, setWindowState] = useState<Record<string, any>>({});
  const fakeWindowRef = useRef<Record<string, any>>({});
  const logId = useRef(0);

  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    logId.current += 1;
    setLogs((prev) => [{ id: logId.current, message, type }, ...prev]);
  }, []);

  const mountAppA = useCallback(() => {
    if (sandboxEnabled) {
      fakeWindowRef.current.__token = 'token-from-app-a';
      fakeWindowRef.current.__user = { name: 'Alice', role: 'admin' };
    } else {
      (window as any).__token = 'token-from-app-a';
      (window as any).__user = { name: 'Alice', role: 'admin' };
    }
    setCurrentApp('appA');
    addLog('App A mount: 设置 __token, __user', 'info');
    syncWindowState(sandboxEnabled);
  }, [sandboxEnabled, addLog]);

  const mountAppB = useCallback(() => {
    if (sandboxEnabled) {
      fakeWindowRef.current.__token = 'token-from-app-b';
      fakeWindowRef.current.__currentUser = { name: 'Bob', role: 'viewer' };
    } else {
      (window as any).__token = 'token-from-app-b';
      (window as any).__currentUser = { name: 'Bob', role: 'viewer' };
    }
    setCurrentApp('appB');
    addLog('App B mount: 覆盖 __token, 设置 __currentUser', 'info');
    syncWindowState(sandboxEnabled);
  }, [sandboxEnabled, addLog]);

  const unmountApp = useCallback(() => {
    if (sandboxEnabled) {
      // 沙箱模式下，清理 fakeWindow
      delete fakeWindowRef.current.__token;
      delete fakeWindowRef.current.__user;
      delete fakeWindowRef.current.__currentUser;
      addLog('unmount: 清空 fakeWindow（真实 window 从未被污染）', 'success');
    } else {
      // 非沙箱模式下，变量仍然残留
      addLog('unmount: 变量仍然留在 window 上', 'error');
    }
    setCurrentApp('none');
    syncWindowState(sandboxEnabled);
  }, [sandboxEnabled, addLog]);

  const syncWindowState = (sandbox: boolean) => {
    const state: Record<string, any> = {};
    if (sandbox) {
      if (fakeWindowRef.current.__token) state.__token = fakeWindowRef.current.__token;
      if (fakeWindowRef.current.__user) state.__user = fakeWindowRef.current.__user;
      if (fakeWindowRef.current.__currentUser) state.__currentUser = fakeWindowRef.current.__currentUser;
    } else {
      if ((window as any).__token) state.__token = (window as any).__token;
      if ((window as any).__user) state.__user = (window as any).__user;
      if ((window as any).__currentUser) state.__currentUser = (window as any).__currentUser;
    }
    setWindowState(state);
  };

  const clearAll = useCallback(() => {
    delete (window as any).__token;
    delete (window as any).__user;
    delete (window as any).__currentUser;
    fakeWindowRef.current = {};
    setCurrentApp('none');
    setWindowState({});
    setLogs([]);
  }, []);

  return (
    <Card title="全局变量污染演示器">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 沙箱开关 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <strong>沙箱模式：</strong>
            <Tag color={sandboxEnabled ? 'green' : 'red'}>{sandboxEnabled ? '已启用' : '已禁用'}</Tag>
          </span>
          <Button onClick={() => setSandboxEnabled(!sandboxEnabled)}>
            {sandboxEnabled ? '禁用沙箱' : '启用沙箱'}
          </Button>
        </div>

        {/* 操作按钮 */}
        <Space>
          <Button type="primary" onClick={mountAppA} disabled={currentApp === 'appA'}>挂载 App A</Button>
          <Button type="primary" onClick={mountAppB} disabled={currentApp === 'appB'}>挂载 App B</Button>
          <Button onClick={unmountApp} disabled={currentApp === 'none'} danger>卸载当前应用</Button>
          <Button onClick={clearAll}>重置</Button>
        </Space>

        {/* 当前全局变量状态 */}
        <Card size="small" title="当前 window 全局变量">
          <pre style={{ margin: 0, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
            {JSON.stringify(windowState, null, 2) || '(无)'}
          </pre>
          {!sandboxEnabled && currentApp === 'none' && Object.keys(windowState).length > 0 && (
            <Alert type="error" message="无沙箱模式下，子应用卸载后变量仍然残留！" showIcon style={{ marginTop: 8 }} />
          )}
          {sandboxEnabled && currentApp === 'none' && (
            <Alert type="success" message="沙箱模式下，子应用卸载后变量已自动清理" showIcon style={{ marginTop: 8 }} />
          )}
        </Card>

        {/* 操作日志 */}
        <Card size="small" title="操作日志">
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            {logs.length === 0 ? (
              <Typography.Text type="secondary">暂无日志，请操作按钮触发</Typography.Text>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
                  <Tag color={log.type === 'success' ? 'green' : log.type === 'error' ? 'red' : 'blue'}>{log.type}</Tag>
                  {log.message}
                </div>
              ))
            )}
          </div>
        </Card>
      </Space>
    </Card>
  );
};

export default LiveDemo;
```

- [ ] **Step 2: 验证 TypeScript**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/sandbox/LiveDemo.tsx`
Expected: 通过。

- [ ] **Step 3: Commit**

```bash
git add src/pages/qiankun/sandbox/LiveDemo.tsx
git commit -m "feat(qiankun-sandbox): add live demo component"
```

---

## Task 4: 创建 content.mdx

**Files:**
- Create: `src/pages/qiankun/sandbox/content.mdx`

- [ ] **Step 1: 编写 content.mdx**

```mdx
import CodeDiff from '@/components/CodeDiff';
import LiveDemo from './LiveDemo';
import { Table, Typography, Divider, Alert } from 'antd';
import { sandboxComparisonTable, escapeTable } from './data';

import sandboxCollision from './demos/sandbox-collision.ts?raw';
import snapshotSandbox from './demos/snapshot-sandbox.ts?raw';
import proxySandbox from './demos/proxy-sandbox.ts?raw';
import sandboxEscape from './demos/sandbox-escape.ts?raw';

# qiankun 专题：JS 沙箱

<Typography.Paragraph type="secondary">从快照到 Proxy：qiankun 利用 JS 沙箱隔离子应用全局变量的演进史与实现原理</Typography.Paragraph>

---

## 一、寓言故事

### 老宅的客人

在那座拥有百年历史的老宅中，住着一位管家，名叫老陈。

老陈的职责很特别：每隔一段时间，就会有一位陌生人来到老宅，住上几天。他们走后，下一个人又会来。这些人互不相识，但每个人都会在老宅的客厅里留下自己的物品——有人摆了一个绿植，有人换了一幅画，有人把茶几向右挪了三寸。

**问题来了：** 当第一个人走后，第二个人进来时，客厅里应该是什么样子？

应该是一尘不染的，恢复到第一个人来之前的样子。否则，第二个人一进门，就会看到不属于自己的绿植、不想看到的画、乱放的茶几。最糟糕的是——他会以为这些东西本来就在那里，于是把自己的物品叠加上去，最终客厅面目全非。

起初老陈的做法很笨拙但很直接：**每次客人来之前，他把客厅的每一个角落——每一片地板、每一盆花、每一本书、每一个茶杯——全部拍照记录。** 客人离开后，他对照照片一件一件恢复。这叫**拍照法**。

拍照法的缺点是显而易见的：老宅有几十个房间，上千件物品，每次拍照和恢复都要花费大量时间。如果客人只动了一件东西，老陈也要把上千件物品全部对照一遍。更糟的是，拍照本身需要时间——在他拍照的过程中，如果另一位客人提前进来，就全乱套了。

后来，老陈换了一种思路。他在客厅门口装了一扇**玻璃门**，客人进来后，所有想动的物品都必须经过这扇玻璃门。老陈在玻璃门旁坐着，手里拿一本记录本：

- 客人说"我要在窗台放一盆花"，老陈就在记录本上写："窗台 → 花"。
- 实际上，花确实被放到了窗台——但老陈的笔同时记下了这一变动。
- 客人拉开窗帘 → 老陈记录："窗帘 → 拉开"。
- 客人把沙发向右移 → 老陈记录："沙发 → 右移 3 寸"。

**关键在这里：** 当客人询问"现在的客厅是什么样的"时，老陈会说："请稍等，我查一下我的记录本。"他把**原始客厅（从来没动过的那一份）**和**记录本上的改动**合并在一起告诉客人。而客人本身，觉得自己确实拥有整个客厅的使用权——他甚至不知道老陈的存在。

客人离开后，老陈只需要做一件事：**合上记录本，扔掉。** 客厅就自动回到了最初的样子。不管客人动了多少件东西，老陈的恢复工作永远是——扔一个本子。

这比拍照法快得多了。

但老陈很快发现了玻璃门的一个局限：如果客人不是通过玻璃门去动物品，而是**直接穿过墙壁伸手去抓**怎么办？或者，客人**飞起来**绕过玻璃门怎么办？

老陈想到了一个办法。他在客厅的外围加了一圈**透明软墙**，这堵墙平时几乎不存在——但当客人试图穿过它时，它就会挡住他。这样一来，客人的活动范围就完全被困在客厅内。

### 真相揭晓

老陈的故事，其实就是 qiankun **JS 沙箱（Sandbox）** 的演进史。

老宅的客厅 → **浏览器的全局作用域（window）**
客人 → **微应用（Micro App）**
老陈的拍照法 → **SnapshotSandbox（快照沙箱）**，第一代
老陈的玻璃门 → **ProxySandbox（代理沙箱）**，第二代
老陈的记录本 → **Proxy 拦截器**，记录所有 `window` 属性的增删改
合上记录本 → unmount 时丢弃 Proxy 上记录的所有变更
玻璃门的缝隙 → **沙箱逃逸**

### 概念对齐

| 故事元素 | 技术映射 |
|---|---|
| 老宅客厅 | 浏览器的 `window` 全局对象 |
| 客人 | 被 qiankun 加载的子应用 |
| 老陈的记录本 | Proxy 拦截器对 window 属性的增删改追踪 |
| 玻璃门 | window.proxy — 子应用访问的全局对象其实是 Proxy 实例 |
| 原始客厅（一直没动的那一份） | 真实的 window，主应用的全局作用域 |
| 客人看到的"客厅" | 子应用感知到的虚拟 window（Proxy 构造的沙箱） |
| 拍照法 | SnapshotSandbox — mount 时快照，unmount 时恢复 |
| 合上记录本丢弃 | unmount 时销毁 Proxy，子应用的所有修改灰飞烟灭 |
| 透明软墙 | 额外的安全加固 |
| 穿墙抓物 / 飞起来 | 沙箱逃逸 |

---

## 二、为什么需要沙箱

在微前端架构中，多个子应用在同一个浏览器上下文（同一 Document、同一 `window`）中交替运行。

每个子应用**认为自己拥有完整的 window 使用权**——但实际上 window 是共享的。

### 典型冲突场景

**全局变量冲突：** 子应用 A 设置 `window.__user`，子应用 B 也设置 `window.__user`，B unmount 后 A 残留着错误的值。

**定时器未清理：** 子应用开了 `setInterval`，unmount 时没清理，继续执行影响性能。

**事件监听泄漏：** `window.addEventListener` 绑定了子应用的回调，卸载后回调仍然被触发。

**DOM 残留：** 子应用的 DOM 节点未随 unmount 清理。

### 代码演示：无沙箱时的变量冲突

<CodeDiff oldValue={sandboxCollision} newValue={sandboxCollision} leftTitle="" rightTitle="❌ 无沙箱时全局变量冲突" type="error" hideDiffMarkers={true} />

---

## 三、三代沙箱演进

### 第一代：SnapshotSandbox（快照沙箱）

**原理：** mount 前遍历所有 `window` 属性拍照，unmount 时逐项恢复。

**缺点：**
- 遍历数百个 window 属性，性能差
- 运行期间直接在真实 window 上修改，不安全

<CodeDiff oldValue={snapshotSandbox} newValue={snapshotSandbox} leftTitle="" rightTitle="✅ SnapshotSandbox 简化实现" type="error" hideDiffMarkers={true} />

### 第三代：ProxySandbox（当前默认）

**原理：** Proxy 拦截 `get`、`set`、`has`，fakeWindow 不继承 `Object.prototype`。

**关键点：**
- `fakeWindow = Object.create(null)` — 无原型链，避免原型污染
- `get` 拦截器 — 优先返回 fakeWindow 中的值，回退到真实 window
- `set` 拦截器 — 只写入 fakeWindow，不碰真实 window
- `sandboxRunning` 标志位 — 控制激活/停用状态
- unmount 时清空 fakeWindow，真实 window 完全未被污染

<CodeDiff oldValue={proxySandbox} newValue={proxySandbox} leftTitle="" rightTitle="✅ ProxySandbox 简化实现" type="error" hideDiffMarkers={true} />

<Table dataSource={sandboxComparisonTable.dataSource} columns={sandboxComparisonTable.columns} pagination={false} size="small" bordered />

---

## 四、沙箱逃逸与防御

当子应用通过某些方式绕过了 Proxy 的拦截，直接操作了真实的 `window`，就发生了**沙箱逃逸（Sandbox Escape）**。

<Table dataSource={escapeTable.dataSource} columns={escapeTable.columns} pagination={false} size="small" bordered />

<CodeDiff oldValue={sandboxEscape} newValue={sandboxEscape} leftTitle="" rightTitle="❌ 沙箱逃逸演示" type="error" hideDiffMarkers={true} />

qiankun 对已知的逃逸路径做了针对性防御，但理论上不可能 100% 拦截所有逃逸。

---

## 五、Live Demo：全局变量污染演示器

在无沙箱和有沙箱两种模式下，分别挂载/卸载两个子应用，观察全局变量的残留情况和清理效果。

<LiveDemo />
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/qiankun/sandbox/content.mdx
git commit -m "feat(qiankun-sandbox): add content.mdx"
```

---

## Task 5: 创建页面入口 index.tsx

**Files:**
- Create: `src/pages/qiankun/sandbox/index.tsx`

- [ ] **Step 1: 编写 index.tsx**

```tsx
import Content from './content.mdx';
import React from 'react';

const QiankunSandboxPage: React.FC = () => {
  return <Content />;
};

export default QiankunSandboxPage;
```

- [ ] **Step 2: 验证 TypeScript**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/sandbox/index.tsx`
Expected: 通过。

- [ ] **Step 3: Commit**

```bash
git add src/pages/qiankun/sandbox/index.tsx
git commit -m "feat(qiankun-sandbox): add page entry component"
```

---

## Task 6: 注册路由

**Files:**
- Modify: `src/router/config.tsx`

- [ ] **Step 1: 添加懒加载导入**

在 `src/router/config.tsx` 的懒加载组件区域新增：

```tsx
const QiankunSandboxPage = lazy(() => import('../pages/qiankun/sandbox/index'));
```

- [ ] **Step 2: 添加 qiankun 专题子菜单**

在已有的 `qiankun 专题` 菜单的 `children` 中新增：

```tsx
      {
        path: '/dashboard/qiankun/sandbox',
        label: 'JS 沙箱',
        element: <QiankunSandboxPage />,
      },
```

- [ ] **Step 3: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 4: Commit**

```bash
git add src/router/config.tsx
git commit -m "feat(router): register qiankun sandbox route"
```

---

## Task 7: 验证

- [ ] **Step 1: 运行 lint**

Run: `npm run lint`
Expected: 无新增错误。

- [ ] **Step 2: 运行 dev 服务器**

Run: `npm run dev`（后台），等待 5 秒后检查输出。

- [ ] **Step 3: Commit（如有修复）**

```bash
git add -A
git commit -m "fix(qiankun-sandbox): fix lint and typecheck issues"
```

---

## 验收标准检查

- [ ] 主应用菜单 `qiankun 专题` 下新增 `JS 沙箱`
- [ ] 页面包含寓言故事 + 概念对齐表格
- [ ] 页面包含三代沙箱的演进说明和代码示例
- [ ] 页面包含沙箱逃逸与防御的完整表格
- [ ] Live Demo 模拟无沙箱/有沙箱的全局变量行为差异
- [ ] 通过 `npm run dev` 验证
