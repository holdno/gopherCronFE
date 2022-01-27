<template>
  <div class="tw-h-full tw-w-full tw-flex tw-flex-col">
    <div class="q-pa-md tw-flex tw-flex-row-reverse tw-gap-4">
      <q-btn flat :loading="loading" icon="refresh" @click="refresh" />
      <q-btn flat icon="add" />
    </div>
    <div class="tw-w-full tw-grow tw-overflow-hidden">
      <q-infinite-scroll class="tw-w-full tw-h-full" @load="onLoad">
        <q-scroll-area
          visible
          :thumb-style="thumbStyle"
          :bar-style="barStyle"
          class="tw-w-full tw-h-full tw-px-[15px]"
        >
          <q-list class="tw-flex tw-flex-col tw-gap-2 tw-pb-4">
            <router-link
              v-for="[, workflow] in workflows"
              :key="workflow.id"
              :to="{ name: 'workflow', params: { workflowId: workflow.id } }"
            >
              <div
                :class="
                  (!activated(workflow)
                    ? 'tw-bg-[#27272a] '
                    : 'tw-bg-primary tw-text-black ') +
                  'tw-w-full tw-min-h-[130px] tw-pt-[30px] tw-rounded-md tw-box-border tw-relative tw-overflow-hidden tw-block hover:tw-bg-primary hover:tw-text-black'
                "
              >
                <div :class="'task__status' + workflow.status">
                  {{
                    isRunning(workflow)
                      ? '执行中'
                      : workflow.status == 1
                      ? '调度中'
                      : '已暂停'
                  }}
                </div>
                <div
                  :class="
                    (activated(workflow) ? 'active ' : '') +
                    'task__title tw-inline-flex tw-items-center'
                  "
                >
                  <div class="task__cron">
                    <q-icon name="schedule" />
                    {{ workflow.cronExpr }}
                  </div>
                  <q-icon name="numbers" />
                  {{ workflow.title }}
                </div>
                <div class="task__remark">{{ workflow.remark || '-' }}</div>
                <div class="task__bottom-box">
                  <div class="task__bottom-time">
                    {{ formatTimestamp(workflow.createTime * 1000) }}
                  </div>
                </div>
              </div>
            </router-link>
          </q-list>
        </q-scroll-area>
        <div
          v-if="!loading && (!workflows || workflows.size === 0)"
          class="tw-w-full tw-text-center tw-m-auto tw-text-gray-500"
        >
          <q-icon name="outlet" style="font-size: 3rem" />
          暂无数据
        </div>
      </q-infinite-scroll>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue';
  import { useStore } from '@/store';
  import { formatTimestamp } from '@/utils/datetime';
  import { thumbStyle, barStyle } from '@/utils/thumbStyle';
  import { Workflow } from '@/api/request';
  import { useRoute } from 'vue-router';

  const store = useStore();
  const route = useRoute();
  const loading = computed(() => store.state.loadingWorkflows);

  onMounted(async () => {
    store.watch(
      (state) => [state.eventTask, state.eventWorkFlowTask],
      (current) => {
        refresh();
      },
    );
  });

  const workflows = ref(new Map<number, Workflow>());
  async function onLoad(index: number, done: (stop: boolean) => void) {
    pagination.page = index;
    await refresh();
    if (store.state.workflows.length < pagination.pageSize) {
      done(true);
    } else {
      done(false);
    }
  }

  const pagination = reactive({
    page: 1,
    pageSize: 10,
  });

  async function refresh() {
    await store.dispatch('fetchWorkflows', {
      ...pagination,
    });
    for (const workflow of store.state.workflows) {
      workflows.value.set(workflow.id, workflow);
    }
  }

  function activated(workflow: Workflow): boolean {
    return workflow.id === Number(route.params.workflowId || 0);
  }

  function isRunning(workflow: any): boolean {
    return workflow.state && workflow.state.status === 'running';
  }
</script>

<style>
  .task__title {
    margin-top: 10px;
    padding: 5px 10px;
    background-color: rgba(60, 59, 59, 0.6);
    font-size: 16px;
    line-height: 20px;
    position: relative;
  }

  .task__title.active {
    background-color: rgba(60, 59, 59, 0.3);
  }

  .task__cron {
    font-size: 14px;
    position: absolute;
    line-height: 20px;
    width: 200px;
    height: 20px;
    top: -30px;
    left: 20px;
  }

  .task__remark {
    font-size: 14px;
    line-height: 20px;
    margin: 10px 15px;
    max-height: 60px;
    overflow: hidden;
  }

  .task__bottom-box {
    height: 24px;
    line-height: 24px;
    margin-left: 15px;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
  }

  .task__status2 {
    position: absolute;
    top: 10px;
    right: 15px;
    border: 1px solid #f00;
    color: #f00;
    padding: 0 6px;
    line-height: 24px;
    border-radius: 5px;
    font-size: 12px;
    background-color: rgba(255, 0, 0, 0.2);
  }

  .task__status1 {
    position: absolute;
    top: 10px;
    right: 15px;
    border: 1px solid #67c23a;
    color: #67c23a;
    padding: 0 6px;
    line-height: 24px;
    border-radius: 5px;
    font-size: 12px;
    background-color: rgba(103, 194, 58, 0.2);
  }
</style>
