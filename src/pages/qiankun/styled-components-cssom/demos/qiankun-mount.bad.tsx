// ❌ 反面教材：未设置 disableCSSOMInjection
// 默认使用 CSSOM Injection 模式（tag.sheet.insertRule）
// 在 qiankun 中 unmount 再 remount 后，样式将永久丢失

import { StyleSheetManager } from 'styled-components';
import { createRoot } from 'react-dom/client';

// qiankun mount 生命周期
export async function mount(props) {
  const { container } = props;

  createRoot(container.querySelector('#app')!).render(
    // ⚠️ 未设置 disableCSSOMInjection，默认使用 CSSOM 注入
    <StyleSheetManager>
      <App />
    </StyleSheetManager>
  );
}
