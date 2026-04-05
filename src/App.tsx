import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './layout/MainLayout';
import { dashboardRoutes } from './router/config';
import type { RouteConfig } from './router/config';
import { AuthGuard } from './components/AuthGuard';
import './App.css';

const Forbidden = lazy(() => import('./pages/error/Forbidden'));

const renderFlattenRoutes = (routes: RouteConfig[]): React.ReactNode[] => {
  let result: React.ReactNode[] = [];
  routes.forEach((route) => {
    if (route.element) {
      const relativePath = route.path.startsWith('/dashboard/') 
        ? route.path.substring('/dashboard/'.length) 
        : route.path;

      result.push(
        <Route 
          key={route.path} 
          path={relativePath} 
          element={<AuthGuard>{route.element}</AuthGuard>} 
        />
      );
    }
    if (route.children) result.push(...renderFlattenRoutes(route.children));
  });
  return result;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<MainLayout />}>
          {renderFlattenRoutes(dashboardRoutes)}
          
          {/* 注册 403 页面 */}
          <Route path="forbidden" element={<Forbidden />} />
          
          <Route index element={<Navigate to="/dashboard/overview" replace />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
