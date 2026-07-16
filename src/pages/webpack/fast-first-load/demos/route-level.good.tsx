import { lazy, Suspense } from 'react';

// 路由级懒加载 + 预加载策略
const Login = lazy(() => import(/* webpackPreload: true */ './pages/Login'));
const Dashboard = lazy(() => import(/* webpackPrefetch: true */ './pages/Dashboard'));
const ProductList = lazy(() => import(/* webpackPrefetch: true */ './pages/ProductList'));
const OrderList = lazy(() => import(/* webpackPrefetch: true */ './pages/OrderList'));

function App() {
  return (
    <Suspense fallback={<GlobalSkeleton />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/orders" element={<OrderList />} />
      </Routes>
    </Suspense>
  );
}
