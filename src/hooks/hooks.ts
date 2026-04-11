import { useEffect, useMemo, useRef } from 'react';

/**
 * 根据当前路由路径，在路由树中找出所有需要展开的父级菜单 Key
 * @param routes 完整的路由表配置树 (比如您的 dashboardRoutes)
 * @param targetPath 当前浏览器地址栏的实际路径 (例如 '/dashboard/users/list')
 * @returns 需要传递给 Menu 的 openKeys 数组 (例如 ['/dashboard', '/dashboard/users'])
 */
export const useOpenKeysByPath = (routes: any[], targetPath: string): string[][] => {
  // 用于保存最终找到的“祖先路径”的数组

  const keyPathMap = useRef(new Map<string, string[]>());

  console.log('targetPath', targetPath);
  console.log('routes', routes);
  const openKeys = useMemo(() => {
    let keys: string[] = [];

    const dfs = (currentRoutes: any[], parentPaths: string[]): boolean => {
      // 遍历当前层级的每一个路由节点
      for (let i = 0; i < currentRoutes.length; i++) {
        const route = currentRoutes[i];

        // 【关键细节】：处理微前端或动态路由！
        // 因为您接入了 qiankun，路由里可能有 '/dashboard/micro-vue/*'
        // 我们需要把 '/*' 去掉，才能进行准确的前缀匹配
        const cleanPath = route.path.replace(/\/\*$/, '');
        console.log('cleanPath', cleanPath);
        console.log('parentPaths', parentPaths);
        // eslint-disable-next-line no-debugger
        // debugger

        // 1. 命中目标判断：
        // 情况 A: 路径完全相等 (比如找到了 '/dashboard/users')
        // 情况 B: 目标路径包含当前路径 (比如浏览器的 '/dashboard/micro-vue/detail' 匹配到了 '/dashboard/micro-vue')
        if (targetPath === cleanPath) {
          // debugger
          // 🎉 找到了！说明沿途记录下来的 parentPaths 就是我们要展开的菜单！
          keys = [...parentPaths];
          return true; // 向上层通知：找到了，停止后续无意义的搜索
        }

        // 2. 如果当前节点不是目标，但它有 children (子菜单)，就继续往深处找
        if (route.children && route.children.length > 0) {
          // 把【当前节点的 path】加入到父级路径集合中，带着它继续去子树里找
          // 注意：使用 [...parentPaths, route.path] 生成新数组，防止污染兄弟节点的回溯状态
          const isFoundInChildren = dfs(route.children, [...parentPaths, route.path]);
          // debugger
          // 如果在它的某一个子孙里面找到了目标，直接一路向上返回 true，结束战斗
          if (isFoundInChildren) {
            // debugger
            return true;
          }
        }
      }
      // 当前层级的所有节点以及它们的子孙全找遍了，都没匹配上，返回 false
      return false;
    };

    // eslint-disable-next-line react-hooks/refs
    const trueKeys = keyPathMap.current.get(targetPath);

    if (trueKeys && Array.isArray(trueKeys) && trueKeys.length) {
      return trueKeys;
    } else {
      dfs(routes, []);
      if (keys && Array.isArray(trueKeys)) {
        // eslint-disable-next-line react-hooks/refs
        keyPathMap.current.set(targetPath, keys);
      }
      return keys;
    }
  }, [targetPath, routes]);

  return [openKeys];
};
