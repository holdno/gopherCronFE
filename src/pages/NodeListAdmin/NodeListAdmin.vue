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
      <div class="q-dark tw-px-4 tw-pb-5 tw-min-h-50 tw-relative">
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
        <q-inner-loading size="md" :showing="loading"></q-inner-loading>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Ref, ref } from 'vue';

  import NodeItem from './NodeItem.vue';

  import { Node, getClientList } from '@/api/node';
  import { useStore } from '@/store/index';

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
      console.log(e);
    }
    loading.value = false;
  };
  getList();
</script>
