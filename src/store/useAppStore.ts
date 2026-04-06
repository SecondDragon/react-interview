import { makeAutoObservable, reaction } from 'mobx';

class AppStore {
  collapsed = false;
  theme: 'light' | 'dark' = 'light';

  constructor() {
    makeAutoObservable(this);
    
    // 从 localStorage 恢复数据
    const stored = localStorage.getItem('app-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state) {
          this.collapsed = parsed.state.collapsed ?? this.collapsed;
          this.theme = parsed.state.theme ?? this.theme;
        }
      } catch (e) {
        console.error('Failed to parse app-storage', e);
      }
    }

    // 自动保存到 localStorage
    reaction(
      () => ({
        collapsed: this.collapsed,
        theme: this.theme,
      }),
      (state: { collapsed: boolean; theme: 'light' | 'dark' }) => {
        localStorage.setItem('app-storage', JSON.stringify({ state }));
      }
    );
  }

  toggleCollapsed = () => {
    this.collapsed = !this.collapsed;
  };

  setTheme = (theme: 'light' | 'dark') => {
    this.theme = theme;
  };
}

const appStore = new AppStore();
export const useAppStore = () => appStore;
