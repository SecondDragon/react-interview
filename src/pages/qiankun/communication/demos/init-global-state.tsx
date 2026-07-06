// ✅ initGlobalState 基本用法（主应用侧）

import { initGlobalState, MicroAppStateActions } from 'qiankun';

// 1. 定义初始状态
const initialState = {
  user: null,            // 用户信息，登录后由主应用设置
  theme: 'light',        // 主题：light / dark
  token: '',             // 登录令牌
  notifications: [],     // 全局通知列表
};

// 2. 初始化全局状态
// 返回一个 actions 对象，包含 setGlobalState、onGlobalStateChange、offGlobalStateChange
const actions: MicroAppStateActions = initGlobalState(initialState);

// 3. 主应用也可以订阅全局状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('主应用监听到全局状态变化：', state, prev);
});

// 4. 导出 actions 供其他地方使用
export { actions };
