# SimpleBar 滚动条完全指南

> 适用场景：当你需要**滚动条不占布局空间**（悬浮在内容上方）时，SimpleBar 是原生 `overflow: auto` 的最佳替代方案。

---

## 一、SimpleBar 是什么？

SimpleBar 是一个**纯 JS 驱动的自定义滚动条库**。它不依赖任何框架，提供了 React / Vue / Angular 的封装。

**核心思路只有一句话：**

> 隐藏浏览器的原生滚动条 → 在内容上方绝对定位画一个假的滚动条 → JS 实时同步位置。

因为假滚动条是 `position: absolute`，所以**它不占据任何布局空间** —— 这就是它和原生滚动条最本质的区别。

---

## 二、DOM 结构与工作流程

### 2.1 SimpleBar 生成的完整 DOM 树

```
<SimpleBar>                                          ← 1. 你写的 React 组件（最外层容器）
  <div class="simplebar-wrapper">                     ← 2. 「溢出观察层」
    <div class="simplebar-height-auto-observer-wrapper">  ← 3. 「高度变化监听器」（用于检测内容高度变化）
      <div class="simplebar-height-auto-observer" />
    </div>
    <div class="simplebar-mask">                      ← 4. 「遮罩层」
      <div class="simplebar-offset">                  ← 5. 「偏移层」（为滚动条预留视觉空间）
        <div class="simplebar-content-wrapper">       ← 6. 「真正的滚动容器」
            ↑ 这里有原生的 overflow: auto
            ↑ 但滚动条被 scrollbar-width: none 隐藏了
          <div class="simplebar-content">             ← 7. 「内容容器」
            {/* 你的 children 放在这里 */}
          </div>
        </div>
      </div>
    </div>
    <div class="simplebar-track simplebar-vertical">  ← 8. 「竖向滚动条轨道」position: absolute
      <div class="simplebar-scrollbar" />              ← 9. 「滚动条滑块」
    </div>
    <div class="simplebar-track simplebar-horizontal">← 10.「横向滚动条轨道」position: absolute
      <div class="simplebar-scrollbar" />
    </div>
  </div>
</SimpleBar>
```

### 2.2 工作流程

```
用户滚动鼠标滚轮
        │
        ▼
simplebar-content-wrapper（原生 overflow: auto）
  原生滚动生效，scrollTop 变化
        │
        ▼
SimpleBar JS 监听到 scroll 事件
  读取 scrollTop / scrollHeight / clientHeight
        │
        ▼
计算滑块位置：
  scrollbarTop = (scrollTop / (scrollHeight - clientHeight)) × (trackHeight - scrollbarHeight)
        │
        ▼
设置 .simplebar-scrollbar 的 transform: translateY(...)
  滑块实时跟随内容滚动
```

### 2.3 关键类名总览

| 类名 | 作用 | 可自定义什么 |
|------|------|-------------|
| `.simplebar-content-wrapper` | 真正的滚动容器，有 `overflow: auto` 但原生滚动条被隐藏 | 不建议直接修改 |
| `.simplebar-track.simplebar-vertical` | 竖向假滚动条的"轨道" | `width`（控制滚动条粗细） |
| `.simplebar-track.simplebar-horizontal` | 横向假滚动条的"轨道" | `height`（控制滚动条粗细） |
| `.simplebar-scrollbar::before` | 滚动条"滑块"（通过伪元素绘制） | `background-color`（颜色）、`border-radius`（圆角） |
| `.simplebar-scrollbar.simplebar-visible::before` | 滚动条正在被使用时 | `opacity`（透明度） |
| `.simplebar-scrollbar.simplebar-hover::before` | 鼠标悬停在滚动条上 | `opacity`、`background-color` |

---

## 三、React 中使用 SimpleBar

### 3.1 安装与导入

```bash
npm install simplebar-react simplebar
```

```typescript
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';  // ← 必须导入！否则滚动条不会显示
```

### 3.2 基础用法

```tsx
<SimpleBar style={{ height: '100%' }}>
  <div>长内容...</div>
</SimpleBar>
```

**唯一要求：** SimpleBar 必须有**明确的高度约束**（`height`、`max-height`、或弹性布局中的 `flex: 1` + 外层 `overflow: hidden`）。

### 3.3 常用 Props

| Props | 类型 | 说明 |
|-------|------|------|
| `style` | `CSSProperties` | 最外层容器样式。必须有高度约束 |
| `className` | `string` | 自定义类名 |
| `autoHide` | `boolean`（默认 `true`）| 不滚时是否自动隐藏滚动条 |
| `forceVisible` | `"x"` \| `"y"` \| `boolean` | 强制始终显示滚动条 |
| `scrollableNodeProps` | 对象 | 透传给 `.simplebar-content-wrapper` 的 props。常见用法：绑定 `onScroll`、`ref` |
| `ref` | `Ref` | 获取 SimpleBar 实例。`ref.current.getScrollElement()` 可获取滚动容器 DOM |

### 3.4 绑定 onScroll 事件

```tsx
// 方式一：scrollableNodeProps（推荐）
<SimpleBar
  scrollableNodeProps={{ onScroll: (e) => console.log(e.currentTarget.scrollTop) }}
  style={{ height: '100%' }}
>
  <div>内容</div>
</SimpleBar>
```

### 3.5 通过 ref 获取滚动信息

```tsx
const simpleBarRef = useRef<SimpleBar>(null);

// 获取可视区域高度
const viewportHeight = simpleBarRef.current?.el?.clientHeight;

// 获取滚动容器 DOM（用于手动控制滚动位置）
const scrollEl = simpleBarRef.current?.getScrollElement();
scrollEl?.scrollTo({ top: 0, behavior: 'smooth' });
```

---

## 四、CSS 自定义滚动条样式

SimpleBar 的滚动条由 CSS 渲染，通过覆盖以下类名即可完全控制外观。

### 4.1 默认样式 vs 自定义样式

默认的 `simplebar.min.css` 中：

```css
/* 默认轨道宽度 */
.simplebar-track.simplebar-vertical { width: 11px; }

/* 默认滑块 */
.simplebar-scrollbar::before {
  background: #000;       /* 纯黑 */
  opacity: 0.5;           /* 半透明 */
  transition: opacity 0.2s linear;
}

/* 悬停时更明显 */
.simplebar-scrollbar.simplebar-hover::before { opacity: 0.8; }
```

### 4.2 完整自定义模板

以下是一个 "细 + 浅色" 风格的完整覆盖，可直接复制使用：

```css
/* 竖向轨道宽度 */
.simplebar-track.simplebar-vertical {
  width: 6px;
}

/* 横向轨道高度 */
.simplebar-track.simplebar-horizontal {
  height: 6px;
}

/* 滑块颜色与圆角 */
.simplebar-scrollbar::before {
  background-color: rgba(0, 0, 0, 0.18);  /* 浅灰半透明 */
  border-radius: 3px;                       /* 圆角 */
  left: 1px;                                /* 左右各留 1px 间距 */
  right: 1px;
}

/* 悬停时稍微加深 */
.simplebar-scrollbar.simplebar-hover::before {
  background-color: rgba(0, 0, 0, 0.3);
}

/* 正在拖拽时完全不透明 */
.simplebar-scrollbar.simplebar-dragging::before {
  background-color: rgba(0, 0, 0, 0.45);
}
```

### 4.3 本项目中的实现方式（styled-components）

在 `MainLayout.tsx` 中，通过 styled-components 的**后代选择器**来覆盖 SimpleBar 内部类名：

```typescript
const SimpleBarMenuWrapper = styled.div`
  flex: 1;
  overflow: hidden;

  .simplebar-track {
    &.simplebar-vertical { width: 6px; }
    &.simplebar-horizontal { height: 6px; }
  }

  .simplebar-scrollbar::before {
    background-color: rgba(0, 0, 0, 0.18);
    border-radius: 3px;
    left: 1px;
    right: 1px;
  }
`;

// 使用：
<SimpleBarMenuWrapper>
  <SimpleBar style={{ height: '100%' }}>
    <Menu ... />
  </SimpleBar>
</SimpleBarMenuWrapper>
```

**为什么用外层包裹 div 而不是直接给 SimpleBar 加 className？**

因为 styled-components 生成的类名加在组件最外层 DOM 上，SimpleBar 在其内部子元素上使用了 `.simplebar-scrollbar` 等类名。通过外层 div 的后代选择器 `.simplebar-scrollbar::before`，可以穿透到 SimpleBar 内部去覆盖样式。

---

## 五、Flexbox 布局配合 —— min-height: auto 陷阱

### 5.1 问题

在 flex 容器中直接使用 SimpleBar 时，内容超出却不会出现滚动条：

```tsx
// ❌ 不滚动！
<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
  <div style={{ height: 64 }}>标题栏</div>
  <SimpleBar style={{ flex: 1 }}>
    {/* 内容超过剩余空间，但滚动条不出现 */}
  </SimpleBar>
</div>
```

### 5.2 根因

Flex 子项的默认 `min-height: auto` 阻止元素被压缩到比内容更矮。浏览器计算出的 SimpleBar 实际高度 = 内容高度（比如 2000px），没有溢出，所以不显示滚动条。

### 5.3 解决方案

用一个外层 div **打破 `min-height: auto`**（`overflow: hidden` 会创建 BFC，使 `min-height` 从 `auto` 变为 `0`）：

```tsx
// ✅ 正常滚动
<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
  <div style={{ height: 64 }}>标题栏</div>
  <div style={{ flex: 1, overflow: 'hidden' }}>    {/* 打破 min-height: auto */}
    <SimpleBar style={{ height: '100%' }}>           {/* 继承约束后的高度 */}
      {/* 内容 */}
    </SimpleBar>
  </div>
</div>
```

### 5.4 决策树：何时需要外层 div？

```
SimpleBar 外层是 flex 容器？
  ├── 是 → SimpleBar 是 flex 子项（flex: 1）？
  │     ├── 是 → 必须加外层 div（flex: 1 + overflow: hidden）
  │     └── 否 → SimpleBar 有固定 height？→ 不需要
  └── 否 → SimpleBar 有固定 height 或 max-height？→ 不需要
```

---

## 六、横向滚动条

### 6.1 何时出现

SimpleBar 的横向滚动条会在**内容宽度超过容器宽度**时自动出现，与原生 `overflow-x: auto` 行为一致。

```
内容宽度 > 容器宽度  →  .simplebar-track.simplebar-horizontal 自动显示
内容宽度 ≤ 容器宽度  →  自动隐藏（autoHide: true 时）
```

### 6.2 控制横向滚动条显示

```typescript
// 强制始终显示横向滚动条
<SimpleBar forceVisible="x" style={{ ... }}>
  <div style={{ width: 2000 }}>很宽的内容</div>
</SimpleBar>

// 强制同时显示横向和竖向
<SimpleBar forceVisible={true} style={{ ... }}>
  ...
</SimpleBar>

// 禁止自动隐藏（始终留出轨道空间，但滑块不显示时是透明的）
<SimpleBar autoHide={false} style={{ ... }}>
  ...
</SimpleBar>
```

### 6.3 自定义横向滚动条样式

```css
/* 横向轨道高度 */
.simplebar-track.simplebar-horizontal {
  height: 4px;
  bottom: 2px;          /* 底部留一点间距 */
}

/* 横向滑块（同样通过 ::before 伪元素） */
.simplebar-track.simplebar-horizontal .simplebar-scrollbar::before {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 2px;
  top: 1px;
  bottom: 1px;
}
```

### 6.4 完整横向 + 竖向示例

```tsx
<SimpleBar style={{ width: 300, height: 300 }}>
  <div style={{ width: 800, height: 1200 }}>
    {/* 内容既宽又高 → 同时出现横向和竖向滚动条，都不占布局空间 */}
  </div>
</SimpleBar>
```

---

## 七、常见问题排查

| 现象 | 原因 | 解决 |
|------|------|------|
| 滚动条完全看不到 | 没导入 `simplebar-react/dist/simplebar.min.css` | 加上 `import 'simplebar-react/dist/simplebar.min.css'` |
| 内容溢出但不出现滚动条（flex 中） | `min-height: auto` 导致高度没被约束 | 外层加 `<div style={{ flex: 1, overflow: 'hidden' }}>` |
| 滚动条出现但无法拖动 | 未正确绑定 ref 或 CSS 冲突 | 检查是否有全局样式覆盖了 `.simplebar-scrollbar` |
| 滚动条宽度没变化 | 样式优先级不够 | 使用 `!important` 或提高选择器优先级 |
| 热更新启动报错 | Qiankun 重复 start | 加全局标志位 `window.qiankunStarted` |
| 侧边栏收起/展开后滚动条错位 | SimpleBar 未收到尺寸变化通知 | 调用 `simpleBarRef.current?.recalculate()` |

---

## 八、最佳实践总结

1. **CSS 必须导入**：`import 'simplebar-react/dist/simplebar.min.css'`
2. **必须有高度约束**：`height: 100%` / `max-height: 400px` / 外层 `flex: 1 + overflow: hidden`
3. **不要加 overflow**：SimpleBar 自己管理，外层也只需 `overflow: hidden`
4. **自定义样式通过外层 wrapper 后代表选择器**：`.simplebar-track`、`.simplebar-scrollbar::before`
5. **横向滚动条无需额外配置**：内容宽度超出时自动出现，样式同样可自定义
6. **onScroll 用 `scrollableNodeProps`**：这是绑定到真正滚动容器上的正确方式
7. **用于菜单/侧边栏/modal 等有限高度区域**：这些场景最适合 SimpleBar 的悬浮滚动条
