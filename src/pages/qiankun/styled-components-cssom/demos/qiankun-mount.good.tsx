// ✅ 最佳实践：设置 disableCSSOMInjection: true
// 使用 textContent 模式（tag.textContent += cssText）
// qiankun 卸载再重挂载后，样式自动恢复

import { StyleSheetManager } from 'styled-components';
import { createRoot } from 'react-dom/client';

// qiankun mount 生命周期
export async function mount(props) {
  const { container } = props;

  createRoot(container.querySelector('#app')!).render(
    // ✅ disableCSSOMInjection: true 启用 textContent 模式
    // styled-components 会在 style 标签被移除后自动检测 isConnected 并重建
    <StyleSheetManager disableCSSOMInjection={true}>
      <App />
    </StyleSheetManager>
  );
}
