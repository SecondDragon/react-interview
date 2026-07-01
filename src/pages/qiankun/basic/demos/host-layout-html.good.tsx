// ✅ 最佳实践：主应用布局中预留挂载容器
// 注意：这里为了演示，用 inline style 展示关键样式。实际项目中建议用 CSS/Styled Components。

import React from 'react';

export default function HostLayout() {
  return (
    <div id="root" style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 200, borderRight: '1px solid #ddd' }}>
        侧边栏菜单
      </aside>
      <main style={{ flex: 1, padding: 16, overflow: 'auto' }}>
        <h1>主应用内容区</h1>

        {/*
          #micro-viewport 是 qiankun 挂载子应用的容器，必须满足以下条件：
          1. 在 registerMicroApps 的 container 字段中能找到；
          2. 不能被 display: none 包裹，否则子应用无法渲染；
          3. 需要有明确高度（或 minHeight），否则子应用渲染后可能不可见；
          4. 建议设置 overflow: auto，让子应用内容超出时可以独立滚动。
        */}
        <div
          id="micro-viewport"
          style={{
            minHeight: 500,
            border: '1px dashed #1890ff',
            borderRadius: 8,
            overflow: 'auto',
            position: 'relative',
          }}
        >
          {/* 子应用会挂载到这里 */}
        </div>
      </main>
    </div>
  );
}
