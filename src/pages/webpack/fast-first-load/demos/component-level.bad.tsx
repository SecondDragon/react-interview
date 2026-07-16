import { EChartsChart } from './EChartsChart';
import { DataTable } from './DataTable';
import { HeavyForm } from './HeavyForm';

// 所有组件同步加载 — 无论页面需不需要，全部打包到一个 chunk 中
function Dashboard() {
  return (
    <div>
      <h1>数据概览</h1>
      <StatCards />
      <EChartsChart />    {/* echarts ~780KB */}
      <DataTable />        {/* 虚拟滚动表格 ~150KB */}
      <HeavyForm />        {/* 复杂表单 ~200KB */}
    </div>
  );
}
