<template>
  <q-table
    v-model:pagination="pagination"
    class="tw-w-full tw-h-full"
    :rows-per-page-options="[5, 10, 15]"
    title="执行日志"
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
      <q-card class="tw-my-8 tw-mx-4" flat bordered>
        <q-item>
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

        <q-card-section>
          <pre
            :innerHTML="
              syntaxHighlight(
                JSON.stringify(JSON.parse(scope.row.result), null, 2),
              )
            "
          />
        </q-card-section>
      </q-card>
    </template>
  </q-table>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watchEffect } from 'vue';
  import { useStore } from '../store';
  import { Pagination, TableRequestProp } from '../utils/qusar';
  import { formatTimestamp } from '../utils/datetime';

  function syntaxHighlight(json: string) {
    json = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      },
    );
  }

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
    rowsPerPage: 5,
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

<style>
  pre {
    /* outline: 1px solid #ccc; */
    padding: 5px;
    margin: 5px;
  }
  .string {
    color: green;
  }
  .number {
    color: darkorange;
  }
  .boolean {
    color: blue;
  }
  .null {
    color: magenta;
  }
  .key {
    color: red;
  }
</style>
