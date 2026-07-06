# qiankun 专题 — loadMicroApp 设计文档

> 创建日期：2026-07-06
> 所属系统：react-interview（主应用）
> 文档类型：UI/知识体系页面设计
> 状态：待实现

## 1. 设计目标

在主应用（react-interview）的 `qiankun 专题` 下新增第七个菜单项 **"loadMicroApp"**。核心话题是 qiankun 的手动加载 API `loadMicroApp`：使用场景、与 `registerMicroApps` 的区别、完整用法。

本页面的目标：

- 讲清楚 `loadMicroApp` 和 `registerMicroApps` 的根本区别：路由驱动 vs 手动控制
- 覆盖 **6 个核心使用场景**，每个场景有独立的小节和代码示例
- 完整覆盖 API：`loadMicroApp`、`app.update`、`app.unmount`、`app.mount`、`app.getStatus`
- 对比生命周期状态图（`NOT_LOADED` → `LOADING_SOURCE_CODE` → `NOT_BOOTSTRAPPED` → ...）
- 保持与 `communication` 一致的 `content.mdx` 单文件结构

## 2. 页面范围与边界

### 2.1 在本次设计中完成

- 主应用路由注册：
  - 父级菜单已存在：`qiankun 专题`（`/dashboard/qiankun`）
  - 新增二级菜单：`loadMicroApp`（`/dashboard/qiankun/load-micro-app`）
- 页面组件目录：`src/pages/qiankun/load-micro-app/`
- 使用 `content.mdx` 单文件结构
- 内容覆盖：

| # | 内容 | 说明 |
|---|---|---|
| 一 | 引言 | 什么时候需要手动加载而不是路由驱动？ |
| 二 | 与 registerMicroApps 的区别 | 对比表格 + 代码对比 |
| 三 | 使用场景 × 6 | 每个场景独立小节 + CodeDiff |
| 四 | 生命周期状态 | 状态图 + 状态枚举说明 |
| 五 | API 参考 | 完整 API 表格 + 代码示例 |
| 六 | Live Demo | 手动加载子应用演示器 |

### 2.2 明确不在本次范围

- 不重复讲解 `registerMicroApps` 的基础用法（已在"乾坤基础"中覆盖）
- 不讨论子应用本身的生命周期（bootstrap/mount/unmount），已在"乾坤基础"中覆盖
- 不改动已有 6 个子菜单的现有内容

## 3. 文件结构

```text
src/pages/qiankun/load-micro-app/
  index.tsx
  content.mdx
  data.ts
  LiveDemo.tsx
  demos/
    basic-load.tsx              # 基本加载
    update-props.tsx            # 更新 props
    unmount-micro-app.tsx       # 卸载
    inline-mounted-vs-route.tsx # 内嵌 vs 路由对比
    load-in-modal.tsx           # 弹窗中加载
    parallel-instances.tsx      # 并行多实例
    status-check.tsx            # 状态检查
```

## 4. 路由注册

```tsx
const QiankunLoadMicroAppPage = lazy(() => import('../pages/qiankun/load-micro-app/index'));

// 在 qiankun 专题的 children 中：
{
  path: '/dashboard/qiankun/load-micro-app',
  label: 'loadMicroApp',
  element: <QiankunLoadMicroAppPage />,
},
```

## 5. 内容设计

### 5.1 一、引言

**核心问题：** 你已经学会了 `registerMicroApps` 按路由挂载子应用，但有些场景不是路由驱动的。

**典型场景：**
- 在主应用的某个**弹窗/抽屉**中临时加载一个工具型子应用（如 SQL 查询器、图片编辑器）
- 在**同一个页面内同时挂载多个子应用实例**（如左右并排对比两个数据面板）
- 需要**精细控制子应用的挂载/卸载时机**，而不是依赖路由切换

`loadMicroApp` 就是为这些场景设计的。它直接返回一个 `app` 实例，你可以手动调用 `mount`、`unmount`、`update`。

### 5.2 二、与 registerMicroApps 的区别

| 对比项 | registerMicroApps | loadMicroApp |
|---|---|---|
| 触发方式 | 路由变化自动触发 | 手动调用 |
| 粒度 | 全局注册，所有路由匹配自动激活 | 单实例精细控制 |
| props 更新 | 子应用重新 mount 才能更新 | 调用 `app.update({ props })` 动态更新 |
| 多实例 | 一个子应用只能由一个容器 | 同一子应用可以在不同容器同时挂载 |
| 卸载时机 | 路由离开时自动卸载 | 手动调用 `app.unmount()` |
| 返回类型 | void | `LoadableApp` 实例（包含 mount/unmount/update 等方法） |

**代码示例：**
- `demos/inline-mounted-vs-route.tsx` — 内嵌 vs 路由驱动的代码对比

### 5.3 三、使用场景（6 个）

#### 场景 1：基本加载

使用 `loadMicroApp` 替代 `registerMicroApps` 加载一个子应用到指定容器。

```tsx
import { loadMicroApp } from 'qiankun';

const app = loadMicroApp({
  name: 'sql-editor',
  entry: '//localhost:8001',
  container: '#preview-area',
  props: {
    token: 'xxx',
    mode: 'readonly',
  },
});

// 需要卸载时
app.unmount();
```

**代码示例：**
- `demos/basic-load.tsx`

#### 场景 2：弹窗/抽屉中加载

最常见的场景：用户点击"高级查询"按钮，弹出一个 Modal，里面加载子应用作为富内容。

```tsx
function AdvancedQueryModal({ visible, onClose }) {
  const appRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (visible && !appRef.current) {
      appRef.current = loadMicroApp({
        name: 'query-tool',
        entry: '//localhost:8002',
        container: containerRef.current,
        props: { onClose },
      });
    }
    if (!visible && appRef.current) {
      appRef.current.unmount();
      appRef.current = null;
    }
  }, [visible]);

  return (
    <Modal open={visible} title="高级查询" onCancel={onClose}>
      <div ref={containerRef} />
    </Modal>
  );
}
```

**代码示例：**
- `demos/load-in-modal.tsx`

#### 场景 3：动态更新 props

子应用 mount 后，外部状态变化需要通知子应用时，使用 `app.update`。

```tsx
const app = loadMicroApp({
  name: 'dashboard',
  entry: '//localhost:8003',
  container: '#dashboard-area',
  props: { theme: 'light', filters: {} },
});

// 用户切换主题
function onThemeChange(theme) {
  app.update({ props: { theme } });
}

// 用户修改筛选条件
function onFilterChange(filters) {
  app.update({ props: { filters } });
}
```

**代码示例：**
- `demos/update-props.tsx`

#### 场景 4：手动卸载

`app.unmount()` 提供比路由切换更精细的卸载控制。

```tsx
const app = loadMicroApp({ ... });

// 条件卸载：在特定时机才卸载
function onTabChange(activeKey) {
  if (activeKey !== 'tools') {
    app.unmount();  // 离开工具标签时卸载
  } else {
    app.mount();    // 切回工具标签时重新挂载
  }
}
```

**代码示例：**
- `demos/unmount-micro-app.tsx`

#### 场景 5：并行多实例（Multi-Instance）

qiankun 最强大的特性之一：同一个子应用可以在不同容器中同时存在多个实例。

```tsx
const instances = [];

function spawnApp(containerId) {
  const app = loadMicroApp({
    name: 'data-panel',
    entry: '//localhost:8004',
    container: `#${containerId}`,
    props: { panelId: containerId },
  });
  instances.push(app);
}

// 同时挂载 3 个 data-panel 实例
spawnApp('panel-1');
spawnApp('panel-2');
spawnApp('panel-3');

// 卸载所有
instances.forEach(app => app.unmount());
```

**代码示例：**
- `demos/parallel-instances.tsx`

#### 场景 6：状态检查

`loadMicroApp` 返回的 app 实例有 `getStatus()` 方法，返回子应用当前生命周期状态。

```tsx
const app = loadMicroApp({ ... });
console.log(app.getStatus());  // "LOADING_SOURCE_CODE"

app.mount().then(() => {
  console.log(app.getStatus());  // "MOUNTED"
});

app.unmount().then(() => {
  console.log(app.getStatus());  // "NOT_MOUNTED"
});
```

**代码示例：**
- `demos/status-check.tsx`

### 5.4 四、生命周期状态

qiankun 子应用的状态流转：

```
NOT_LOADED → LOADING_SOURCE_CODE → NOT_BOOTSTRAPPED → BOOTSTRAPPING
    → NOT_MOUNTED → MOUNTING → MOUNTED → UNMOUNTING → NOT_MOUNTED
``` 

**状态枚举说明：**

| 状态 | 含义 |
|---|---|
| `NOT_LOADED` | 子应用尚未加载入口文件 |
| `LOADING_SOURCE_CODE` | 正在加载子应用的 JS entry |
| `NOT_BOOTSTRAPPED` | 入口已加载，但尚未执行 bootstrap |
| `BOOTSTRAPPING` | 正在执行子应用的 bootstrap 回调 |
| `NOT_MOUNTED` | 子应用已准备好，等待 mount |
| `MOUNTING` | 正在执行子应用的 mount 回调 |
| `MOUNTED` | 子应用已挂载并正常运行 |
| `UNMOUNTING` | 正在执行子应用的 unmount 回调 |
| `UNLOADING` | 正在卸载子应用的入口资源（仅 loadMicroApp 支持） |
| `SKIP_BECAUSE_BROKEN` | 子应用出错，标记为不可用 |
| `LOAD_ERROR` | 加载入口文件时出错 |

### 5.5 五、API 参考

```tsx
interface LoadableApp {
  name: string;           // 子应用名称
  entry: string;          // 入口 URL
  container: string | HTMLElement;  // 挂载容器
  props?: object;         // 传入子应用的 props
}

interface LoadableAppInstance {
  mount(): Promise<void>;          // 手动挂载
  unmount(): Promise<void>;        // 手动卸载
  update(opts: { props: object }): Promise<void>;  // 更新 props
  getStatus(): string;             // 获取当前状态
}
```

### 5.6 六、Live Demo：手动加载演示器

**交互设计：**

1. **加载面板**：点击按钮加载一个模拟子应用到指定容器
2. **props 更新**：在输入框中修改要传给子应用的 props（如 theme / token），点击更新
3. **多实例**：可以点击多次加载同一子应用的不同实例到不同容器
4. **状态监控**：实时显示当前子应用的生命周期状态
5. **卸载控制**：支持单个卸载和全部卸载

## 6. 数据与代码分离

- `data.ts` 只存放结构化数据：对比表格、状态枚举表
- 所有 prose text 写在 `.mdx` 中
- 所有代码示例从 `demos/` 通过 `?raw` 导入

## 7. 验收标准

- [ ] 主应用菜单 `qiankun 专题` 下新增 `loadMicroApp`
- [ ] 页面包含引言 + 对比表格 + 6 个使用场景 + 状态图 + API 参考 + Live Demo
- [ ] 6 个场景每个都有 CodeDiff 代码示例
- [ ] Live Demo 展示加载/更新 props/多实例/卸载/状态监控
- [ ] 通过 `npm run dev` 验证
