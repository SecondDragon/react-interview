# qiankun 专题 — JS 沙箱设计文档

> 创建日期：2026-07-06
> 所属系统：react-interview（主应用）
> 文档类型：UI/知识体系页面设计
> 状态：待实现

## 1. 设计目标

在主应用（react-interview）的 `qiankun 专题` 下新增第六个菜单项 **"JS 沙箱"**。核心话题是 qiankun 的沙箱机制：为什么需要沙箱、三代沙箱的演进、实现原理、逃逸与防御。

本页面的目标：

- 用寓言故事引入沙箱的概念（已在 allegory-instructor 阶段完成），让读者先建立直观理解
- 讲清楚沙箱要解决的根本问题：多个子应用共享 `window` 时的全局变量冲突
- 对比三代沙箱（SnapshotSandbox / LegacySandbox / ProxySandbox）的实现差异和演进原因
- 深入 Proxy 拦截原理，用代码讲解 `get` / `set` / `has` 拦截器
- 讲清沙箱逃逸的常见方式和防御手段
- 保持与 `communication` 一致的 `content.mdx` 单文件结构

## 2. 页面范围与边界

### 2.1 在本次设计中完成

- 主应用路由注册：
  - 父级菜单已存在：`qiankun 专题`（`/dashboard/qiankun`）
  - 新增二级菜单：`JS 沙箱`（`/dashboard/qiankun/sandbox`）
- 页面组件目录：`src/pages/qiankun/sandbox/`
- 使用 `content.mdx` 单文件结构
- 内容覆盖：

| # | 内容 | 说明 |
|---|---|---|
| 一 | 寓言故事 | allegory-instructor 生成的老陈与客厅的故事 |
| 二 | 为什么需要沙箱 | 全局变量冲突、定时器泄漏、事件监听残留、DOM 残留 |
| 三 | 三代沙箱演进 | SnapshotSandbox → LegacySandbox → ProxySandbox |
| 四 | 实现原理 | Proxy 拦截 get/set/has、fakeWindow、sandboxRunning 标志位 |
| 五 | 沙箱逃逸与防御 | 已知逃逸路径与防御策略 |
| 六 | Live Demo | 全局变量污染演示器 |

### 2.2 明确不在本次范围

- 不讨论 CSS 沙箱（`experimentalStyleIsolation`），那是 CSS 隔离话题
- 不讨论 qiankun 的 `snapshot` vs `proxy` 配置参数之外的细节
- 不改动已有 5 个子菜单的现有内容

## 3. 文件结构

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
```

## 4. 路由注册

在主应用 [src/router/config.tsx](file:///d:/测试人工智能/前端面试/react-interview/src/router/config.tsx#L105) 的 `qiankun 专题` 菜单下新增子菜单：

```tsx
const QiankunSandboxPage = lazy(() => import('../pages/qiankun/sandbox/index'));

export const dashboardRoutes: RouteConfig[] = [
  // ...
  {
    path: '/dashboard/qiankun',
    children: [
      // ...
      {
        path: '/dashboard/qiankun/sandbox',
        label: 'JS 沙箱',
        element: <QiankunSandboxPage />,
      },
    ],
  },
];
```

## 5. 内容设计

### 5.1 一、寓言故事（.mdx 正文）

使用 allegory-instructor 生成的故事内容直接写在 `.mdx` 中。包括三个子章节：隐喻故事、真相揭晓、概念对齐表格。

### 5.2 二、为什么需要沙箱

**三个核心问题：**

1. **全局变量冲突**：子应用 A 设置 `window.__user = 'Alice'`，子应用 B 也设置 `window.__user = 'Bob'`，B unmount 后残留错误值。
2. **定时器/事件泄漏**：子应用 mount 时开了 `setInterval` 或绑了 `addEventListener`，unmount 时没清理，继续运行影响性能。
3. **DOM 残留**：子应用的 DOM 节点未随 unmount 清理，留在主应用中。

**代码示例：**
- `demos/sandbox-collision.ts` — 两个子应用先后在 `window` 上写同名变量造成冲突

### 5.3 三、三代沙箱演进

#### 3.1 SnapshotSandbox（快照沙箱）

**原理：** mount 前遍历所有 `window` 属性拍照，unmount 时逐项恢复。

**缺点：**
- 遍历数百个 window 属性性能差
- 运行期间直接在真实 window 上修改，不安全

**代码示例：**
- `demos/snapshot-sandbox.ts` — 快照沙箱简化实现

#### 3.2 LegacySandbox（旧版代理沙箱）

**原理：** Proxy 拦截 `window` 的 `set` 操作，记录改动。不再遍历全部属性。

**优点：**
- 只记录真正变动的属性，性能提升

**缺点：**
- get 直接穿透到真实 window，无法拦截读取

#### 3.3 ProxySandbox（当前默认）

**原理：** 完整的 Proxy 拦截 `get` / `set` / `has`，fakeWindow 不继承 `Object.prototype`。

**关键点：**
- `fakeWindow = Object.create(null)` 无原型链
- `get` 拦截器返回 fakeWindow 中的值或回退到真实 window
- `set` 拦截器只写入 fakeWindow
- `sandboxRunning` 标志位控制激活/停用
- unmount 时清空 fakeWindow，真实 window 完全未被污染

**代码示例：**
- `demos/proxy-sandbox.ts` — ProxySandbox 简化实现

### 5.4 四、沙箱逃逸与防御

**常见逃逸路径：**

| 逃逸方式 | 代码 | 防御策略 |
|---|---|---|
| 原型链污染 | `Object.prototype.xxx = 'escape'` | fakeWindow 无原型链可部分防御 |
| document.defaultView | `const realWin = document.defaultView` | 拦截 `document` 属性的 get |
| 创建 iframe | `iframe.contentWindow` | 很难防御，需要劫持 `createElement` |
| 闭包中存储的 window 引用 | 子应用在 mount 前就缓存了 window | 无法防御，需要子应用配合 |

**代码示例：**
- `demos/sandbox-escape.ts` — 演示逃逸方式

### 5.5 五、Live Demo：全局变量污染演示器

**交互设计：**

1. **无沙箱模式**：两个"模拟子应用"先后运行，后一个覆盖前一个的全局变量，切换回来时出现错误。
2. **有沙箱模式**：同样的操作，但通过 Proxy 沙箱隔离，切换时变量自动恢复。
3. **切换时间线**：记录每次操作前后 `window.xxx` 的值变化。

## 6. 数据与代码分离

- `data.ts` 只存放结构化数据：对比表格、三代沙箱对比表、逃逸方式表格
- 所有 prose text 写在 `.mdx` 中
- 所有代码示例从 `demos/` 通过 `?raw` 导入

## 7. 验收标准

- [ ] 主应用菜单 `qiankun 专题` 下新增 `JS 沙箱`
- [ ] 页面包含寓言故事 + 概念对齐表格
- [ ] 页面包含三代沙箱的演进说明和代码示例
- [ ] 页面包含沙箱逃逸与防御的完整表格
- [ ] Live Demo 模拟无沙箱/有沙箱的全局变量行为差异
- [ ] 通过 `npm run dev` 验证
