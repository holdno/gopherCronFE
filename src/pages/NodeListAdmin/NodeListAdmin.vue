<template>
  <div class="tw-w-full tw-p-4">
    <div class="q-dark tw-w-full tw-rounded tw-overflow-hidden">
      <div class="tw-px-4 tw-py-4">
        <div class="sm:tw-flex tw-items-center tw-justify-between">
          <p
            tabindex="0"
            class="focus:tw-outline-none tw-text-base sm:tw-text-lg md:tw-text-xl lg:tw-text-2xl tw-font-bold tw-leading-normal tw-text-primary"
          >
            节点管理
          </p>
          <div class="tw-mt-4 sm:tw-mt-0"></div>
        </div>
      </div>
      <div class="q-dark tw-px-4 tw-pb-5">
        <div class="tw-overflow-x-auto">
          <table class="tw-w-full tw-whitespace-nowrap">
            <tbody>
              <NodeItem
                v-for="node in nodeList"
                :key="node.clientIP"
                :node="node"
              ></NodeItem>
            </tbody>
          </table>
        </div>
        <q-inner-loading :showing="loading">
          <q-spinner color="primary" />
        </q-inner-loading>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useStore } from '@/store';
  import { Ref, ref } from 'vue';
  import NodeItem from './NodeItem.vue';
  import { getClientList, Node } from '@/api/node';

  const store = useStore();

  const nodeList: Ref<Node[]> = ref([]);
  const loading = ref(false);
  const getList = async () => {
    loading.value = true;
    try {
      const res = await getClientList({ projectIDs: [] });
      if (res.meta.code === 0) {
        nodeList.value = res.nodeList;
      } else {
        store.commit('error', { message: res.meta.message });
      }
    } catch (e) {
      store.commit('error', { message: e });
    }
    loading.value = false;
  };
  getList();
</script>
