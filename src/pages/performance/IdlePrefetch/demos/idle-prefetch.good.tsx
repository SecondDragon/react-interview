/**
 * ✅ 最佳实践：闲时预取（Vite 方案）
 *
 * 关键模式：将 import() 函数提取为独立变量，同时传给 lazy 和 IdlePrefetch
 * 浏览器空闲时自动下载 JS chunk，用户点击时秒开
 */
import React, { lazy, Suspense, useState } from 'react';

// 模拟模拟 import 函数（实际项目中替换为真实路径）
const fetchMock = (id: string) =>
  new Promise<{ default: React.ComponentType }>((resolve) =>
    setTimeout(() => resolve({ default: () => <div>页面 {id} 内容</div> }), 500)
  );

const pageAImporter = () => fetchMock('A') as Promise<{ default: React.ComponentType }>;
const PageA = lazy(pageAImporter);

const pageBImporter = () => fetchMock('B') as Promise<{ default: React.ComponentType }>;
const PageB = lazy(pageBImporter);

// 路由配置中添加 idlePrefetch + importFn 标记
const routes = [
  {
    path: '/page-a',
    label: '页面 A',
    element: <PageA />,
    importFn: pageAImporter,
    idlePrefetch: true,
  },
  {
    path: '/page-b',
    label: '页面 B',
    element: <PageB />,
    importFn: pageBImporter,
    idlePrefetch: true,
  },
];

export default function Demo() {
  const [page, setPage] = useState<'a' | 'b' | null>(null);

  return (
    <div>
      <button onClick={() => setPage('a')}>打开页面 A</button>
      <button onClick={() => setPage('b')}>打开页面 B</button>
      <Suspense fallback={<div>Loading...</div>}>
        {page === 'a' && <PageA />}
        {page === 'b' && <PageB />}
      </Suspense>
    </div>
  );
}
