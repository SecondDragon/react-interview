// ✅ 取消订阅 offGlobalStateChange
// 两种取消方式：

// 方式一：onGlobalStateChange 返回的 unsubscribe 函数（推荐，更精确）
export async function mount(props: any) {
  const { onGlobalStateChange } = props;

  const unsubscribe1 = onGlobalStateChange((state) => {
    console.log('订阅者 1', state.theme);
  });

  const unsubscribe2 = onGlobalStateChange((state) => {
    console.log('订阅者 2', state.token);
  });

  // 可以单独取消某一个订阅，不影响其他订阅
  unsubscribe1(); // 只取消订阅者 1
}

// 方式二：actions.offGlobalStateChange()（主应用侧）
// 会清除所有订阅者
import { initGlobalState } from 'qiankun';

const actions = initGlobalState({});

// 添加订阅
actions.onGlobalStateChange((state) => {
  console.log('订阅者', state);
});

// 清除所有订阅
actions.offGlobalStateChange();
// 之后任何 setGlobalState 都不会触发回调
