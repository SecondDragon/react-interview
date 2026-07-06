# qiankun 专题 — loadMicroApp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在主应用 react-interview 的 `qiankun 专题` 下新增 `loadMicroApp` 知识体系页面，覆盖手动加载 API 的使用场景、生命周期状态和完整用法。

**Architecture:** 采用 `content.mdx` 单文件结构，prose text 写在 `.mdx` 中，结构化数据放 `data.ts`，组件负责 CodeDiff/Tables 等 JSX 渲染，代码示例从 `demos/` 通过 `?raw` 导入。路由注册在所有组件创建完成后最后进行。

**Tech Stack:** React 18 + TypeScript + Vite + Ant Design + `react-diff-viewer-continued`（CodeDiff 组件）。

---

## 文件结构

```text
src/pages/qiankun/load-micro-app/
  index.tsx
  content.mdx
  data.ts
  LiveDemo.tsx
  demos/
    basic-load.tsx
    update-props.tsx
    unmount-micro-app.tsx
    inline-mounted-vs-route.tsx
    load-in-modal.tsx
    parallel-instances.tsx
    status-check.tsx
src/router/config.tsx     # 最后一步注册路由
```

---

## Task 1: 创建目录结构与数据文件

**Files:**
- Create: `src/pages/qiankun/load-micro-app/data.ts`
- Create directories: `src/pages/qiankun/load-micro-app/demos`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p src/pages/qiankun/load-micro-app/demos
```

- [ ] **Step 2: 编写 data.ts**

```typescript
export const comparisonTable = {
  columns: [
    { title: '对比项', dataIndex: 'item', key: 'item' },
    { title: 'registerMicroApps', dataIndex: 'register', key: 'register' },
    { title: 'loadMicroApp', dataIndex: 'load', key: 'load' },
  ],
  dataSource: [
    { key: '1', item: '触发方式', register: '路由变化自动触发', load: '手动调用' },
    { key: '2', item: '粒度', register: '全局注册，所有路由匹配自动激活', load: '单实例精细控制' },
    { key: '3', item: 'props 更新', register: '子应用重新 mount 才能更新', load: '调用 app.update({ props }) 动态更新' },
    { key: '4', item: '多实例', register: '一个子应用只能由一个容器', load: '同一子应用可在不同容器同时挂载' },
    { key: '5', item: '卸载时机', register: '路由离开时自动卸载', load: '手动调用 app.unmount()' },
    { key: '6', item: '返回类型', register: 'void', load: 'LoadableApp 实例' },
  ],
};

export const statusTable = {
  columns: [
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '含义', dataIndex: 'meaning', key: 'meaning' },
  ],
  dataSource: [
    { key: '1', status: 'NOT_LOADED', meaning: '子应用尚未加载入口文件' },
    { key: '2', status: 'LOADING_SOURCE_CODE', meaning: '正在加载子应用的 JS entry' },
    { key: '3', status: 'NOT_BOOTSTRAPPED', meaning: '入口已加载，但尚未执行 bootstrap' },
    { key: '4', status: 'BOOTSTRAPPING', meaning: '正在执行子应用的 bootstrap 回调' },
    { key: '5', status: 'NOT_MOUNTED', meaning: '子应用已准备好，等待 mount' },
    { key: '6', status: 'MOUNTING', meaning: '正在执行子应用的 mount 回调' },
    { key: '7', status: 'MOUNTED', meaning: '子应用已挂载并正常运行' },
    { key: '8', status: 'UNMOUNTING', meaning: '正在执行子应用的 unmount 回调' },
    { key: '9', status: 'UNLOADING', meaning: '正在卸载子应用的入口资源（仅 loadMicroApp 支持）' },
    { key: '10', status: 'SKIP_BECAUSE_BROKEN', meaning: '子应用出错，标记为不可用' },
    { key: '11', status: 'LOAD_ERROR', meaning: '加载入口文件时出错' },
  ],
};
```

- [ ] **Step 3: 验证 TypeScript**

```bash
npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/load-micro-app/data.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/qiankun/load-micro-app/data.ts
git commit -m "feat(qiankun-load-micro-app): add data.ts"
```

---

## Task 2: 创建 demo 文件

**Files:**
- Create: `src/pages/qiankun/load-micro-app/demos/basic-load.tsx`
- Create: `src/pages/qiankun/load-micro-app/demos/update-props.tsx`
- Create: `src/pages/qiankun/load-micro-app/demos/unmount-micro-app.tsx`
- Create: `src/pages/qiankun/load-micro-app/demos/inline-mounted-vs-route.tsx`
- Create: `src/pages/qiankun/load-micro-app/demos/load-in-modal.tsx`
- Create: `src/pages/qiankun/load-micro-app/demos/parallel-instances.tsx`
- Create: `src/pages/qiankun/load-micro-app/demos/status-check.tsx`

- [ ] **Step 1: basic-load.tsx**

```tsx
// ✅ 基本加载：loadMicroApp 替代 registerMicroApps

import { loadMicroApp } from 'qiankun';

// 手动加载一个子应用到指定容器
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
// app.unmount();
```

- [ ] **Step 2: update-props.tsx**

```tsx
// ✅ 更新 props：app.update 动态通知子应用

import { loadMicroApp } from 'qiankun';

const app = loadMicroApp({
  name: 'dashboard',
  entry: '//localhost:8003',
  container: '#dashboard-area',
  props: { theme: 'light', filters: {} },
});

// 用户切换主题 → 通知子应用
function onThemeChange(theme: string) {
  app.update({ props: { theme } });
}

// 用户修改筛选条件 → 通知子应用
function onFilterChange(filters: Record<string, any>) {
  app.update({ props: { filters } });
}
```

- [ ] **Step 3: unmount-micro-app.tsx**

```tsx
// ✅ 手动卸载：精细控制卸载时机

import { loadMicroApp } from 'qiankun';
import { useState } from 'react';

function useManagedMicroApp(config: any) {
  const [status, setStatus] = useState<string>('none');
  const appRef = useRef<any>(null);

  const mount = () => {
    if (!appRef.current) {
      appRef.current = loadMicroApp(config);
    }
    setStatus('mounted');
  };

  const unmount = () => {
    if (appRef.current) {
      appRef.current.unmount();
      appRef.current = null;
    }
    setStatus('unmounted');
  };

  const update = (props: any) => {
    if (appRef.current) {
      appRef.current.update({ props });
    }
  };

  return { mount, unmount, update, status };
}
```

- [ ] **Step 4: inline-mounted-vs-route.tsx**

```tsx
// 路由驱动 registerMicroApps vs 手动内嵌 loadMicroApp 对比

// ❌ registerMicroApps 方式：只能依赖路由触发
registerMicroApps([
  {
    name: 'sql-editor',
    entry: '//localhost:8001',
    container: '#micro-viewport',
    activeRule: '/dashboard/sql',
  },
]);
// 用户必须访问 /dashboard/sql 才能看到子应用

// ✅ loadMicroApp 方式：可以在任何时间、任何位置加载
import { loadMicroApp } from 'qiankun';

function openSqlEditorInModal() {
  const container = document.getElementById('modal-content');
  loadMicroApp({
    name: 'sql-editor',
    entry: '//localhost:8001',
    container,
    props: { mode: 'inline' },
  });
}
// 用户点击按钮时立即加载，不需要路由匹配
```

- [ ] **Step 5: load-in-modal.tsx**

```tsx
// ✅ 在弹窗中加载子应用

import React, { useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { loadMicroApp } from 'qiankun';

interface AdvancedQueryModalProps {
  visible: boolean;
  onClose: () => void;
}

const AdvancedQueryModal: React.FC<AdvancedQueryModalProps> = ({ visible, onClose }) => {
  const appRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && !appRef.current && containerRef.current) {
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
  }, [visible, onClose]);

  return (
    <Modal open={visible} title="高级查询" onCancel={onClose} width={800}>
      <div ref={containerRef} style={{ minHeight: 400 }} />
    </Modal>
  );
};

export default AdvancedQueryModal;
```

- [ ] **Step 6: parallel-instances.tsx**

```tsx
// ✅ 并行多实例：同一子应用在不同容器同时挂载

import { loadMicroApp } from 'qiankun';

const instances: any[] = [];

function spawnApp(containerId: string) {
  const app = loadMicroApp({
    // 同一 name，同一 entry，不同 container
    name: 'data-panel',
    entry: '//localhost:8004',
    container: `#${containerId}`,
    props: { panelId: containerId },
  });
  instances.push(app);
  return app;
}

// 同时挂载 3 个 data-panel 实例
spawnApp('panel-1');
spawnApp('panel-2');
spawnApp('panel-3');

// 卸载所有
function unmountAll() {
  instances.forEach((app) => app.unmount());
}
```

- [ ] **Step 7: status-check.tsx**

```tsx
// ✅ 状态检查：getStatus 获取生命周期状态

import { loadMicroApp } from 'qiankun';

const app = loadMicroApp({
  name: 'dashboard',
  entry: '//localhost:8003',
  container: '#dashboard-area',
});

// 刚创建完，尚未开始加载
console.log(app.getStatus()); // "NOT_LOADED"

async function demo() {
  // 开始加载入口
  console.log(app.getStatus()); // "LOADING_SOURCE_CODE"

  // 等待挂载完成
  await app.mount();
  console.log(app.getStatus()); // "MOUNTED"

  // 卸载
  await app.unmount();
  console.log(app.getStatus()); // "NOT_MOUNTED"

  // 重新挂载
  await app.mount();
  console.log(app.getStatus()); // "MOUNTED"
}
```

- [ ] **Step 8: 验证 + Commit**

```bash
npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/load-micro-app/demos/*.tsx
git add src/pages/qiankun/load-micro-app/demos/
git commit -m "feat(qiankun-load-micro-app): add demo files"
```

---

## Task 3: 创建 LiveDemo 组件

**Files:**
- Create: `src/pages/qiankun/load-micro-app/LiveDemo.tsx`

- [ ] **Step 1: 编写 LiveDemo.tsx**

```tsx
import React, { useState, useRef, useCallback } from 'react';
import { Card, Space, Typography, Tag, Button, Input, Divider, Alert } from 'antd';

interface AppInstance {
  id: number;
  containerId: string;
  props: Record<string, any>;
  status: string;
}

let nextId = 1;

const LiveDemo: React.FC = () => {
  const [instances, setInstances] = useState<AppInstance[]>([]);
  const [theme, setTheme] = useState('light');
  const [token, setToken] = useState('initial-token');
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  }, []);

  const mountInstance = useCallback(() => {
    const id = nextId++;
    const containerId = `demo-container-${id}`;
    const newInstance: AppInstance = {
      id,
      containerId,
      props: { theme, token, panelId: id },
      status: 'MOUNTED',
    };
    setInstances((prev) => [...prev, newInstance]);
    addLog(`挂载实例 #${id} 到 #${containerId}，props: { theme: ${theme}, token: ${token} }`);
  }, [theme, token, addLog]);

  const unmountInstance = useCallback((id: number) => {
    setInstances((prev) => prev.filter((i) => i.id !== id));
    addLog(`卸载实例 #${id}`);
  }, [addLog]);

  const unmountAll = useCallback(() => {
    setInstances([]);
    addLog('卸载所有实例');
  }, [addLog]);

  const updateProps = useCallback(() => {
    setInstances((prev) =>
      prev.map((i) => ({ ...i, props: { ...i.props, theme, token } }))
    );
    addLog(`更新所有实例 props: { theme: ${theme}, token: ${token} }`);
  }, [theme, token, addLog]);

  const clearLog = useCallback(() => {
    setLog([]);
  }, []);

  return (
    <Card title="手动加载演示器">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 控制区 */}
        <Card size="small" title="控制面板">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span><strong>Theme:</strong></span>
              <Tag color={theme === 'dark' ? 'purple' : 'orange'}>{theme}</Tag>
              <Button size="small" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                切换
              </Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span><strong>Token:</strong></span>
              <Input
                size="small"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{ width: 200 }}
              />
            </div>
            <Divider style={{ margin: '4px 0' }} />
            <Space>
              <Button type="primary" onClick={mountInstance}>
                挂载子应用
              </Button>
              <Button onClick={updateProps} disabled={instances.length === 0}>
                更新所有 props
              </Button>
              <Button danger onClick={unmountAll} disabled={instances.length === 0}>
                全部卸载
              </Button>
            </Space>
          </Space>
        </Card>

        {/* 多实例面板 */}
        <Card size="small" title={`已挂载的子应用实例 (${instances.length})`}>
          {instances.length === 0 ? (
            <Typography.Text type="secondary">暂无实例，点击"挂载子应用"创建</Typography.Text>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {instances.map((inst) => (
                <Card
                  key={inst.id}
                  size="small"
                  title={`实例 #${inst.id}`}
                  extra={<Button size="small" danger onClick={() => unmountInstance(inst.id)}>卸载</Button>}
                  style={{ width: 240 }}
                >
                  <div><strong>容器：</strong>#{inst.containerId}</div>
                  <div><strong>状态：</strong><Tag color="green">{inst.status}</Tag></div>
                  <div><strong>Theme：</strong>{inst.props.theme}</div>
                  <div><strong>Token：</strong>{inst.props.token}</div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* 操作日志 */}
        <Card
          size="small"
          title="操作日志"
          extra={<Button size="small" onClick={clearLog}>清空</Button>}
        >
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            {log.length === 0 ? (
              <Typography.Text type="secondary">暂无操作日志</Typography.Text>
            ) : (
              log.map((msg, i) => (
                <div key={i} style={{ padding: '2px 0', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                  {msg}
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

- [ ] **Step 2: 验证 + Commit**

```bash
npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/load-micro-app/LiveDemo.tsx
git add src/pages/qiankun/load-micro-app/LiveDemo.tsx
git commit -m "feat(qiankun-load-micro-app): add live demo component"
```

---

## Task 4: 创建 content.mdx

**Files:**
- Create: `src/pages/qiankun/load-micro-app/content.mdx`

- [ ] **Step 1: 编写 content.mdx**

```mdx
import CodeDiff from '@/components/CodeDiff';
import LiveDemo from './LiveDemo';
import { Table, Typography, Divider, Alert } from 'antd';
import { comparisonTable, statusTable } from './data';

import basicLoad from './demos/basic-load.tsx?raw';
import updateProps from './demos/update-props.tsx?raw';
import unmountMicroApp from './demos/unmount-micro-app.tsx?raw';
import inlineVsRoute from './demos/inline-mounted-vs-route.tsx?raw';
import loadInModal from './demos/load-in-modal.tsx?raw';
import parallelInstances from './demos/parallel-instances.tsx?raw';
import statusCheck from './demos/status-check.tsx?raw';

# qiankun 专题：loadMicroApp

<Typography.Paragraph type="secondary">手动加载子应用的 API 使用场景、生命周期状态与完整用法</Typography.Paragraph>

---

## 一、引言

你已经学会了 `registerMicroApps` 按路由挂载子应用。但有些场景不是路由驱动的：

- 在**弹窗/抽屉**中临时加载一个工具型子应用（如 SQL 查询器、图片编辑器）
- 在**同一个页面内同时挂载多个子应用实例**（如左右并排对比两个数据面板）
- 需要**精细控制子应用的挂载/卸载时机**

`loadMicroApp` 就是为这些场景设计的。它直接返回一个 `app` 实例，你可以手动调用 `mount`、`unmount`、`update`。

---

## 二、与 registerMicroApps 的区别

<Table dataSource={comparisonTable.dataSource} columns={comparisonTable.columns} pagination={false} size="small" bordered />

<CodeDiff oldValue={inlineVsRoute} newValue={inlineVsRoute} leftTitle="" rightTitle="✅ 内嵌 vs 路由驱动对比" type="error" hideDiffMarkers={true} />

---

## 三、使用场景

### 场景 1：基本加载

<CodeDiff oldValue={basicLoad} newValue={basicLoad} leftTitle="" rightTitle="✅ 基本加载" type="error" hideDiffMarkers={true} />

### 场景 2：弹窗中加载

最常见的场景：用户点击"高级查询"按钮，弹出一个 Modal，里面加载子应用作为富内容。

<CodeDiff oldValue={loadInModal} newValue={loadInModal} leftTitle="" rightTitle="✅ 弹窗中加载" type="error" hideDiffMarkers={true} />

### 场景 3：动态更新 props

子应用 mount 后，外部状态变化需要通知子应用时，使用 `app.update`。

<CodeDiff oldValue={updateProps} newValue={updateProps} leftTitle="" rightTitle="✅ 更新 props" type="error" hideDiffMarkers={true} />

### 场景 4：手动卸载

`app.unmount()` 提供比路由切换更精细的卸载控制。

<CodeDiff oldValue={unmountMicroApp} newValue={unmountMicroApp} leftTitle="" rightTitle="✅ 手动卸载" type="error" hideDiffMarkers={true} />

### 场景 5：并行多实例

qiankun 最强大的特性之一：同一个子应用可以在不同容器中同时存在多个实例。

<CodeDiff oldValue={parallelInstances} newValue={parallelInstances} leftTitle="" rightTitle="✅ 并行多实例" type="error" hideDiffMarkers={true} />

### 场景 6：状态检查

`loadMicroApp` 返回的 app 实例有 `getStatus()` 方法，返回子应用当前生命周期状态。

<CodeDiff oldValue={statusCheck} newValue={statusCheck} leftTitle="" rightTitle="✅ 状态检查" type="error" hideDiffMarkers={true} />

---

## 四、生命周期状态

qiankun 子应用的状态流转：

```
NOT_LOADED → LOADING_SOURCE_CODE → NOT_BOOTSTRAPPED → BOOTSTRAPPING
    → NOT_MOUNTED → MOUNTING → MOUNTED → UNMOUNTING → NOT_MOUNTED
```

<Table dataSource={statusTable.dataSource} columns={statusTable.columns} pagination={false} size="small" bordered />

---

## 五、API 参考

| 方法 | 说明 | 返回值 |
|---|---|---|
| `loadMicroApp(config)` | 手动加载一个子应用 | `LoadableApp` 实例 |
| `app.mount()` | 手动挂载 | `Promise<void>` |
| `app.unmount()` | 手动卸载 | `Promise<void>` |
| `app.update({ props })` | 更新传入子应用的 props | `Promise<void>` |
| `app.getStatus()` | 获取当前生命周期状态 | `string` |

---

## 六、Live Demo：手动加载演示器

<LiveDemo />
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/qiankun/load-micro-app/content.mdx
git commit -m "feat(qiankun-load-micro-app): add content.mdx"
```

---

## Task 5: 创建页面入口 index.tsx

**Files:**
- Create: `src/pages/qiankun/load-micro-app/index.tsx`

- [ ] **Step 1: 编写 index.tsx**

```tsx
import Content from './content.mdx';
import React from 'react';

const QiankunLoadMicroAppPage: React.FC = () => {
  return <Content />;
};

export default QiankunLoadMicroAppPage;
```

- [ ] **Step 2: 验证 + Commit**

```bash
npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/load-micro-app/index.tsx
git add src/pages/qiankun/load-micro-app/index.tsx
git commit -m "feat(qiankun-load-micro-app): add page entry component"
```

---

## Task 6: 注册路由

**Files:**
- Modify: `src/router/config.tsx`

- [ ] **Step 1: 添加懒加载导入**

在 `src/router/config.tsx` 的懒加载组件区域新增：

```tsx
const QiankunLoadMicroAppPage = lazy(() => import('../pages/qiankun/load-micro-app/index'));
```

- [ ] **Step 2: 添加子菜单**

在 `qiankun 专题` children 末尾新增：

```tsx
      {
        path: '/dashboard/qiankun/load-micro-app',
        label: 'loadMicroApp',
        element: <QiankunLoadMicroAppPage />,
      },
```

- [ ] **Step 3: 验证 + Commit**

```bash
npx tsc --noEmit
git add src/router/config.tsx
git commit -m "feat(router): register qiankun load-micro-app route"
```

---

## Task 7: 验证

- [ ] **Step 1: 运行 lint**

```bash
npm run lint
```

- [ ] **Step 2: 运行 dev 服务器**

```bash
npm run dev
```

等待 5 秒后检查编译输出。

- [ ] **Step 3: 如有修复，提交**

```bash
git add -A
git commit -m "fix(qiankun-load-micro-app): fix lint and typecheck issues"
```

---

## 验收标准检查

- [ ] 主应用菜单 `qiankun 专题` 下新增 `loadMicroApp`
- [ ] 页面包含引言 + 对比表格 + 6 个使用场景 + 状态图 + API 参考 + Live Demo
- [ ] 6 个场景每个都有 CodeDiff 代码示例
- [ ] Live Demo 展示加载/更新 props/多实例/卸载/状态监控
- [ ] 通过 `npm run dev` 验证
