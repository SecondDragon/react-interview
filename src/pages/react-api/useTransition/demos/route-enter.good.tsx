import HeavyDashboard from './HeavyDashboard';

// 二级页面（也可以顺带展示当前Demo中配合useTransition的效果）
function DashboardPage() {
  const [ready, setReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 进入页面后，优先显示骨架屏
  // HeavyDashboard 的 30000 个节点放到后台渲染
  useEffect(() => {
    startTransition(() => setReady(true));
  }, []);

  return (
    <div>
      <PageHeader />
      <SideNav />

      {isPending || !ready ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <HeavyDashboard />
      )}
    </div>
  );
}
