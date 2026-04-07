import {makeAutoObservable} from 'mobx';

class UserStore {
  username: string = '';
  isLoggedIn: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setUser = (username: string) => {
    this.username = username;
    this.isLoggedIn = true;
  };

  logout = () => {
    this.username = '';
    this.isLoggedIn = false;
  };
}

const userStore = new UserStore();
export const useUserStore = () => userStore;
