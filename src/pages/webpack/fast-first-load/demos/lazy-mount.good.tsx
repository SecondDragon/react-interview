import LazyMount from '@/components/LazyMount';
import { Skeleton } from 'antd';

function LongDashboard() {
  return (
    <div>
      {/* 轻量组件直接渲染 */}
      <StatCards />

      {/* 重组件延迟挂载：只有进入视口附近 100px 才首次 mount */}
      <LazyMount
        placeholder={
          <Skeleton active style={{ height: 400, marginTop: 24 }} />
        }
      >
        <EChartsChart />
      </LazyMount>

      <LazyMount
        placeholder={
          <Skeleton active style={{ height: 300, marginTop: 24 }} />
        }
      >
        <DataTable />
      </LazyMount>

      <LazyMount
        placeholder={
          <div style={{ height: 200, marginTop: 24, background: '#f5f5f5' }} />
        }
      >
        <HeavyFooterForm />
      </LazyMount>
    </div>
  );
}
