<template>
  <q-table
    v-model:pagination="pagination"
    class="tw-w-full tw-h-full"
    :rows-per-page-options="[10, 20, 30]"
    title="执行日志"
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
    <template #body-cell-result="props">
      <q-td key="result">
        <!-- <pre>{{ JSON.stringify(JSON.parse(props.value), null, 2) }}</pre> -->
        <pre
          :innerHTML="
            syntaxHighlight(JSON.stringify(JSON.parse(props.value), null, 2))
          "
        />
      </q-td>
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
        var cls = 'number';
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
      name: 'createTime',
      label: '创建时间',
      field: 'createTime',
      format: (val: number) => formatTimestamp(val * 1000),
    },
    {
      name: 'result',
      label: '结果',
      field: 'result',
    },
  ];
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
