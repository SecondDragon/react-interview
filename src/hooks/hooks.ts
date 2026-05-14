import {useMemo, useRef} from 'react';

/**
 * 根据当前路由路径，在路由树中找出所有需要展开的父级菜单 Key
 */
export const useOpenKeysByPath = (routes: any[], targetPath: string): string[] => {
  const keyPathMap = useRef(new Map<string, string[]>());

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
        // console.log('cleanPath', cleanPath);
        // console.log('parentPaths', parentPaths);

        // 1. 命中目标判断：
        // 情况 A: 路径完全相等 (比如找到了 '/dashboard/users')
        // 情况 B: 目标路径包含当前路径 (比如浏览器的 '/dashboard/micro-vue/detail' 匹配到了 '/dashboard/micro-vue')
        if (targetPath === cleanPath) {
          // 🎉 找到了！说明沿途记录下来的 parentPaths 就是我们要展开的菜单！
          keys = [...parentPaths];
          return true; // 向上层通知：找到了，停止后续无意义的搜索
        }

        // 2. 优先递归子节点，寻找更精确的匹配
        if (route.children && route.children.length > 0) {
          const isFoundInChildren = dfs(route.children, [...parentPaths, route.path]);
          // 如果在它的某一个子孙里面找到了目标，直接一路向上返回 true，结束战斗
          if (isFoundInChildren) {
            return true;
          }
        }
        // 3. 兜底：子节点中没找到，且目标路径以当前路径为前缀
        // 说明是微前端通配符场景下"未声明的子页面"
        if (targetPath.startsWith(cleanPath + '/')) {
          keys = [...parentPaths, route.path];
          return true;
        }
      }
      // 当前层级的所有节点以及它们的子孙全找遍了，都没匹配上，返回 false
      return false;
    };

    // 修复：原逻辑中 trueKeys 的判断逻辑有误
    const cachedKeys = keyPathMap.current.get(targetPath);
    if (cachedKeys && cachedKeys.length > 0) {
      return cachedKeys;
    } else {
      dfs(routes, []);
      if (keys && keys.length > 0) {
        keyPathMap.current.set(targetPath, keys);
      }
      return keys;
    }
  }, [targetPath, routes]);

  return openKeys;
};
