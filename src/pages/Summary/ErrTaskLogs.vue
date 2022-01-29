<template>
  <q-table
    ref="table"
    v-model:pagination="pagination"
    class="tw-w-full tw-bg-[#121212]"
    :rows-per-page-options="[5, 10, 15]"
    title="错误日志"
    title-class="tw-text-white"
    :rows="logs"
    :loading="loading"
    row-key="id"
    color="primary"
    flat
    hide-header
    @request="updatePagination"
  >
    <template #top-right>
      <q-btn flat dense :loading="loading" icon="refresh" @click="getLogList" />
    </template>
    <template #no-data>
      <div
        class="full-width tw-mt-4 row flex-center tw-text-white tw-text-lg q-gutter-sm"
      >
        <q-icon size="2em" name="sentiment_dissatisfied" />
        <span> 暂无数据 </span>
      </div>
    </template>
    <template #loading>
      <q-inner-loading showing color="primary" />
    </template>
    <template #body="scope">
      <q-card class="tw-m-4" flat bordered>
        <q-item>
          <q-item-section>
            <q-item-label overline>任务名称</q-item-label>
            <q-item-label>
              {{ scope.row.taskName }}
            </q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label overline>项目名称</q-item-label>
            <q-item-label>
              {{ scope.row.projectName }}
            </q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label overline>节点 IP</q-item-label>
            <q-item-label>
              {{ scope.row.clientIP }}
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
  import { QTable } from 'quasar';
  import { Ref, nextTick, onMounted, ref, watchEffect } from 'vue';

  import { TaskLog, getSummaryErrorLogs } from '@/api/log';
  import JSONViewer from '@/components/JSONViewer.vue';
  import { formatTimestamp } from '@/utils/datetime';
  import { Pagination, TableRequestProp } from '@/utils/quasar';

  const logs: Ref<TaskLog[]> = ref([]);
  const total = ref(0);
  const loading = ref(false);
  const pagination = ref<Pagination>({
    sortBy: '',
    descending: false,
    page: 1,
    rowsPerPage: 5,
    rowsNumber: 0,
  });

  const getLogList = async () => {
    loading.value = true;
    try {
      const resp = await getSummaryErrorLogs({
        page: pagination.value.page,
        pagesize: pagination.value.rowsPerPage,
      });
      if (resp.list) {
        total.value = resp.total;
        logs.value = resp.list;
      }
    } catch (e) {
      console.log(e);
    }
    loading.value = false;
  };
  getLogList();

  const table = ref<QTable>();
  onMounted(() => {
    // 设置 table fixed
    nextTick(() => {
      table.value?.$el
        .querySelector('table.q-table')
        .classList.add('tw-table-fixed');
    });
  });

  async function updatePagination({
    pagination: { page, rowsPerPage },
  }: TableRequestProp) {
    const p = pagination.value;
    p.page = page;
    p.rowsPerPage = rowsPerPage;
    await getLogList();
    nextTick(() => {
      window.scrollTo({ top: table.value?.$el.offsetTop || 0 });
    });
  }
  watchEffect(() => {
    const p = pagination.value;
    p.rowsNumber = total.value;
  });
</script>
