import { WorkFlow } from '@/api/request';
import { fetchWorkFlows } from '@/api/workflow';
import { ActionTree, Module, MutationTree } from 'vuex';
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
};

const mutations: MutationTree<State> = {
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
