import HeavyDashboard from './HeavyDashboard';

// 页面 mount 后直接同步渲染所有内容
function DashboardPage() {
  // 没有任何延迟策略
  // 30000 个节点在 mount 时全部同步渲染
  // 用户进入页面需要等待 ~200ms
  return (
    <div>
      <PageHeader />
      <SideNav />
      <HeavyDashboard />
    </div>
  );
}
