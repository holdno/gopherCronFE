import { ActionTree, Module, MutationTree } from 'vuex';

import { ClientMeta, fetchProjectClients, projectList } from '@/api/project';
import { Project } from '@/api/request';
import { State as RootState } from '@/store/index';

export const NameSpace = 'Project';

export interface State {
  projects: Project[];
  loadingProjects: boolean;

  projectClients: Map<number, ClientMeta[]>;
  loadingProjectClients: boolean;
}

const actions: ActionTree<State, RootState> = {
  async fetchProjects({ commit }, { orgId }) {
    commit('loadingProjects');
    try {
      const projects = await projectList(orgId);
      commit('setProjects', { projects });
    } catch (e) {
      commit('error', { error: e }, { root: true });
    }
    commit('unloadingProjects');
  },
  async fetchProjectClients({ commit }, { projectId }) {
    commit('loadingProjectClients');
    try {
      const clients = await fetchProjectClients(projectId);
      commit('setProjectClients', { projectId, clients });
    } catch (e) {
      commit('error', { error: e }, { root: true });
    }
    commit('unloadingProjectClients');
  },
};

const mutations: MutationTree<State> = {
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
  setProjectClients(state, { projectId, clients }) {
    state.projectClients.set(projectId, clients);
  },
};

const store: Module<State, RootState> = {
  namespaced: true,
  state: () => ({
    projects: [],
    projectClients: new Map(),
    loadingProjects: false,
    loadingProjectClients: false,
  }),
  actions,
  mutations,
};

export default store;
