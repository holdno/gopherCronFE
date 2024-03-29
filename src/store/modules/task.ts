import { ActionTree, Module, MutationTree } from 'vuex';

import { Task, TemporaryTask } from '@/api/request';
import { fetchTasks, fetchTemporaryTasks } from '@/api/task';
import { State as RootState } from '@/store/index';

export const NameSpace = 'Task';

export interface State {
  tasks: Map<number, Task[]>;
  loadingTasks: boolean;
  temporaryTasks: Map<number, TemporaryTask[]>;
  loadingTemporaryTasks: boolean;
}

const actions: ActionTree<State, RootState> = {
  async fetchTasks({ commit, state }, { projectId, cached = false }) {
    commit('loadingTasks');
    try {
      if (!cached || !state.tasks.has(projectId)) {
        const tasks = await fetchTasks(projectId);
        commit('setTasks', { tasks, projectId });
      }
    } catch (e) {
      commit('error', { error: e }, { root: true });
    }
    commit('unloadingTasks');
  },
  async fetchTemporaryTasks({ commit, state }, { projectId, cached = false }) {
    commit('loadingTemporaryTasks');
    try {
      if (!cached || !state.temporaryTasks.has(projectId)) {
        const tasks = await fetchTemporaryTasks(projectId);
        commit('setTemporaryTasks', { tasks, projectId });
      }
    } catch (e) {
      commit('error', { error: e }, { root: true });
    }
    commit('unloadingTemporaryTasks');
  },
};
const mutations: MutationTree<State> = {
  loadingTasks(state) {
    state.loadingTasks = true;
  },
  unloadingTasks(state) {
    state.loadingTasks = false;
  },
  setTasks(state, { projectId, tasks }) {
    state.tasks.set(projectId, tasks);
  },
  loadingTemporaryTasks(state) {
    state.loadingTemporaryTasks = true;
  },
  unloadingTemporaryTasks(state) {
    state.loadingTemporaryTasks = false;
  },
  setTemporaryTasks(state, { projectId, tasks }) {
    state.temporaryTasks.set(projectId, tasks);
  },
  clearTasks(state, { projectId }) {
    if (projectId !== undefined) state.tasks.delete(projectId);
    else state.tasks.clear();
  },
  updateTemporaryTaskStatus(
    state,
    data: {
      projectId: number;
      tmpId: string;
      isRunning: boolean;
      finished: boolean;
    },
  ) {
    const tasks = state.temporaryTasks.get(data.projectId);
    if (tasks === undefined) {
      return;
    }
    const idx = tasks.findIndex((t) => t.tmpId === data.tmpId);
    if (idx !== -1) {
      tasks[idx].scheduleStatus = !data.finished ? 1 : 0;
      tasks[idx].isRunning = data.isRunning ? 1 : 0;
    }
  },
  updateTaskStatus(
    state,
    data: { projectId: number; taskId: string; isRunning: boolean },
  ) {
    const tasks = state.tasks.get(data.projectId);
    if (tasks === undefined) {
      return;
    }
    const idx = tasks.findIndex((t) => t.id === data.taskId);
    if (idx !== -1) {
      tasks[idx].isRunning = data.isRunning === true ? 1 : 0;
    }
  },
  updateTask(state, { task }: { task: Task }) {
    const tasks = state.tasks.get(task.projectId);
    if (tasks === undefined) {
      return;
    }
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx === -1) {
      return;
    }
    tasks[idx] = task;
  },
};

const store: Module<State, RootState> = {
  namespaced: true,
  state: () => ({
    tasks: new Map(),
    loadingTasks: false,
    temporaryTasks: new Map(),
    loadingTemporaryTasks: false,
  }),
  actions,
  mutations,
};

export default store;
