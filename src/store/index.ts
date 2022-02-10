import { InjectionKey } from 'vue';
import { Store, useStore as baseUseStore, createStore } from 'vuex';

import StoreProject, {
  NameSpace as NameSpaceProject,
  State as StateProject,
} from '@/store/modules/project';
import StoreRoot, { State as StateRoot } from '@/store/modules/root';
import StoreWorkFlow, {
  NameSpace as NameSpaceWorkFlow,
  State as StateWorkFlow,
} from '@/store/modules/workflow';
import { FireTowerPlugin } from '@/utils/FireTower';

export interface State {
  Root: StateRoot;
  [NameSpaceWorkFlow]: StateWorkFlow;
  [NameSpaceProject]: StateProject;
}

export const store = createStore<State>({
  plugins: [FireTowerPlugin],
  modules: {
    Root: StoreRoot,
    WorkFlow: StoreWorkFlow,
    Project: StoreProject,
  },
  devtools: import.meta.env.DEV,
  strict: import.meta.env.DEV,
  // @ts-ignore:
  state: {},
});
export const key: InjectionKey<Store<State>> = Symbol('Vuex Store');

// 定义自己的 `useStore` 组合式函数
export function useStore() {
  const store = baseUseStore(key);
  return store;
}
