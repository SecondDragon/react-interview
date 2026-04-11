import {makeAutoObservable} from 'mobx';

class PermissionStore {
  allowedPaths: string[] = [];
  isLoaded: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  fetchPermissions = async () => {
    // 模拟 API 接口延迟
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 模拟从后端获取到的权限列表
    const mockAllowed = [
      '/dashboard/overview',
      '/dashboard/tasks-container',
      '/dashboard/tasks-container/list',
      '/dashboard/multi-level',
      '/dashboard/multi-level/sub1',
      '/dashboard/multi-level/sub1/page1',
      '/dashboard/micro-vue/list',
      '/dashboard/micro-vue/detail',
      '/dashboard/waterfall-pro',
      '/dashboard/waterfall',

    ];

    this.allowedPaths = mockAllowed;
    this.isLoaded = true;
  };

  clearPermissions = () => {
    this.allowedPaths = [];
    this.isLoaded = false;
  };
}

const permissionStore = new PermissionStore();
export const usePermissionStore = Object.assign(() => permissionStore, {
  getState: () => permissionStore
});
