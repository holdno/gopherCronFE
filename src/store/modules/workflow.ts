import { ActionTree, Module, MutationTree } from 'vuex';

import { WorkFlow } from '@/api/request';
import {
  deleteWorkFlow,
  fetchWorkFlowDetail,
  fetchWorkFlows,
} from '@/api/workflow';
import { State as RootState } from '@/store/index';

export const NameSpace = 'WorkFlow';

export interface State {
  workflows: Map<number, WorkFlow>;
  totalCount: number;
}

const actions: ActionTree<State, RootState> = {
  async fetchWorkFlows({ commit }, { page, pageSize }) {
    const [workflows, total] = await fetchWorkFlows(page, pageSize);
    commit('appendWorkFlows', { workflows, total });
    return [workflows, total];
  },
  async fetchWorkFlow({ commit }, { id }) {
    const workflow = await fetchWorkFlowDetail(id);
    commit('updateWorkFlow', { workflow });
  },
  async deleteWorkFlow({ commit }, { id }) {
    try {
      await deleteWorkFlow(id);
      commit('deleteWorkFlow', { id });
    } catch (e) {
      commit('error', { error: e }, { root: true });
    }
  },
};

const mutations: MutationTree<State> = {
  updateWorkFlow(state, { workflow }: { workflow: WorkFlow }) {
    state.workflows.set(workflow.id, workflow);
  },
  appendWorkFlows(
    state,
    { workflows, total }: { workflows: WorkFlow[]; total: number },
  ) {
    for (const w of workflows) {
      state.workflows.set(w.id, w);
    }
    state.totalCount = total;
  },
  clearWorkFlows(state) {
    state.workflows.clear();
    state.totalCount = 0;
  },
  deleteWorkFlow(state, { id }: { id: number }) {
    state.workflows.delete(id);
  },
};

const store: Module<State, RootState> = {
  namespaced: true,
  state: () => ({
    workflows: new Map<number, WorkFlow>(),
    totalCount: 0,
  }),
  actions: actions,
  mutations: mutations,
};

export default store;
