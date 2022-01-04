<template>
  <div class="q-pa-md">
    <q-table
      v-model:pagination="pagination"
      class="tw-w-full tw-h-full"
      :rows-per-page-options="[10, 20, 30]"
      title="任务编排"
      :rows="workflows"
      :loading="loading"
      row-key="id"
      color="primary"
      flat
      @request="updatePagination"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, watchEffect, ref, computed } from 'vue';
  import { useStore } from '../store';
  import { Pagination, TableRequestProp } from '../utils/qusar';

  const store = useStore();

  const total = computed(() => store.state.workflowsTotal);
  const loading = computed(() => store.state.loadingWorkflows);
  const workflows = computed(() => store.state.workflows);
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
  onMounted(() => {
    watchEffect(() => {
      const p = pagination.value;
      p.rowsNumber = total.value;
    });
    watchEffect(async () => {
      const p = pagination.value;
      await store.dispatch('fetchWorkflows', {
        page: p.page,
        pageSize: p.rowsPerPage,
      });
    });
  });
</script>
