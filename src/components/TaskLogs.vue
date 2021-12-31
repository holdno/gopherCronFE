<template>
  <q-table
    v-model:pagination="pagination"
    :rows-per-page-options="[10, 20, 30]"
    title="任务执行日志"
    :rows="logs"
    :columns="columns"
    :loading="loading"
    row-key="id"
    color="primary"
    @request="updatePagination"
  />
</template>

<script setup lang="ts">
  import { onMounted, computed, ref, watchEffect } from 'vue';
  import { useStore } from '../store';
  import { formatTimestamp } from '../utils/datetime';
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

  interface Pagination {
    sortBy: string;
    descending: boolean;
    page: number;
    rowsPerPage: number;
    rowsNumber?: number;
  }
  const pagination = ref<Pagination>({
    sortBy: '',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });
  interface RequestProp {
    pagination: Pagination;
  }
  function updatePagination({
    pagination: { page, rowsPerPage },
  }: RequestProp) {
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
