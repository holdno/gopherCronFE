import { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import Cookies from 'js-cookie';

import {
  login,
  Project,
  projectList,
  User,
  userInfo,
  Task,
  taskList,
  saveTask,
  recentLog,
  RecentLogCount,
  createProject,
  deleteProject,
} from './request';
import { AxiosInstance } from 'axios';
import { QVueGlobals } from 'quasar';
// 为 store state 声明类型
export interface State {
  logined: boolean;
  user?: User;
  token?: string;
  apiv1?: AxiosInstance;
  $q?: QVueGlobals;

  projects: Project[];
  tasks: Task[];

  recentLogCountRecords: RecentLogCount[];

  currentError?: Error;
}

// 定义 injection key
export const key: InjectionKey<Store<State>> = Symbol('Vuex Store');

// 创建一个新的 store 实例
export const COOKIE_TOKEN = 'access-token';
export const store = createStore<State>({
  devtools: import.meta.env.DEV,
  strict: import.meta.env.DEV,
  state() {
    return {
      logined: false,
      projects: [],
      tasks: [],
      recentLogCountRecords: [],
    };
  },
  getters: {
    apiv1(state): AxiosInstance {
      const api = state.apiv1;
      if (api === undefined) {
        throw new Error('Api V1 instance not found');
      }
      return api;
    },
    $q(state): QVueGlobals {
      const q = state.$q;
      if (q === undefined) {
        throw new Error('Quasar api instance not found');
      }
      return q;
    },
  },
  mutations: {
    setApi(state, { apiv1 }) {
      state.apiv1 = apiv1;
    },
    setQuasar(state, { $q }) {
      state.$q = $q;
    },
    authed(state, { user, token }) {
      state.user = user;
      state.token = token;
      state.logined = true;
      Cookies.set(COOKIE_TOKEN, token, { expires: 7 });
      const api = state.apiv1;
      if (api) api.defaults.headers.common[COOKIE_TOKEN] = token;
    },
    unauthed(state) {
      state.user = undefined;
      state.token = undefined;
      state.logined = false;
      Cookies.remove(COOKIE_TOKEN);
      const api = state.apiv1;
      if (api) delete api.defaults.headers.common[COOKIE_TOKEN];
    },
    error(state, { error }) {
      state.currentError = error;
      const q = state.$q;
      if (q)
        q.notify({
          message: error.message,
          color: 'red',
          icon: 'announcement',
          position: 'top',
        });
      else throw error;
    },
    clearError(state) {
      state.currentError = undefined;
    },
    setProjects(state, { projects }) {
      state.projects = projects;
    },
    setTasks(state, { tasks }) {
      state.tasks = tasks;
    },
    updateTask(state, { task }) {
      const idx = state.tasks.findIndex((t) => t.id === task.id);
      if (idx === -1) {
        return;
      }
      state.tasks[idx] = task;
    },
    setRecentLogCount(state, { records }) {
      state.recentLogCountRecords = records;
    },
  },
  actions: {
    async checkLogin({ commit, state }) {
      if (state.logined) return;

      const token = Cookies.get(COOKIE_TOKEN);
      if (token === undefined) {
        commit('unauthed');
        return;
      }
      try {
        const api = this.getters.apiv1;
        api.defaults.headers.common[COOKIE_TOKEN] = token;
        const user = await userInfo(api);
        commit('authed', { user, token });
      } catch (e) {
        commit('unauthed');
        commit('error', { message: e });
      }
    },
    async login({ commit }, { username, password }) {
      const api = this.getters.apiv1;
      try {
        const [user, token] = await login(api, username, password);
        commit('authed', { user, token });
      } catch (e) {
        commit('error', { error: e });
      }
    },
    async fetchProjects({ commit }) {
      const api = this.getters.apiv1;
      try {
        const projects = await projectList(api);
        commit('setProjects', { projects });
      } catch (e) {
        commit('error', { error: e });
      }
    },
    async fetchTasks({ commit }, { projectId }) {
      const api = this.getters.apiv1;
      try {
        const tasks = await taskList(api, projectId);
        commit('setTasks', { tasks });
      } catch (e) {
        commit('error', { error: e });
      }
    },
    async saveTask({ commit }, { task }) {
      const api = this.getters.apiv1;
      try {
        const oldOrNew = await saveTask(api, task);
        commit('updateTask', { task });
        return oldOrNew;
      } catch (e) {
        commit('error', { error: e });
      }
    },
    async recentLog({ commit }) {
      const api = this.getters.apiv1;
      try {
        const recentLogCount = await recentLog(api);
        commit('setRecentLogCount', { records: recentLogCount });
      } catch (e) {
        commit('error', { error: e });
      }
    },
    async createProject({ dispatch, commit }, { title, remark }) {
      const api = this.getters.apiv1;
      try {
        await createProject(api, title, remark);
        await dispatch('fetchProjects');
      } catch (e) {
        commit('error', { error: e });
      }
    },
    async deleteProject({ dispatch, commit }, { projectId }) {
      const api = this.getters.apiv1;
      try {
        await deleteProject(api, projectId);
        await dispatch('fetchProjects');
      } catch (e) {
        commit('error', { error: e });
      }
    },
  },
});

// 定义自己的 `useStore` 组合式函数
export function useStore() {
  const store = baseUseStore(key);
  return store;
}
