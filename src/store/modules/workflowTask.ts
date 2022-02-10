import { ActionTree, Module, MutationTree } from 'vuex';

import { WorkFlowTask } from '@/api/request';
import { fetchTasks } from '@/api/workflowTask';
import { State as RootState } from '@/store/index';

export const NameSpace = 'WorkFlowTask';

export interface State {
  tasks: Map<number, WorkFlowTask[]>;
  loadingTasks: boolean;
}

const actions: ActionTree<State, RootState> = {
  async fetchTasks({ commit, state }, { projectId, cached = false }) {
    commit('loadingTasks');
    try {
      if (!cached || !state.tasks.has(projectId)) {
        const tasks = await fetchTasks(projectId);
        commit('setTasks', { projectId, tasks });
      }
    } catch (e) {
      commit('error', { error: e }, { root: true });
    }
    commit('unloadingTasks');
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
  clearTasks(state, { projectId }) {
    if (projectId !== undefined) state.tasks.delete(projectId);
    else state.tasks.clear();
  },
  updateTask(state, { task }: { task: WorkFlowTask }) {
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
  }),
  actions,
  mutations,
};

export default store;
