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
  TaskLog,
  fetchLogs,
  Workflow,
  fetchWorkflows,
  WorkFlowEdge,
  fetchWorkflowEdges,
  updateWorkflowEdges,
  updateWorkflow,
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
  loadingProjects: boolean;
  tasks: Task[];
  loadingTasks: boolean;
  fetchTasksCache: Map<number, Task[]>;

  recentLogCountRecords: RecentLogCount[];

  taskLogs: TaskLog[];
  taskLogsTotal: number;
  loadingTaskLogs: boolean;

  workflows: Workflow[];
  workflowsTotal: number;
  loadingWorkflows: boolean;

  workflowEdges: WorkFlowEdge[];
  loadingWorkflowEdges: boolean;

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
      loadingProjects: false,
      tasks: [],
      loadingTasks: false,
      fetchTasksCache: new Map(),
      recentLogCountRecords: [],
      taskLogs: [],
      taskLogsTotal: 0,
      loadingTaskLogs: false,
      workflows: [],
      workflowsTotal: 0,
      loadingWorkflows: false,
      workflowEdges: [],
      loadingWorkflowEdges: false,
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
    isAdmin(state): boolean {
      return (
        state.user !== undefined && state.user.permissions.includes('admin')
      );
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
    loadingProjects(state) {
      state.loadingProjects = true;
    },
    unloadingProjects(state) {
      state.loadingProjects = false;
    },
    setProjects(state, { projects }) {
      state.projects = projects;
    },
    loadingTasks(state) {
      state.loadingTasks = true;
    },
    unloadingTasks(state) {
      state.loadingTasks = false;
    },
    setTasks(state, { projectId, tasks }) {
      if (projectId !== undefined) state.fetchTasksCache.set(projectId, tasks);
      state.tasks = tasks;
    },
    setTasksByCache(state, { projectId }) {
      const tasks = state.fetchTasksCache.get(projectId);
      if (tasks === undefined) {
        throw new Error(`fetchTasks Cache missing projectId=${projectId}`);
      }
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
    loadingLogs(state) {
      state.loadingTaskLogs = true;
    },
    unloadingLogs(state) {
      state.loadingTaskLogs = false;
    },
    setLogs(state, { logs, total }) {
      state.taskLogs = logs;
      state.taskLogsTotal = total;
    },
    loadingWorkflows(state) {
      state.loadingWorkflows = true;
    },
    unloadingWorkflows(state) {
      state.loadingWorkflows = false;
    },
    setWorkflows(state, { workflows, total }) {
      state.workflows = workflows;
      state.workflowsTotal = total;
    },
    loadingWorkflowEdges(state) {
      state.loadingWorkflowEdges = true;
    },
    unloadingWorkflowEdges(state) {
      state.loadingWorkflowEdges = false;
    },
    setWorkflowEdges(state, { edges }) {
      state.workflowEdges = edges;
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
      commit('loadingProjects');
      const api = this.getters.apiv1;
      try {
        const projects = await projectList(api);
        commit('setProjects', { projects });
      } catch (e) {
        commit('error', { error: e });
      }
      commit('unloadingProjects');
    },
    async fetchTasks({ commit, state }, { projectId, cached = false }) {
      commit('loadingTasks');
      const api = this.getters.apiv1;
      try {
        if (!cached || !state.fetchTasksCache.has(projectId)) {
          const tasks = await taskList(api, projectId);
          commit('setTasks', { tasks, projectId });
        } else {
          commit('setTasksByCache', { projectId });
        }
      } catch (e) {
        commit('error', { error: e });
      }
      commit('unloadingTasks');
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
    async fetchTaskLogs({ commit }, { projectId, taskId, page, pageSize }) {
      commit('loadingLogs');
      const api = this.getters.apiv1;
      try {
        const [logs, total] = await fetchLogs(
          api,
          projectId,
          taskId,
          page,
          pageSize,
        );
        commit('setLogs', { logs, total });
      } catch (e) {
        commit('error', { error: e });
      }
      commit('unloadingLogs');
    },
    async fetchWorkflows({ commit }, { page, pageSize }) {
      commit('loadingWorkflows');
      const api = this.getters.apiv1;
      try {
        const [workflows, total] = await fetchWorkflows(api, page, pageSize);
        commit('setWorkflows', { workflows, total });
      } catch (e) {
        commit('error', { error: e });
      }
      commit('unloadingWorkflows');
    },
    async fetchWorkflowEdges({ commit }, { workflowId }) {
      commit('loadingWorkflowEdges');
      const api = this.getters.apiv1;
      try {
        const edges = await fetchWorkflowEdges(api, workflowId);
        commit('setWorkflowEdges', { edges });
      } catch (e) {
        commit('error', { error: e });
      }
      commit('unloadingWorkflowEdges');
    },
    async updateWorkflow(
      { dispatch, commit },
      { workflow }: { workflow: Workflow },
    ) {
      const api = this.getters.apiv1;
      try {
        await updateWorkflow(api, workflow);
      } catch (e) {
        commit('error', { error: e });
      }
    },
    async updateWorkFlowEdges({ dispatch, commit }, { workflowId, edges }) {
      const api = this.getters.apiv1;
      try {
        await updateWorkflowEdges(api, workflowId, edges);
        await dispatch('fetchWorkflowEdges', { workflowId });
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
