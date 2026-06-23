/**
 * iOS 安全区域案例元数据
 */
export const SafeAreaExamples = {
  description: '刘海屏手机底部有操作条，页面内容需避开安全区域。',
  bad: `.bottom-bar { position: fixed; bottom: 0; height: 50px; }`,
  good: `.bottom-bar-fixed { 
  padding-bottom: env(safe-area-inset-bottom); 
  height: calc(50px + env(safe-area-inset-bottom)); 
}`,
};
