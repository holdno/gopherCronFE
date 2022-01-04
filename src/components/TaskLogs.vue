<template>
  <q-table
    v-model:pagination="pagination"
    class="tw-w-full tw-h-full"
    :rows-per-page-options="[10, 20, 30]"
    title="任务执行日志"
    :rows="logs"
    :columns="columns"
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
  import { onMounted, computed, ref, watchEffect } from 'vue';
  import { useStore } from '../store';
  import { formatTimestamp } from '../utils/datetime';
  import { Pagination, TableRequestProp } from '../utils/qusar';
  const props = defineProps({
    id: {
      type: String,
      required: true,
    },
    projectId: {
      type: Number,
      required: true,
    },
  });
  const store = useStore();
  const logs = computed(() => store.state.taskLogs);
  const columns = [
    {
      name: 'startTime',
      label: '开始时间',
      field: 'startTime',
      format: (val: number) => formatTimestamp(val * 1000),
    },
    {
      name: 'endTime',
      label: '结束时间',
      field: 'endTime',
      format: (val: number) => formatTimestamp(val * 1000),
    },
    {
      name: 'clientIp',
      label: '节点 IP',
      field: 'clientIp',
    },
    {
      name: 'result',
      label: '结果',
      field: 'result',
    },
  ];
  const total = computed(() => store.state.taskLogsTotal);
  const loading = computed(() => store.state.loadingTaskLogs);
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
      await store.dispatch('fetchTaskLogs', {
        projectId: props.projectId,
        taskId: props.id,
        page: p.page,
        pageSize: p.rowsPerPage,
      });
    });
  });
</script>
