import type { MenuProps } from 'antd';
import type { RouteConfig } from '../router/config';

// 提取 Ant Design 菜单项类型
export type MenuItem = Required<MenuProps>['items'][number];

// 扁平化路由映射表类型
export type FlattenedRouteMap = Record<string, RouteConfig>;
