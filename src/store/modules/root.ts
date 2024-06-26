import { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { QVueGlobals } from 'quasar';
import { ActionTree, GetterTree, Module, MutationTree } from 'vuex';

import { Org, createOrg, fetchUserOrgs, updateOrg } from '@/api/org';
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
  deleteProject,
  deleteTask,
  deleteWorkFlowTask,
  deleteWorkflow,
  fetchLogs,
  fetchWorkFlowLogs,
  fetchWorkflowEdges,
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
import router from '@/router';
import { State as RootState } from '@/store/index';
import { FireTower, FireTowerPlugin } from '@/utils/FireTower';
import { compareArrays } from '@/utils/utils';

export interface EventTask {
  status: string;
  taskId: string;
  tmpId: string;
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
  userOrgs?: Org[];
  currentOrg?: string;
  token?: string;
  apiv1?: AxiosInstance;
  $q?: QVueGlobals;
  firetower?: FireTower;
  subscribedTopic: string[];

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
  setTower(state, tower) {
    state.firetower = tower;
  },
  subscribedTopic(state, topics) {
    state.subscribedTopic = topics;
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
  userOrgs(state, orgs: Org[]) {
    if (orgs && orgs.length > 0) {
      const choosedOrg = localStorage.getItem('gc_choosed_org');
      let choosedExistOrg = false;
      orgs.forEach((v, k, a) => {
        if (v.id === choosedOrg) {
          choosedExistOrg = true;
        }
      });
      if (!choosedExistOrg) {
        localStorage.removeItem('gc_choosed_org');
      }
    }
    state.userOrgs = orgs;
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
        html: true,
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
        html: true,
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
        html: true,
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
  // loadingWorkflows(state) {
  //   state.loadingWorkflows = true;
  // },
  // unloadingWorkflows(state) {
  //   state.loadingWorkflows = false;
  // },
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
  setCurrentOrg(state, orgId) {
    state.currentOrg = orgId;
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
    commit('setNotificationSwitch', {
      status: !state.notificationSwitch,
    });
    localStorage.setItem(
      'gc_notification_setting',
      JSON.stringify({ status: state.notificationSwitch }),
    );
  },
  async refreshUserOrgs({ commit, state }) {},
  async logout({ commit, state }) {
    commit('unauthed');
    if (this.getters.firetower) {
      this.getters.firetower.close();
    }
  },
  switchOrg({ commit }, orgId: string) {
    commit('setCurrentOrg', orgId);
    router.push({ name: 'summary', params: { orgId: orgId } });
  },
  async checkLogin({ dispatch, commit, state }) {
    if (state.logined) return;

    const token = Cookies.get(COOKIE_TOKEN);
    if (token === undefined) {
      await dispatch('logout');
      return;
    }
    try {
      const api = this.getters.apiv1;
      api.defaults.headers.common[COOKIE_TOKEN] = token;
      const user = await userInfo(api);
      commit('authed', { user, token });
      FireTowerPlugin(user, this, token);
      const orgs = await fetchUserOrgs();
      commit('userOrgs', orgs);
    } catch (e) {
      await dispatch('logout');
      commit('error', { error: e });
    }
  },
  async login({ commit }, { username, password }) {
    const api = this.getters.apiv1;
    try {
      const [user, token] = await login(api, username, password);
      commit('authed', { user, token });
      FireTowerPlugin(user, this, token);
      const orgs = await fetchUserOrgs();
      commit('userOrgs', orgs);
    } catch (e) {
      commit('error', { error: e });
    }
  },
  async loginWithOIDC({ commit }, { code, state }) {
    const api = this.getters.apiv1;
    try {
      const [user, token] = await loginWithOIDC(api, code, state);
      commit('authed', { user, token });
      FireTowerPlugin(user, this, token);
      const orgs = await fetchUserOrgs();
      commit('userOrgs', orgs);
    } catch (e) {
      commit('error', { error: e });
    }
  },
  async saveTask({ commit }, { task }) {
    const api = this.getters.apiv1;
    try {
      const oldOrNew = await saveTask(api, task);
      if (oldOrNew) {
        task.isRunning = oldOrNew.isRunning;
      }
      commit('Task/updateTask', { task });
      commit('success', { message: '更新成功' });
      return oldOrNew;
    } catch (e) {
      commit('error', { error: e });
    }
  },
  subscribeTopic({ commit }, topics) {
    try {
      const subed = this.getters.subscribedTopic;
      if (subed && subed.length > 0) {
        if (compareArrays(subed, topics)) return;
        this.getters.firetower.unsubscribe(subed);
      }
      this.getters.firetower.subscribe(topics);
      commit('subscribedTopic', topics);
    } catch (e: any) {}
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
  async recentLog({ commit }, orgId) {
    const api = this.getters.apiv1;
    try {
      const recentLogCount = await recentLog(api, orgId);
      commit('setRecentLogCount', { records: recentLogCount });
    } catch (e) {
      commit('error', { error: e });
    }
  },
  async createOrg({ commit }, org: Org) {
    try {
      await createOrg(org);
      const orgs = await fetchUserOrgs();
      commit('userOrgs', orgs);
    } catch (e) {
      commit('error', { error: e });
    }
  },
  async updateOrg({ commit }, org: Org) {
    try {
      await updateOrg(org);
      const orgs = await fetchUserOrgs();
      commit('userOrgs', orgs);
    } catch (e) {
      commit('error', { error: e });
    }
  },
  async createProject({ dispatch, commit }, { title, remark, orgId }) {
    const api = this.getters.apiv1;
    try {
      await createProject(api, title, remark, orgId);
      await dispatch('Project/fetchProjects', { orgId: orgId });
    } catch (e) {
      commit('error', { error: e });
    }
  },
  async updateProject(
    { dispatch, commit },
    { projectId, title, remark, orgId },
  ) {
    const api = this.getters.apiv1;
    try {
      await updateProject(api, projectId, title, remark);
      await dispatch('Project/fetchProjects', { orgId: orgId });
    } catch (e) {
      commit('error', { error: e });
    }
  },
  async deleteProject({ dispatch, commit }, { projectId, orgId }) {
    const api = this.getters.apiv1;
    try {
      await deleteProject(api, projectId);
      await dispatch('Project/fetchProjects', { orgId: orgId });
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
  // async fetchWorkflows({ commit }, { orgId, page, pageSize }) {
  //   commit('loadingWorkflows');
  //   const api = this.getters.apiv1;
  //   try {
  //     const [workflows, total] = await fetchWorkflows(api,orgId, page, pageSize);
  //     commit('setWorkflows', { workflows, total });
  //   } catch (e) {
  //     commit('error', { error: e });
  //   }
  //   commit('unloadingWorkflows');
  // },
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
  firetower(state): FireTower | undefined {
    return state.firetower;
  },
  subscribedTopic(state): string[] {
    return state.subscribedTopic;
  },
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
  currentOrg(state): string {
    return state.currentOrg || '';
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
  currentOrg: '',
  logined: false,
  FireTower: undefined,
  subscribedTopic: [],

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
