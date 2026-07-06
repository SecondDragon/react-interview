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
