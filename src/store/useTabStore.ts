import { create } from 'zustand';

interface TabItem {
  key: string;
  label: string;
  closable?: boolean;
}

interface TabState {
  tabs: TabItem[];
  activeKey: string;
  maxTabs: number;
  setActiveKey: (key: string) => void;
  addTab: (newTab: TabItem) => void;
  removeTab: (targetKey: string) => string | null;
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [{ key: '/dashboard/overview', label: '系统概览', closable: false }],
  activeKey: '/dashboard/overview',
  maxTabs: 8,

  setActiveKey: (key: string) => set({ activeKey: key }),

  addTab: (newTab: TabItem) => {
    const { tabs, maxTabs } = get();
    if (tabs.find((t) => t.key === newTab.key)) {
      set({ activeKey: newTab.key });
      return;
    }

    const newTabs = [...tabs, newTab];

    if (newTabs.length > maxTabs) {
      const firstClosableIndex = newTabs.findIndex((t) => t.closable !== false);
      if (firstClosableIndex !== -1) {
        newTabs.splice(firstClosableIndex, 1);
      }
    }

    set({ tabs: newTabs, activeKey: newTab.key });
  },

  removeTab: (targetKey: string): string | null => {
    const { tabs, activeKey } = get();
    let newActiveKey = activeKey;
    let lastIndex = -1;

    tabs.forEach((tab, i) => {
      if (tab.key === targetKey) {
        lastIndex = i - 1;
      }
    });

    const filteredTabs = tabs.filter((tab) => tab.key !== targetKey);

    if (filteredTabs.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = filteredTabs[lastIndex].key;
      } else {
        newActiveKey = filteredTabs[0].key;
      }
    }

    set({ tabs: filteredTabs, activeKey: newActiveKey });
    return newActiveKey;
  },
}));
