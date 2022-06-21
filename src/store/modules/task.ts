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
