import { create } from 'zustand';

interface PermissionState {
  allowedPaths: string[];
  isLoaded: boolean;
  fetchPermissions: () => Promise<void>;
  clearPermissions: () => void;
}

export const usePermissionStore = create<PermissionState>((set) => ({
  allowedPaths: [],
  isLoaded: false,
  fetchPermissions: async () => {
    // 模拟 API 接口延迟
    await new Promise((resolve) => setTimeout(resolve, 20));

    // 模拟从后端获取到的权限列表
    const mockAllowed = [
      '/dashboard/overview',
      '/dashboard/tasks-container',
      '/dashboard/tasks-container/my',
      '/dashboard/phone-work-bench',
      '/dashboard/phone-work-bench/call-center',
      '/dashboard/multi-level',
      '/dashboard/multi-level/sub1',
      '/dashboard/multi-level/sub1/page1',
      '/dashboard/micro-vue/list',
      '/dashboard/micro-vue/detail',
      '/dashboard/react-guide/refs-best-practice',
      '/dashboard/performance',
      '/dashboard/performance/idle-load',
      '/dashboard/performance/hover-preload',
      '/dashboard/performance/virtual-table',
      '/dashboard/performance/waterfall',
      '/dashboard/performance/waterfall-pro',
      '/dashboard/performance/waterfall-ultimate',
      '/dashboard/performance/waterfall-ultimate2',
      '/dashboard/compatibility',
      '/dashboard/compatibility/1px',
      '/dashboard/compatibility/vh-unit',
      '/dashboard/compatibility/safe-area',
      '/dashboard/compatibility/ime-input',
      '/dashboard/compatibility/scrollbar',
      '/dashboard/compatibility/font-family',
      '/dashboard/compatibility/date-parsing',
      '/dashboard/compatibility/keyboard',
      '/dashboard/compatibility/autoplay',
      '/dashboard/compatibility/bank-precision',
      '/dashboard/compatibility/amount-input',
      '/dashboard/compatibility/bank-csp',
      '/dashboard/compatibility/ios-focus',
      '/dashboard/compatibility/z-index',
      '/dashboard/compatibility/font-centering',
      '/dashboard/compatibility/audio-playback',
      '/dashboard/compatibility/mixed-content',
      '/dashboard/components-encapsulation',
      '/dashboard/components-encapsulation/dynamic-form',
      '/dashboard/components-encapsulation/pro-dynamic-form',
    ];

    set({ allowedPaths: mockAllowed, isLoaded: true });
  },
  clearPermissions: () => set({ allowedPaths: [], isLoaded: false }),
}));
