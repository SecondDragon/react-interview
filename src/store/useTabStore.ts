import {makeAutoObservable} from 'mobx';

interface TabItem {
  key: string;
  label: string;
  closable?: boolean;
}

class TabStore {
  tabs: TabItem[] = [{key: '/dashboard/overview', label: '系统概览', closable: false}];
  activeKey: string = '/dashboard/overview';
  maxTabs: number = 8;

  constructor() {
    makeAutoObservable(this);
  }

  setActiveKey = (key: string) => {
    this.activeKey = key;
  };

  addTab = (newTab: TabItem) => {
    if (this.tabs.find((t) => t.key === newTab.key)) {
      this.activeKey = newTab.key;
      return;
    }

    this.tabs.push(newTab);

    if (this.tabs.length > this.maxTabs) {
      const firstClosableIndex = this.tabs.findIndex(t => t.closable !== false);
      if (firstClosableIndex !== -1) {
        this.tabs.splice(firstClosableIndex, 1);
      }
    }

    this.activeKey = newTab.key;
  };

  removeTab = (targetKey: string): string | null => {
    let newActiveKey = this.activeKey;
    let lastIndex = -1;

    this.tabs.forEach((tab, i) => {
      if (tab.key === targetKey) {
        lastIndex = i - 1;
      }
    });

    this.tabs = this.tabs.filter((tab) => tab.key !== targetKey);

    if (this.tabs.length && this.activeKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = this.tabs[lastIndex].key;
      } else {
        newActiveKey = this.tabs[0].key;
      }
    }

    this.activeKey = newActiveKey;
    return newActiveKey;
  };
}

const tabStore = new TabStore();
export const useTabStore = () => tabStore;
