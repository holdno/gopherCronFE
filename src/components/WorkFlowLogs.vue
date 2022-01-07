<template>
  <q-table
    v-model:pagination="pagination"
    class="tw-w-full tw-h-full"
    :rows-per-page-options="[10, 20, 30]"
    title="执行日志"
    :rows="logs"
    :loading="loading"
    row-key="id"
    color="primary"
    flat
    @request="updatePagination"
  >
    <template #loading>
      <q-inner-loading showing color="primary" />
    </template>
  </q-table>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watchEffect } from 'vue';
  import { useStore } from '../store';
  import { Pagination, TableRequestProp } from '../utils/qusar';

  const props = defineProps({
    id: {
      type: Number,
      required: true,
    },
  });
  const store = useStore();
  const logs = computed(() => store.state.workflowLogs);
  const total = computed(() => store.state.workflowLogsTotal);
  const loading = computed(() => store.state.loadingWorkflowLogs);
  const pagination = ref<Pagination>({
    sortBy: '',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });
  function updatePagination({
    pagination: { page, rowsPerPage },
  }: TableRequestProp) {
    const p = pagination.value;
    p.page = page;
    p.rowsPerPage = rowsPerPage;
  }
  watchEffect(() => {
    const p = pagination.value;
    p.rowsNumber = total.value;
  });

  onMounted(async () => {
    watchEffect(async () => {
      const p = pagination.value;
      await store.dispatch('fetchWorkFlowLogs', {
        workflowId: props.id,
        page: p.page,
        pageSize: p.rowsPerPage,
      });
    });
  });
</script>
