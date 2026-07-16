import { lazy, Suspense } from 'react';
import { Skeleton } from 'antd';

const HeavyDashboard = lazy(() => import('./HeavyDashboard'));

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<GlobalSkeleton />}>
            <HeavyDashboard />
          </Suspense>
        }
      />
    </Routes>
  );
}
