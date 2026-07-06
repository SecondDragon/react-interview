/**
 * ❌ 反面教材：普通懒加载，没有闲时预取
 *
 * 问题：用户点击导航时才开始下载 JS chunk，
 * 网络耗时完全暴露给用户，造成等待延迟
 */
import React, { lazy, Suspense, useState } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));
const DataTable = lazy(() => import('./DataTable'));

function BadNavigation() {
  const [page, setPage] = useState<'chart' | 'table' | null>(null);

  return (
    <div>
      {/* 点击时才触发 import()，立即开始网络下载 */}
      <button onClick={() => setPage('chart')}>打开图表</button>
      <button onClick={() => setPage('table')}>打开表格</button>

      <Suspense fallback={<div>Loading...</div>}>
        {page === 'chart' && <HeavyChart />}
        {page === 'table' && <DataTable />}
      </Suspense>
    </div>
  );
}
