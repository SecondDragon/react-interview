import { create } from 'zustand';

/**
 * 标签页项定义
 */
interface TabItem {
  key: string;      // 路径，唯一标识
  label: string;    // 显示名称
  closable?: boolean; // 是否允许关闭
}

/**
 * 标签页状态管理
 * 负责维护系统中已打开的页面列表，并处理新增、删除和切换。
 */
interface TabState {
  tabs: TabItem[];
  activeKey: string;
  maxTabs: number;
  // Actions
  addTab: (tab: TabItem) => void;
  removeTab: (targetKey: string) => string | null; // 返回建议跳转的路由路径
  setActiveKey: (key: string) => void;
}

/**
 * 标签页(Tabs)管理 Store
 * 使用 Zustand 管理。
 * 作用：
 * 1. 管理 MainLayout 中 Tab 栏的渲染。
 * 2. 处理页面跳转时的标签同步。
 * 3. 实现标签超出最大限制时的自动置换算法（LRU 近似实现）。
 */
export const useTabStore = create<TabState>((set, get) => ({
  tabs: [{ key: '/dashboard/overview', label: '系统概览', closable: false }],
  activeKey: '/dashboard/overview',
  maxTabs: 8, // 业务逻辑：限制最大打开 8 个标签，防止内存占用过高及 UI 拥挤

  setActiveKey: (key) => set({ activeKey: key }),

  /**
   * 新增标签逻辑
   * 1. 检查是否已存在，若存在则仅激活。
   * 2. 检查是否超出 maxTabs，若超出则移除最旧的一个（首个可关闭的标签）。
   */
  addTab: (newTab) => {
    const { tabs, maxTabs } = get();
    // 逻辑：如果标签已存在，仅激活该标签
    if (tabs.find((t) => t.key === newTab.key)) {
      set({ activeKey: newTab.key });
      return;
    }

    let newTabs = [...tabs, newTab];
    
    // 逻辑：实现标签自动管理，超出最大数量时，删除最早加入的可关闭标签
    if (newTabs.length > maxTabs) {
      const firstClosableIndex = newTabs.findIndex(t => t.closable !== false);
      if (firstClosableIndex !== -1) {
        newTabs.splice(firstClosableIndex, 1);
      }
    }

    set({ tabs: newTabs, activeKey: newTab.key });
  },

  /**
   * 移除标签逻辑
   * 1. 从 tabs 数组中过滤掉目标 key。
   * 2. 若关闭的是当前激活页，自动计算下一个应激活的页面（前一个或第一个）。
   * @returns 最终确定的激活页面路径，供调用者(MainLayout)进行路由跳转
   */
  removeTab: (targetKey) => {
    const { tabs, activeKey } = get();
    let newActiveKey = activeKey;
    let lastIndex = -1;
    
    tabs.forEach((tab, i) => {
      if (tab.key === targetKey) {
        lastIndex = i - 1; // 寻找前一个标签的索引
      }
    });

    const newTabs = tabs.filter((tab) => tab.key !== targetKey);
    
    // 逻辑：如果关闭的是当前激活页，需要计算跳转到哪一个新页面
    if (newTabs.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newTabs[lastIndex].key;
      } else {
        newActiveKey = newTabs[0].key;
      }
    }

    set({ tabs: newTabs, activeKey: newActiveKey });
    return newActiveKey;
  },
}));
