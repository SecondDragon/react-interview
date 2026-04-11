/* eslint-disable react-refresh/only-export-components */
import React, {lazy} from 'react';
import {
  DashboardOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  MenuOutlined,
  SettingOutlined,
  AppstoreOutlined,
  ApiOutlined,
} from '@ant-design/icons';

/**
 * 路由配置接口定义
 * 用于规范系统内所有页面的路由属性，支持嵌套子路由和权限控制
 */
export interface RouteConfig {
  path: string;        // 路由访问路径，也是菜单项和标签页的唯一标识(Key)
  label: string;       // 菜单显示的名称，以及标签页显示的标题
  icon?: React.ReactNode;  // 菜单显示的图标 (Ant Design Icons)
  element?: React.ReactNode; // 该路由对应的组件页面 (通常使用 lazy 加载)
  closable?: boolean;  // 该页面在标签栏(Tabs)中是否允许被用户关闭
  children?: RouteConfig[]; // 子路由配置，用于实现多级侧边菜单
  hideInMenu?: boolean; // 是否在侧边导航菜单中隐藏 (例如一些详情页或 403 页面)
  /**
   * 是否为白名单路由
   * 实现逻辑：即使后端权限接口没有返回该路径，AuthGuard 也会允许访问，MainLayout 也会将其显示在菜单中。
   * 使用场景：首页概览、个人设置等通用页面。
   */
  isWhiteList?: boolean;
}

// 懒加载页面组件，优化首屏加载速度
const Overview = lazy(() => import('../pages/overview/index'));
const TaskList = lazy(() => import('../pages/tasks/TaskList'));
const MyTasks = lazy(() => import('../pages/tasks/MyTasks'));
const UserList = lazy(() => import('../pages/users/UserList'));
const Settings = lazy(() => import('../pages/settings/Settings'));

// 多级路由页面
const Sub1Page1 = lazy(() => import('../pages/multi-level/sub1/Sub1Page1'));
const Sub1Page2 = lazy(() => import('../pages/multi-level/sub1/Sub1Page2'));
const Sub2Page = lazy(() => import('../pages/multi-level/Sub2Page'));

// 瀑布流页面
const WaterfallPage = lazy(() => import('../pages/waterfall/index'));
const WaterfallProfessional = lazy(() => import('../pages/waterfall/Professional'));
const WaterfallUltimate = lazy(() => import('../pages/waterfall/Ultimate'));

/**
 * 路由总表配置
 * 该配置定义了系统的整个页面骨架结构。
 * 1. 用于 MainLayout 生成左侧动态导航菜单。
 * 2. 用于 AuthGuard 进行路由权限校验。
 * 3. 用于 MainLayout 监听路径变化并同步更新顶部标签页(Tabs)。
 */
export const dashboardRoutes: RouteConfig[] = [
  {
    path: '/dashboard/overview',
    label: '系统概览',
    icon: <DashboardOutlined/>,
    element: <Overview/>,
    closable: false,
    isWhiteList: true // 首页通常设为白名单
  },

  {
    path: '/dashboard/waterfall-container',
    label: '瀑布流专题',
    icon: <AppstoreOutlined/>,
    isWhiteList: true,
    children: [
      {
        path: '/dashboard/waterfall',
        label: '基础虚拟瀑布流',
        element: <WaterfallPage/>,
      },
      {
        path: '/dashboard/waterfall-pro',
        label: 'Pro级空间索引瀑布流',
        element: <WaterfallProfessional/>,
      },
      {
        path: '/dashboard/waterfall-ultimate',
        label: 'Ultimate级节点复用瀑布流',
        element: <WaterfallUltimate/>,
      }
    ]
  },

  {
    path: '/dashboard/tasks-container',
    label: '任务中心',
    icon: <CheckSquareOutlined/>,
    children: [
      {path: '/dashboard/tasks-container/list', label: '全部任务清单', element: <TaskList/>},
      // 假设“我的任务”是白名单，不需要后端权限也能看
      {path: '/dashboard/tasks-container/my', label: '我的私人任务', element: <MyTasks/>, isWhiteList: true},
    ]
  },

  {
    path: '/dashboard/multi-level',
    label: '多级菜单示例',
    icon: <MenuOutlined/>,
    children: [
      {
        path: '/dashboard/multi-level/sub1',
        label: '二级子菜单 A',
        icon: <AppstoreOutlined/>,
        children: [
          {path: '/dashboard/multi-level/sub1/page1', label: '三级路由 1-1', element: <Sub1Page1/>},
          {path: '/dashboard/multi-level/sub1/page2', label: '三级路由 1-2', element: <Sub1Page2/>},
        ]
      },
      {
        path: '/dashboard/multi-level/sub2',
        label: '二级直达(限权)',
        element: <Sub2Page/>
      },
    ]
  },

  // ======== 改进后的微前端路由配置 ========
  // 凡是匹配 /dashboard/micro-vue/* 的菜单，主路由都会渲染统一容器，由 qiankun 根据 URL 自动加载。
  {
    path: '/dashboard/micro-vue',
    label: 'Vue 微应用中心',
    icon: <ApiOutlined/>,
    isWhiteList: true,
    children: [
      {path: '/dashboard/micro-vue/list', label: 'Vue 任务列表'},
      {path: '/dashboard/micro-vue/detail', label: 'Vue 任务详情'},
    ]
  },
  {
    path: '/dashboard/micro-react',
    label: 'React 微应用中心',
    icon: <ApiOutlined/>,
    isWhiteList: true,
    children: [
      {path: '/dashboard/micro-react/page-a', label: 'React 页面 A'},
      {path: '/dashboard/micro-react/page-b', label: 'React 页面 B'},
    ]
  },
  // ===================================

  {
    path: '/dashboard/users1',
    isWhiteList: true, // 首页通常设为白名单
    label: '用户权限管理',
    icon: <TeamOutlined/>,
    element: <UserList/>
  },
  {
    path: '/dashboard/settings',
    label: '系统全局配置',
    icon: <SettingOutlined/>,
    element: <Settings/>,
    isWhiteList: true // 设置页面通常也允许访问
  },
];
