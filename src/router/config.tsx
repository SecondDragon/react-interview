/* eslint-disable react-refresh/only-export-components */
import React, { lazy } from 'react';
import {
  DashboardOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  MenuOutlined,
  SettingOutlined,
  AppstoreOutlined,
  ApiOutlined,
  ToolOutlined,
  PhoneOutlined,
} from '@ant-design/icons';

export interface RouteConfig {
  path: string;
  label: string;
  icon?: React.ReactNode;
  element?: React.ReactNode;
  closable?: boolean;
  children?: RouteConfig[];
  hideInMenu?: boolean;
  isWhiteList?: boolean;
}

// 懒加载组件
const Overview = lazy(() => import('../pages/overview/index'));
const TaskList = lazy(() => import('../pages/tasks/TaskList'));
const MyTasks = lazy(() => import('../pages/tasks/MyTasks'));
const CallCenterLayout = lazy(() =>
  import('../pages/phone-work-bench/call-center/CallCenterLayout.tsx')
);
const UserList = lazy(() => import('../pages/users/UserList'));
const Settings = lazy(() => import('../pages/settings/Settings'));
const Sub1Page1 = lazy(() => import('../pages/multi-level/sub1/Sub1Page1'));
const Sub1Page2 = lazy(() => import('../pages/multi-level/sub1/Sub1Page2'));
const Sub2Page = lazy(() => import('../pages/multi-level/Sub2Page'));
const WaterfallPage = lazy(() => import('../pages/performance/Waterfall/index'));
const WaterfallProfessional = lazy(() => import('../pages/performance/Waterfall/Professional'));
const WaterfallUltimate = lazy(() => import('../pages/performance/Waterfall/Ultimate'));
const WaterfallUltimate2 = lazy(() => import('../pages/performance/Waterfall/Ultimate2'));
const RefsBestPractice = lazy(() => import('../pages/refs-guide/RefsBestPractice'));
const IdleLoadPage = lazy(() => import('../pages/performance/IdleLoad/index'));
const HoverPreloadPage = lazy(() => import('../pages/performance/HoverPreload/index'));
const VirtualTablePage = lazy(() => import('../pages/performance/VirtualTable/index'));
const NoStableHeightVirtualListPage = lazy(
  () => import('../pages/performance/NoStableHeightVirtualList/index')
);
const VirtuosoListPage = lazy(() => import('../pages/performance/VirtuosoList/index'));
const DynamicFormPage = lazy(() => import('../pages/components-encapsulation/DynamicForm/index'));
const ProDynamicFormPage = lazy(
  () => import('../pages/components-encapsulation/ProDynamicForm/index')
);

// 兼容性问题组件
const OnePixel = lazy(() => import('../pages/compatibility/OnePixel/index'));
const VhUnit = lazy(() => import('../pages/compatibility/VhUnit/index'));
const SafeArea = lazy(() => import('../pages/compatibility/SafeArea/index'));
const IMEInput = lazy(() => import('../pages/compatibility/IMEInput/index'));
const ScrollbarStyle = lazy(() => import('../pages/compatibility/ScrollbarStyle/index'));
const FontFamily = lazy(() => import('../pages/compatibility/FontFamily/index'));
const DateParsing = lazy(() => import('../pages/compatibility/DateParsing/index'));
const KeyboardOverlap = lazy(() => import('../pages/compatibility/KeyboardOverlap/index'));
const AutoplayPolicy = lazy(() => import('../pages/compatibility/AutoplayPolicy/index'));
const BankPrecision = lazy(() => import('../pages/compatibility/BankPrecision/index'));
const AmountInput = lazy(() => import('../pages/compatibility/AmountInput/index'));
const BankCSP = lazy(() => import('../pages/compatibility/BankCSP/index'));
const BankCookie = lazy(() => import('../pages/compatibility/BankCookie/index'));
const MixedContent = lazy(() => import('../pages/compatibility/MixedContent/index'));
const TabSync = lazy(() => import('../pages/compatibility/TabSync/index'));
const IosInputFocus = lazy(() => import('../pages/compatibility/IosInputFocus/index'));
const ZIndexStacking = lazy(() => import('../pages/compatibility/ZIndexStacking/index'));
const VerticalCentering = lazy(() => import('../pages/compatibility/VerticalCentering/index'));
const AudioPlayback = lazy(() => import('../pages/compatibility/AudioPlayback/index'));

export const dashboardRoutes: RouteConfig[] = [
  {
    path: '/dashboard/overview',
    label: '系统概览',
    icon: <DashboardOutlined />,
    element: <Overview />,
    closable: false,
    isWhiteList: true,
  },
  {
    path: '/dashboard/compatibility',
    label: '兼容性问题解决',
    icon: <ToolOutlined />,
    isWhiteList: true,
    children: [
      {
        path: '/dashboard/compatibility/1px',
        icon: <ApiOutlined />,
        label: '移动端 1px 边框',
        element: <OnePixel />,
      },
      { path: '/dashboard/compatibility/vh-unit', label: 'iOS Safari vh高度', element: <VhUnit /> },
      {
        path: '/dashboard/compatibility/safe-area',
        label: 'iOS 安全区域适配',
        element: <SafeArea />,
      },
      {
        path: '/dashboard/compatibility/ime-input',
        label: '中文输入法 IME 锁',
        element: <IMEInput />,
      },
      {
        path: '/dashboard/compatibility/scrollbar',
        label: '跨平台滚动条样式',
        element: <ScrollbarStyle />,
      },
      {
        path: '/dashboard/compatibility/font-family',
        label: '跨平台字体栈',
        element: <FontFamily />,
      },
      {
        path: '/dashboard/compatibility/date-parsing',
        label: 'Safari 日期解析',
        element: <DateParsing />,
      },
      {
        path: '/dashboard/compatibility/keyboard',
        label: '移动端键盘遮挡',
        element: <KeyboardOverlap />,
      },
      {
        path: '/dashboard/compatibility/autoplay',
        label: '媒体自动播放限制',
        element: <AutoplayPolicy />,
      },
      {
        path: '/dashboard/compatibility/bank-precision',
        label: '金融计算精度',
        element: <BankPrecision />,
      },
      {
        path: '/dashboard/compatibility/amount-input',
        label: '金额千分位输入',
        element: <AmountInput />,
      },
      { path: '/dashboard/compatibility/bank-csp', label: '银行级 CSP 限制', element: <BankCSP /> },
      {
        path: '/dashboard/compatibility/bank-cookie',
        label: 'Cookie SameSite 兼容',
        element: <BankCookie />,
      },
      {
        path: '/dashboard/compatibility/mixed-content',
        label: 'HTTPS 混合内容拦截',
        element: <MixedContent />,
      },
      {
        path: '/dashboard/compatibility/tab-sync',
        label: '多标签页登录态同步',
        element: <TabSync />,
      },
      {
        path: '/dashboard/compatibility/ios-focus',
        label: 'iOS 聚焦跳转/穿透',
        element: <IosInputFocus />,
      },
      {
        path: '/dashboard/compatibility/z-index',
        label: 'z-index 层叠陷阱',
        element: <ZIndexStacking />,
      },
      {
        path: '/dashboard/compatibility/font-centering',
        label: '跨平台字体居中偏差',
        element: <VerticalCentering />,
      },
      {
        path: '/dashboard/compatibility/audio-playback',
        label: '自定义音频播放器',
        element: <AudioPlayback />,
      },
    ],
  },
  {
    path: '/dashboard/components-encapsulation',
    label: '通用组件封装',
    icon: <AppstoreOutlined />,
    isWhiteList: true,
    children: [
      {
        path: '/dashboard/components-encapsulation/dynamic-form',
        label: 'JSON 动态表单',
        element: <DynamicFormPage />,
      },
      {
        path: '/dashboard/components-encapsulation/pro-dynamic-form',
        label: '企业级动态表单(最佳实践)',
        element: <ProDynamicFormPage />,
      },
    ],
  },
  {
    path: '/dashboard/react-guide',
    label: 'React 进阶指南',
    icon: <ApiOutlined />,
    isWhiteList: true,
    children: [
      {
        path: '/dashboard/react-guide/refs-best-practice',
        label: 'Refs 最佳实践',
        element: <RefsBestPractice />,
      },
    ],
  },
  {
    path: '/dashboard/performance',
    label: '性能优化专题',
    icon: <ToolOutlined />,
    isWhiteList: true,
    children: [
      {
        path: '/dashboard/performance/idle-load',
        label: '闲时加载优化',
        element: <IdleLoadPage />,
      },
      {
        path: '/dashboard/performance/hover-preload',
        label: 'Hover 预加载优化',
        element: <HoverPreloadPage />,
      },
      {
        path: '/dashboard/performance/virtual-table',
        label: '虚拟滚动大数据表格',
        element: <VirtualTablePage />,
      },
      {
        path: '/dashboard/performance/no-stable-height-virtual-list',
        label: '不定高虚拟列表',
        element: <NoStableHeightVirtualListPage />,
      },
      {
        path: '/dashboard/performance/virtuoso-list',
        label: 'Virtuoso 动态高度(专业方案)',
        element: <VirtuosoListPage />,
      },
      {
        path: '/dashboard/performance/waterfall',
        label: '基础虚拟瀑布流',
        element: <WaterfallPage />,
      },
      {
        path: '/dashboard/performance/waterfall-pro',
        label: 'Pro级空间索引瀑布流',
        element: <WaterfallProfessional />,
      },
      {
        path: '/dashboard/performance/waterfall-ultimate',
        label: 'Ultimate级节点复用瀑布流',
        element: <WaterfallUltimate />,
      },
      {
        path: '/dashboard/performance/waterfall-ultimate2',
        label: 'Ultimate级节点复用瀑布流2',
        element: <WaterfallUltimate2 />,
      },
    ],
  },

  {
    path: '/dashboard/tasks-container',
    label: '任务中心',
    icon: <CheckSquareOutlined />,
    children: [
      { path: '/dashboard/tasks-container/list', label: '全部任务清单', element: <TaskList /> },
      {
        path: '/dashboard/tasks-container/my',
        label: '我的私人任务',
        element: <MyTasks />,
        isWhiteList: true,
      },
    ],
  },
  {
    path: '/dashboard/phone-work-bench',
    label: '话务工作台',
    icon: <PhoneOutlined />,
    children: [
      {
        path: '/dashboard/phone-work-bench/call-center',
        label: '呼叫中心布局',
        element: <CallCenterLayout />,
      },
    ],
  },
  {
    path: '/dashboard/multi-level',
    label: '多级菜单示例',
    icon: <MenuOutlined />,
    children: [
      {
        path: '/dashboard/multi-level/sub1',
        label: '二级子菜单 A',
        icon: <AppstoreOutlined />,
        children: [
          {
            path: '/dashboard/multi-level/sub1/page1',
            label: '三级路由 1-1',
            element: <Sub1Page1 />,
          },
          {
            path: '/dashboard/multi-level/sub1/page2',
            label: '三级路由 1-2',
            element: <Sub1Page2 />,
          },
        ],
      },
      { path: '/dashboard/multi-level/sub2', label: '二级直达(限权)', element: <Sub2Page /> },
    ],
  },
  {
    path: '/dashboard/micro-vue',
    label: 'Vue 微应用中心',
    icon: <ApiOutlined />,
    isWhiteList: true,
    children: [
      { path: '/dashboard/micro-vue/list', label: 'Vue 任务列表' },
      { path: '/dashboard/micro-vue/detail', label: 'Vue 任务详情' },
    ],
  },
  {
    path: '/dashboard/micro-react',
    label: 'React 微应用中心',
    icon: <ApiOutlined />,
    isWhiteList: true,
    children: [
      { path: '/dashboard/micro-react/page-a', label: 'React 页面 A' },
      { path: '/dashboard/micro-react/page-b', label: 'React 页面 B' },
    ],
  },
  {
    path: '/dashboard/users1',
    isWhiteList: true,
    label: '用户权限管理',
    icon: <TeamOutlined />,
    element: <UserList />,
  },
  {
    path: '/dashboard/settings',
    label: '系统全局配置',
    icon: <SettingOutlined />,
    element: <Settings />,
    isWhiteList: true,
  },
];
