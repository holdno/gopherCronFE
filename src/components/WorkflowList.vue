<template>
  <q-table
    v-model:pagination="pagination"
    class="tw-w-full tw-h-full"
    :rows-per-page-options="[10, 20, 30]"
    title="任务编排"
    :rows="workflows"
    :columns="columns"
    :loading="loading"
    row-key="id"
    color="primary"
    flat
    @request="updatePagination"
  >
    <template #body-cell-status="props">
      <td key="status">
        <q-toggle
          color="primary"
          :model-value="props.value !== 2"
          @update:model-value="(v) => updateStatus(props.row, v)"
        />
      </td>
    </template>
    <template #body-cell-operation="props">
      <td key="operation" class="tw-grid tw-gap-4">
        <q-btn
          :to="{ name: 'workflow', params: { workflowId: props.row.id } }"
          dense
          flat
          color="primary"
          >详情
        </q-btn>
      </td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
  import { onMounted, watchEffect, ref, computed } from 'vue';
  import { Workflow } from '../request';
  import { useStore } from '../store';
  import { Pagination, TableRequestProp } from '../utils/qusar';

  const store = useStore();

  const total = computed(() => store.state.workflowsTotal);
  const loading = computed(() => store.state.loadingWorkflows);
  const workflows = computed(() => store.state.workflows);
  const columns = [
    { name: 'id', field: 'id', label: 'ID' },
    { name: 'title', field: 'title', label: '名称' },
    { name: 'remark', field: 'remark', label: '备注' },
    { name: 'cronExpr', field: 'cronExpr', label: '计划任务' },
    { name: 'status', field: 'status', label: '启用状态' },
    {
      name: 'state',
      field: 'state',
      label: '运行状态',
      format: (v: any) => JSON.stringify(v),
    },
    { name: 'operation', field: () => null, label: '操作' },
  ];
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

  function updateStatus(workflow: Workflow, enable: boolean) {
    store
      .dispatch('updateWorkflow', {
        workflow: { ...workflow, status: enable ? 1 : 2 },
      })
      .then(refresh);
  }

  async function refresh() {
    const p = pagination.value;
    await store.dispatch('fetchWorkflows', {
      page: p.page,
      pageSize: p.rowsPerPage,
    });
  }

  onMounted(() => {
    watchEffect(() => {
      const p = pagination.value;
      p.rowsNumber = total.value;
    });
    watchEffect(async () => {
      refresh();
    });
  });
</script>
