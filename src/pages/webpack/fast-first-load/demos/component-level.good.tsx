import { lazy, Suspense } from 'react';
import { Skeleton } from 'antd';

// 组件级懒加载 — 让重组件晚加载，先展示骨架屏
const EChartsChart = lazy(() => import(/* webpackPrefetch: true */ './EChartsChart'));
const DataTable = lazy(() => import(/* webpackPrefetch: true */ './DataTable'));
const HeavyForm = lazy(() => import(/* webpackPrefetch: true */ './HeavyForm'));

function Dashboard() {
  return (
    <div>
      <h1>数据概览</h1>

      {/* 轻量内容立即渲染 */}
      <StatCards />

      {/* 重组件：先显示骨架屏，加载完成后替换 */}
      <Suspense fallback={<Skeleton active style={{ marginTop: 24 }} paragraph={{ rows: 6 }} />}>
        <EChartsChart />
      </Suspense>

      <Suspense fallback={<Skeleton active style={{ marginTop: 24 }} paragraph={{ rows: 4 }} />}>
        <DataTable />
      </Suspense>

      <Suspense fallback={<Skeleton active style={{ marginTop: 24 }} paragraph={{ rows: 8 }} />}>
        <HeavyForm />
      </Suspense>
    </div>
  );
}
