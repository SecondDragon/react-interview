import { makeAutoObservable } from 'mobx';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

class TodoStore {
  todos: Todo[] = [
    { id: 1, text: '学习 React 19', completed: true },
    { id: 2, text: '掌握 MobX 状态管理', completed: false },
  ];

  constructor() {
    makeAutoObservable(this);
  }

  addTodo = (text: string) => {
    this.todos.push({ id: Date.now(), text, completed: false });
  };

  removeTodo = (id: number) => {
    this.todos = this.todos.filter((todo) => todo.id !== id);
  };

  toggleTodo = (id: number) => {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  };
}

const todoStore = new TodoStore();
export const useTodoStore = () => todoStore;
