import { ActionTree, Module, MutationTree } from 'vuex';



import { WorkFlow } from '@/api/request';
import { deleteWorkFlow, fetchWorkFlowDetail, fetchWorkFlows } from '@/api/workflow';
import { State as RootState } from '@/store/index';


export const NameSpace = 'WorkFlow';

export interface State {
  workflows: Map<number, WorkFlow>;
  totalCount: number;
  loadingWorkflows: boolean;
}

const actions: ActionTree<State, RootState> = {
  async fetchWorkFlows({ commit }, { orgId, page, pageSize }) {
    let workflows, total;
    try {
      commit('loadingWorkflows');
      [workflows, total] = await fetchWorkFlows(orgId, page, pageSize);
      commit('appendWorkFlows', { workflows, total });
    } catch (e: any) {
      console.error(e);
    }
    commit('unloadingWorkflows');
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
  loadingWorkflows(state) {
    state.loadingWorkflows = true;
  },
  unloadingWorkflows(state) {
    state.loadingWorkflows = false;
  },
  updateWorkFlow(state, { workflow }: { workflow: WorkFlow }) {
    state.workflows.set(workflow.id, workflow);
  },
  appendWorkFlows(
    state,
    { workflows, total }: { workflows: WorkFlow[]; total: number },
  ) {
    if (workflows) {
      for (const w of workflows) {
        state.workflows.set(w.id, w);
      }
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
    loadingWorkflows: false,
  }),
  actions: actions,
  mutations: mutations,
};

export default store;