import { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { QVueGlobals } from 'quasar';
import { ActionTree, GetterTree, Module, MutationTree } from 'vuex';

import {
  RecentLogCount,
  TaskLog,
  User,
  WorkFlow,
  WorkFlowEdge,
  WorkFlowLog,
  WorkFlowTask,
  WorkflowTaskState,
  createProject,
  createWorkFlowTask,
  createWorkflow,
  deleteProject,
  deleteTask,
  deleteWorkFlowTask,
  deleteWorkflow,
  fetchLogs,
  fetchWorkFlowLogs,
  fetchWorkflowEdges,
  fetchWorkflows,
  login,
  loginWithOIDC,
  recentLog,
  saveTask,
  saveWorkFlowTask,
  updateProject,
  updateWorkflow,
  updateWorkflowEdges,
  userInfo,
} from '@/api/request';
import {
  CreateUserRequest,
  GetUserListRequest,
  createUser,
  userList,
} from '@/api/user';
import { State as RootState } from '@/store/index';
import { FireTowerPlugin } from '@/utils/FireTower';

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

export interface State {
  notificationSwitch: boolean;
  logined: boolean;
  users?: User[];
  userTotal?: number;
  user?: User;
  token?: string;
  apiv1?: AxiosInstance;
  $q?: QVueGlobals;

  recentLogCountRecords: RecentLogCount[];

  taskLogs: TaskLog[];
  taskLogsTotal: number;
  loadingTaskLogs: boolean;

  workflows: WorkFlow[];
  workflowsTotal: number;
  loadingWorkflows: boolean;

  workflowEdges: WorkFlowEdge[];
  workflowTaskStates: WorkflowTaskState[];
  workflowTasks: WorkFlowTask[];
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

export const COOKIE_TOKEN = 'access-token';

const mutations: MutationTree<State> = {
  setApi(state, { apiv1 }) {
    state.apiv1 = apiv1;
  },
  setQuasar(state, { $q }) {
    state.$q = $q;
  },
  setNotificationSwitch(state, { status }) {
    state.notificationSwitch = status;
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
    if (api) {
      delete api.defaults.headers.common[COOKIE_TOKEN];
    }
  },
  error(state, { error }) {
    if (error === ErrHandled) return;
    state.currentError = error;
    const q = state.$q;
    if (q) {
      let message = error.message;
      if (!message) {
        message = error;
      }
      q.notify({
        message: message,
        color: 'red',
        icon: 'announcement',
        position: 'top-right',
        classes: 'first:tw-mt-14',
      });
    } else throw error;
  },
  success(state, { message, type = '' }: { message: string; type: string }) {
    if (message && state.$q) {
      // type: 'positive', 'negative', 'warning', 'info', 'ongoing'
      state.$q.notify({
        message: message,
        type: type || 'info',
        position: 'top-right',
        classes: 'first:tw-mt-14',
      });
    }
  },
  notifySuccess(
    state,
    { message, type = '' }: { message: string; type: string },
  ) {
    if (!state.notificationSwitch) {
      return;
    }
    if (message && state.$q) {
      // type: 'positive', 'negative', 'warning', 'info', 'ongoing'
      state.$q.notify({
        message: message,
        type: type || 'info',
        position: 'bottom-right',
      });
    }
  },
  cleanError(state) {
    state.currentError = undefined;
  },
  setUsers(state, { list, total }) {
    state.users = list;
    state.userTotal = total;
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
  setWorkflowEdges(state, { edges, states, tasks }) {
    state.workflowEdges = edges;
    state.workflowTaskStates = states;
    state.workflowTasks = tasks;
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
};

const actions: ActionTree<State, RootState> = {
  changeNotificationStatus({ commit, state }) {
    console.log('set setting', state.notificationSwitch);
    commit('setNotificationSwitch', {
      status: !state.notificationSwitch,
    });
    localStorage.setItem(
      'gc_notification_setting',
      JSON.stringify({ status: state.notificationSwitch }),
    );
  },
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
      FireTowerPlugin(this);
    } catch (e) {
      commit('unauthed');
      commit('error', { error: e });
    }
  },
  async login({ commit }, { username, password }) {
    const api = this.getters.apiv1;
    try {
      const [user, token] = await login(api, username,  password);
      commit('authed', { user, token });
    } catch (e) {
      commit('error', { error: e });
    }
  },
  async loginWithOIDC({ commit }, { code, state }) {
    const api = this.getters.apiv1;
    try {
      const [user, token] = await loginWithOIDC(api, code, state);
      commit('authed', { user, token });
    } catch (e) {
      commit('error', { error: e });
    }
  },
  async saveTask({ commit }, { task }) {
    const api = this.getters.apiv1;
    try {
      const oldOrNew = await saveTask(api, task);
      commit('Task/updateTask', { task });
      commit('success', { message: '更新成功' });
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
      commit('WorkFlowTask/updateTask', { task });
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
      await dispatch('Project/fetchProjects');
    } catch (e) {
      commit('error', { error: e });
    }
  },
  async updateProject({ dispatch, commit }, { projectId, title, remark }) {
    const api = this.getters.apiv1;
    try {
      await updateProject(api, projectId, title, remark);
      await dispatch('Project/fetchProjects');
    } catch (e) {
      commit('error', { error: e });
    }
  },
  async deleteProject({ dispatch, commit }, { projectId }) {
    const api = this.getters.apiv1;
    try {
      await deleteProject(api, projectId);
      await dispatch('Project/fetchProjects');
    } catch (e) {
      commit('error', { error: e });
    }
  },
  async fetchUsers({ dispatch, commit }, req: GetUserListRequest) {
    try {
      const res = await userList(req);
      commit('setUsers', { list: res.list, total: res.total });
    } catch (e) {
      commit('error', { error: e });
    }
  },
  async createUser({ dispatch, commit }, user: CreateUserRequest) {
    try {
      await createUser(user);
      await dispatch('fetchUsers');
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
      const [edges, states, tasks] = await fetchWorkflowEdges(api, workflowId);
      commit('setWorkflowEdges', { edges, states, tasks });
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
  async updateWorkflow({ commit }, { workflow }: { workflow: WorkFlow }) {
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
};

const getters: GetterTree<State, RootState> = {
  notificationSetting(state): { status: boolean } {
    return { status: state.notificationSwitch };
  },
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
    return state.user !== undefined && state.user.permissions.includes('admin');
  },
  currentUser(state): User {
    if (state.user === undefined) {
      // router.push({ name: 'login' });
      throw new Error('User is not login');
    }
    return state.user;
  },
};

export const defaultState = {
  notificationSwitch: (() => {
    const localSetting = localStorage.getItem('gc_notification_setting');
    if (localSetting) {
      try {
        const ls = JSON.parse(localSetting);
        if (ls.status !== undefined) {
          return ls.status;
        }
      } catch (e: any) {
        console.error(e);
      }
    }
    return true;
  })(),
  logined: false,

  workFlowTasks: [],
  loadingWorkFlowTasks: false,
  fetchWorkFlowTasksCache: new Map(),

  recentLogCountRecords: [],
  taskLogs: [],
  taskLogsTotal: 0,
  loadingTaskLogs: false,
  workflows: [],
  workflowsTotal: 0,
  loadingWorkflows: false,

  workflowEdges: [],
  workflowTaskStates: [],
  workflowTasks: [],

  loadingWorkflowEdges: false,
  workflowLogs: [],
  workflowLogsTotal: 0,
  loadingWorkflowLogs: false,
};

const store: Module<State, RootState> = {
  state: () => defaultState,
  actions: actions,
  mutations: mutations,
  getters: getters,
};

export default store;
