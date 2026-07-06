// ❌ 全局变量冲突演示
// 两个子应用先后在 window 上设置同名变量

// 子应用 A
function mountAppA() {
  (window as any).__token = 'token-from-app-a';
  (window as any).__user = { name: 'Alice', role: 'admin' };
  (window as any).__config = { baseUrl: '/api/v1' };
  console.log('App A mounted, window.__user:', (window as any).__user);
}

// 子应用 A unmount
function unmountAppA() {
  // (假设)子应用没有清理全局变量
  // 这些值会一直留在 window 上
}

// 子应用 B
function mountAppB() {
  // 子应用 B 没有设置 __user，它有自己的 __currentUser
  (window as any).__token = 'token-from-app-b';
  (window as any).__currentUser = { name: 'Bob', role: 'viewer' };
  console.log('App B mounted, window.__token:', (window as any).__token);
}

function unmountAppB() {
  // 子应用 B 没有清理 window.__token 和 window.__currentUser
}

// 流程：
mountAppA();
// window.__token = 'token-from-app-a'
// window.__user = { name: 'Alice', role: 'admin' }

unmountAppA();
// 没有清理，__token 和 __user 仍然留在 window 上

mountAppB();
// window.__token 被覆盖为 'token-from-app-b'
// window.__user 仍然是 A 的 { name: 'Alice', role: 'admin' }

// 问题：如果 A 重新 mount，它发现 window.__user 还在
// 但 window.__token 被 B 覆盖了
// A 的内部状态会出现混乱

// ❌ 没有沙箱的话，全局变量冲突是必然的
