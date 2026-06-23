/**
 * 多标签页同步案例元数据
 */
export const TabSyncExamples = {
  title: '多标签页登录态冲突',
  reason: '银行合规要求退出登录必须全站同步生效。',
  phenomenon: '一页退出，他页仍可操作。',
  bad: "localStorage.removeItem('token');",
  good: `const channel = new BroadcastChannel('auth');
channel.postMessage('logout');`,
};
