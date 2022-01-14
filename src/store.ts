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
  fetchTasks,
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
  createWorkflow,
  WorkflowTaskState,
  WorkFlowLog,
  fetchWorkFlowLogs,
  deleteTask,
  fetchProjectClients,
  deleteWorkflow,
  WorkFlowTask,
  fetchWorkFlowTasks,
  deleteWorkFlowTask,
  saveWorkFlowTask,
  createWorkFlowTask,
} from './request';
import { FireTowerPlugin } from './utils/FireTower';
import { AxiosInstance } from 'axios';
import { QVueGlobals } from 'quasar';

export interface EventTask {
  status: string;
  taskId: string;
  projectId: number;
}

export interface EventWorkFlow {
  status: string;
  workFlowId: number;
}

export interface EventWorkFlowTask {
  status: string;
  workFlowId: number;
  taskId: string;
  projectId: number;
}

// 为 store state 声明类型
export interface State {
  logined: boolean;
  user?: User;
  token?: string;
  apiv1?: AxiosInstance;
  $q?: QVueGlobals;

  projects: Project[];
  loadingProjects: boolean;

  projectClients: string[];
  loadingProjectClients: boolean;

  tasks: Task[];
  loadingTasks: boolean;
  fetchTasksCache: Map<number, Task[]>;

  workFlowTasks: WorkFlowTask[];
  loadingWorkFlowTasks: boolean;

  recentLogCountRecords: RecentLogCount[];

  taskLogs: TaskLog[];
  taskLogsTotal: number;
  loadingTaskLogs: boolean;

  workflows: Workflow[];
  workflowsTotal: number;
  loadingWorkflows: boolean;

  workflowEdges: WorkFlowEdge[];
  workflowTaskStates: WorkflowTaskState[];
  loadingWorkflowEdges: boolean;

  workflowLogs: WorkFlowLog[];
  workflowLogsTotal: number;
  loadingWorkflowLogs: boolean;

  eventTask?: EventTask;
  eventWorkFlow?: EventWorkFlow;
  eventWorkFlowTask?: EventWorkFlowTask;

  currentError?: Error;
}

export const ErrHandled = new Error('Handled');

// 创建一个新的 store 实例
export const COOKIE_TOKEN = 'access-token';
export const store = createStore<State>({
  plugins: [FireTowerPlugin],
  devtools: import.meta.env.DEV,
  strict: import.meta.env.DEV,
  state() {
    return {
      logined: false,
      projects: [],
      loadingProjects: false,

      projectClients: [],
      loadingProjectClients: false,

      tasks: [],
      loadingTasks: false,

      workFlowTasks: [],
      loadingWorkFlowTasks: false,

      fetchTasksCache: new Map(),
      recentLogCountRecords: [],
      taskLogs: [],
      taskLogsTotal: 0,
      loadingTaskLogs: false,
      workflows: [],
      workflowsTotal: 0,
      loadingWorkflows: false,
      workflowEdges: [],
      workflowTaskStates: [],
      loadingWorkflowEdges: false,
      workflowLogs: [],
      workflowLogsTotal: 0,
      loadingWorkflowLogs: false,
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
      if (error === ErrHandled) return;
      state.currentError = error;
      const q = state.$q;
      if (q)
        q.notify({
          message: error.message,
          color: 'red',
          icon: 'announcement',
          position: 'top-right',
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
    loadingProjectClients(state) {
      state.loadingProjectClients = true;
    },
    unloadingProjectClients(state) {
      state.loadingProjectClients = false;
    },
    setProjectClients(state, { clients }) {
      state.projectClients = clients;
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
    loadingWorkFlowTasks(state) {
      state.loadingWorkFlowTasks = true;
    },
    unloadingWorkFlowTasks(state) {
      state.loadingWorkFlowTasks = false;
    },
    setWorkFlowTasks(state, { workFlowTasks }) {
      state.workFlowTasks = workFlowTasks;
    },
    updateTask(state, { task }) {
      const idx = state.tasks.findIndex((t) => t.id === task.id);
      if (idx === -1) {
        return;
      }
      state.tasks[idx] = task;
    },
    updateWorkFlowTask(state, { task }) {
      const idx = state.workFlowTasks.findIndex((t) => t.id === task.id);
      if (idx === -1) {
        return;
      }
      state.workFlowTasks[idx] = task;
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
    setWorkflowEdges(state, { edges, states }) {
      state.workflowEdges = edges;
      state.workflowTaskStates = states;
    },
    loadingWorkflowLogs(state) {
      state.loadingWorkflowLogs = true;
    },
    unloadingWorkflowLogs(state) {
      state.loadingWorkflowLogs = false;
    },
    setWorkflowLogs(state, { logs, total }) {
      state.workflowLogs = logs;
      state.workflowLogsTotal = total;
    },
    emitEventTask(state, { event }) {
      state.eventTask = event;
    },
    emitEventWorkFlow(state, { event }) {
      state.eventWorkFlow = event;
    },
    emitEventWorkFlowTask(state, { event }) {
      state.eventWorkFlowTask = event;
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
    async fetchProjectClients({ commit }, { projectId }) {
      commit('loadingProjectClients');
      const api = this.getters.apiv1;
      try {
        const clients = await fetchProjectClients(api, projectId);
        commit('setProjectClients', { clients });
      } catch (e) {
        commit('error', { error: e });
      }
      commit('unloadingProjectClients');
    },
    async fetchTasks({ commit, state }, { projectId, cached = false }) {
      commit('loadingTasks');
      const api = this.getters.apiv1;
      try {
        if (!cached || !state.fetchTasksCache.has(projectId)) {
          const tasks = await fetchTasks(api, projectId);
          commit('setTasks', { tasks, projectId });
        } else {
          commit('setTasksByCache', { projectId });
        }
      } catch (e) {
        commit('error', { error: e });
      }
      commit('unloadingTasks');
    },
    async fetchWorkFlowTasks({ commit, state }, { projectId, cached = false }) {
      commit('loadingWorkFlowTasks');
      const api = this.getters.apiv1;
      try {
        const workFlowTasks = await fetchWorkFlowTasks(api, projectId);
        commit('setWorkFlowTasks', { workFlowTasks });
      } catch (e) {
        commit('error', { error: e });
      }
      commit('unloadingWorkFlowTasks');
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
    async saveWorkFlowTask({ commit }, { task }) {
      const api = this.getters.apiv1;
      try {
        if (task.id !== '') {
          await saveWorkFlowTask(api, task);
        } else {
          await createWorkFlowTask(
            api,
            task.projectId,
            task.name,
            task.command,
            task.remark,
            task.timeout,
          );
        }
        commit('updateWorkFlowTask', { task });
      } catch (e) {
        commit('error', { error: e });
      }
    },
    async deleteTask({ commit }, { projectId, taskId }) {
      const api = this.getters.apiv1;
      try {
        await deleteTask(api, projectId, taskId);
      } catch (e) {
        commit('error', { error: e });
      }
    },
    async deleteWorkFlowTask({ commit }, { projectId, taskId }) {
      const api = this.getters.apiv1;
      try {
        await deleteWorkFlowTask(api, projectId, taskId);
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
        const [edges, states] = await fetchWorkflowEdges(api, workflowId);
        commit('setWorkflowEdges', { edges, states });
      } catch (e) {
        commit('error', { error: e });
      }
      commit('unloadingWorkflowEdges');
    },
    async deleteWorkflow({ commit }, { workflowId }) {
      const api = this.getters.apiv1;
      try {
        await deleteWorkflow(api, workflowId);
      } catch (e) {
        commit('error', { error: e });
      }
    },
    async updateWorkflow({ commit }, { workflow }: { workflow: Workflow }) {
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
    async createWorkflow({ dispatch, commit }, { title, remark, cronExpr }) {
      const api = this.getters.apiv1;
      try {
        await createWorkflow(api, title, remark, cronExpr);
      } catch (e) {
        commit('error', { error: e });
      }
    },
    async fetchWorkFlowLogs({ commit }, { workflowId, page, pageSize }) {
      commit('loadingWorkflowLogs');
      const api = this.getters.apiv1;
      try {
        const [logs, total] = await fetchWorkFlowLogs(
          api,
          workflowId,
          page,
          pageSize,
        );
        commit('setWorkflowLogs', { logs, total });
      } catch (e) {
        commit('error', { error: e });
      }
      commit('unloadingWorkflowLogs');
    },
  },
});

// 定义 injection key
export const key: InjectionKey<Store<State>> = Symbol('Vuex Store');

// 定义自己的 `useStore` 组合式函数
export function useStore() {
  const store = baseUseStore(key);
  return store;
}
