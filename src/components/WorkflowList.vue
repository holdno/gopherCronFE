<template>
  <div class="tw-h-full tw-w-full">
    <q-dialog v-model="showAddDialog" :no-backdrop-dismiss="!canDismiss">
      <q-card class="tw-w-96 q-pa-sm">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">创建任务编排</div>
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="newWorkflow.title"
              type="text"
              label="名称"
              square
              filled
              class="tw-mb-4"
            />
            <q-input
              key="cron"
              v-model="newWorkflow.cronExpr"
              label="调度计划 (*秒 *分 *时 *日 *月 *周 *年)"
              square
              filled
              class="tw-mb-4"
            />
            <q-input
              v-model="newWorkflow.remark"
              type="textarea"
              label="备注"
              square
              filled
            />
          </q-card-section>
          <q-card-actions align="around">
            <q-btn
              color="primary"
              text-color="black"
              type="submit"
              label="创建"
              :disable="!canSubmit"
              class="lg:tw-w-24 tw-w-full lg:tw-mr-4 lg:tw-mb-0 tw-mb-4"
            />
            <q-btn
              v-close-popup
              flat
              label="取消"
              class="lg:tw-w-24 tw-w-full"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
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
      selection="single"
      :selected="
        workflows.filter((f) => f.id === Number($route.params.workflowId))
      "
      @request="updatePagination"
    >
      <template #top>
        <q-btn flat icon="add" @click="showAddDialog = true" />
        <q-btn flat :loading="loading" icon="refresh" @click="refresh" />
      </template>
      <template #body-selection="scope">
        <q-icon
          name="check"
          color="primary"
          size="2em"
          :class="scope.selected ? '' : 'tw-opacity-0'"
        />
      </template>
      <template #body-cell-cron="props">
        <q-td key="cron" class="text-right">
          {{ props.value }}
          <q-popup-edit
            v-slot="scope"
            fit
            title="调度计划"
            :model-value="props.value"
            buttons
            @save="(value: string) => updateCron(props.row, value)"
          >
            <q-input
              v-model="scope.value"
              dense
              autofocus
              hint="秒 分 时 日 月 周 年"
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
      </template>
      <template #body-cell-state="props">
        <q-td key="state" class="text-right">
          <q-spinner-gears
            v-if="isRunning(props.row)"
            color="primary"
            size="2em"
            style="margin-left: auto; margin-right: 0"
          />
          <q-icon v-else name="check_circle" color="primary" size="2em" />
        </q-td>
      </template>
      <template #body-cell-status="props">
        <q-td key="status" class="text-right">
          <q-toggle
            color="primary"
            :model-value="props.value !== 2"
            @update:model-value="(v) => updateStatus(props.row, v)"
          />
        </q-td>
      </template>
      <template #body-cell-operation="props">
        <q-td key="operation">
          <div class="text-right tw-grid tw-gap-4">
            <q-btn
              :to="{ name: 'workflow', params: { workflowId: props.row.id } }"
              dense
              flat
              color="primary"
              >详情
            </q-btn>
            <q-btn
              v-if="!isRunning(props.row)"
              dense
              flat
              color="primary"
              @click="
                () =>
                  startWorkflow(store.getters.apiv1, props.row.id).then(refresh)
              "
              >运行</q-btn
            >
            <q-btn
              v-else
              dense
              flat
              color="red"
              @click="
                () =>
                  killWorkflow(store.getters.apiv1, props.row.id).then(refresh)
              "
            >
              Kill
            </q-btn>
            <q-btn
              dense
              flat
              :to="{
                name: 'workflow_logs',
                params: { workflowId: props.row.id },
              }"
              >日志</q-btn
            >
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, watchEffect, ref, computed } from 'vue';
  import { useStore } from '../store';
  import { Pagination, TableRequestProp } from '../utils/qusar';
  import { startWorkflow, killWorkflow } from '../request';

  const store = useStore();

  const total = computed(() => store.state.workflowsTotal);
  const loading = computed(() => store.state.loadingWorkflows);
  const workflows = computed(() => store.state.workflows);
  const columns = [
    { name: 'id', field: 'id', label: 'ID' },
    { name: 'title', field: 'title', label: '名称' },
    { name: 'remark', field: 'remark', label: '备注' },
    { name: 'cron', field: 'cronExpr', label: '调度计划' },
    { name: 'status', field: 'status', label: '启用状态' },
    {
      name: 'state',
      field: 'state',
      label: '运行状态',
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

  function isRunning(workflow: any): boolean {
    return workflow.state && workflow.state.status === 'running';
  }

  function updateStatus(workflow: any, enable: boolean) {
    store
      .dispatch('updateWorkflow', {
        workflow: { ...workflow, status: enable ? 1 : 2 },
      })
      .then(refresh);
  }

  function updateCron(workflow: any, cronExpr: string) {
    store
      .dispatch('updateWorkflow', {
        workflow: { ...workflow, cronExpr },
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

  const defaultWorkflow = {
    title: '',
    remark: '',
    cronExpr: '0 0 0 * * * *',
  };
  const showAddDialog = ref(false);
  const newWorkflow = ref(Object.assign({}, defaultWorkflow));
  const canDismiss = computed(() => {
    const p = newWorkflow.value;
    return p.title.trim() === '' && p.remark.trim() === '';
  });
  const canSubmit = computed(() => {
    const p = newWorkflow.value;
    return p.title.trim() !== '' && p.cronExpr.trim() !== '';
  });
  watchEffect(() => {
    if (!showAddDialog.value) {
      newWorkflow.value = Object.assign({}, defaultWorkflow);
    }
  });
  async function onSubmit() {
    const p = newWorkflow.value;
    store.commit('clearError');
    await store.dispatch('createWorkflow', {
      title: p.title.trim(),
      remark: p.remark.trim(),
      cronExpr: p.cronExpr.trim(),
    });
    if (store.state.currentError === undefined) {
      showAddDialog.value = false;
      refresh();
    }
  }
</script>
