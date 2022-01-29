<template>
  <q-table
    ref="logTable"
    v-model:pagination="pagination"
    class="tw-w-full tw-h-full tw-bg-[#121212]"
    :rows-per-page-options="[5, 10, 15]"
    :rows="logs"
    :loading="loading"
    row-key="id"
    color="primary"
    flat
    hide-header
    @request="updatePagination"
  >
    <template #loading>
      <q-inner-loading showing color="primary" />
    </template>
    <template #body="scope">
      <q-card class="tw-my-4 tw-x-full" flat bordered>
        <q-item>
          <q-item-section>
            <q-item-label overline>节点 IP</q-item-label>
            <q-item-label>
              {{ scope.row.clientIp }}
            </q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label overline>开始时间</q-item-label>
            <q-item-label>
              {{ formatTimestamp(scope.row.startTime * 1000) }}
            </q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label overline>结束时间</q-item-label>
            <q-item-label>
              {{ formatTimestamp(scope.row.endTime * 1000) }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-card-section class="tw-w-full tw-overflow-x-auto">
          <JSONViewer :json="scope.row.result" />
        </q-card-section>
      </q-card>
    </template>
  </q-table>
</template>

<script setup lang="ts">
  import { onMounted, computed, ref, watchEffect, nextTick } from 'vue';
  import { useStore } from '@/store/index';
  import { formatTimestamp } from '@/utils/datetime';
  import { Pagination, TableRequestProp } from '@/utils/quasar';
  import JSONViewer from '@/components/JSONViewer.vue';
  import { QTable } from 'quasar';
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

  const emits = defineEmits(['onpage']);
  const store = useStore();
  const logs = computed(() => store.state.Root.taskLogs);
  const total = computed(() => store.state.Root.taskLogsTotal);
  const loading = computed(() => store.state.Root.loadingTaskLogs);
  const pagination = ref<Pagination>({
    sortBy: '',
    descending: false,
    page: 1,
    rowsPerPage: 5,
    rowsNumber: 0,
  });

  const logTable = ref<QTable>();
  onMounted(() => {
    // 设置 table fixed
    nextTick(() => {
      logTable.value?.$el
        .querySelector('table.q-table')
        .classList.add('tw-table-fixed');
    });
  });

  function updatePagination({
    pagination: { page, rowsPerPage },
  }: TableRequestProp) {
    const p = pagination.value;
    p.page = page;
    p.rowsPerPage = rowsPerPage;
    emits('onpage');
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
