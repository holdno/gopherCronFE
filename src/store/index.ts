import StoreRoot, { State as StateRoot } from '@/store/modules/root';
import StoreWorkFlow, {
  State as StateWorkFlow,
  NameSpace as NameSpaceWorkFlow,
} from '@/store/modules/workflow';
import { FireTowerPlugin } from '@/utils/FireTower';
import { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';

export interface State {
  Root: StateRoot;
  [NameSpaceWorkFlow]: StateWorkFlow;
}

export const store = createStore<State>({
  plugins: [FireTowerPlugin],
  modules: {
    Root: StoreRoot,
    WorkFlow: StoreWorkFlow,
  },
  devtools: import.meta.env.DEV,
  strict: import.meta.env.DEV,
});
export const key: InjectionKey<Store<State>> = Symbol('Vuex Store');

// 定义自己的 `useStore` 组合式函数
export function useStore() {
  const store = baseUseStore(key);
  return store;
}
