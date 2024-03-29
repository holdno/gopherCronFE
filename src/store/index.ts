import { InjectionKey } from 'vue';
import { Store, useStore as baseUseStore, createStore } from 'vuex';

import StoreProject, {
  NameSpace as NameSpaceProject,
  State as StateProject,
} from '@/store/modules/project';
import StoreRoot, { State as StateRoot } from '@/store/modules/root';
import StoreTask, {
  NameSpace as NameSpaceTask,
  State as StateTask,
} from '@/store/modules/task';
import StoreWorkFlow, {
  NameSpace as NameSpaceWorkFlow,
  State as StateWorkFlow,
} from '@/store/modules/workflow';
import StoreWorkFlowTask, {
  NameSpace as NameSpaceWorkFlowTask,
  State as StateWorkFlowTask,
} from '@/store/modules/workflowTask';

export interface State {
  Root: StateRoot;
  [NameSpaceWorkFlow]: StateWorkFlow;
  [NameSpaceProject]: StateProject;
  [NameSpaceTask]: StateTask;
  [NameSpaceWorkFlowTask]: StateWorkFlowTask;
}

export const store = createStore<State>({
  // plugins: [FireTowerPlugin], // 登录后再建立websocket连接
  modules: {
    Root: StoreRoot,
    WorkFlow: StoreWorkFlow,
    Project: StoreProject,
    Task: StoreTask,
    WorkFlowTask: StoreWorkFlowTask,
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
