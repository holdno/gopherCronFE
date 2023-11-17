<template>
  <div class="tw-h-full tw-w-full tw-flex tw-flex-col">
    <div class="q-pa-md tw-flex tw-flex-row-reverse tw-gap-4">
      <q-btn flat :loading="loading" icon="refresh" @click="refresh" />
      <q-btn flat icon="add" :to="{ name: 'create_workflow' }" />
    </div>
    <div class="tw-w-full tw-grow tw-overflow-hidden tw-min-w-[280px]">
      <q-scroll-area
        ref="scrollArea"
        visible
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
        class="tw-w-full tw-h-full tw-px-[15px]"
      >
        <q-infinite-scroll
          class="tw-w-full tw-h-full"
          :offset="100"
          @load="onLoad"
        >
          <q-list
            v-if="workflows && workflows.length > 0"
            class="tw-flex tw-flex-col tw-gap-2 tw-pb-4"
          >
            <router-link
              v-for="workflow in workflows"
              :key="workflow.id"
              :to="{
                name: 'workflow',
                params: { workflowId: workflow.id },
              }"
            >
              <div
                :class="
                  (!activated(workflow)
                    ? 'tw-bg-[#27272a] '
                    : 'tw-bg-primary tw-text-black ') +
                  'tw-w-full tw-min-h-[130px] tw-rounded-md tw-box-border tw-relative tw-overflow-hidden tw-block hover:tw-bg-primary hover:tw-text-black'
                "
              >
                <div
                  class="tw-w-full tw-flex tw-gap-4 tw-overflow-hidden tw-px-[10px] tw-pt-[10px]"
                >
                  <div class="tw-text-ellipsis tw-w-auto tw-truncate tw-gap-1">
                    <q-icon name="schedule" class="tw-inline" />
                    {{ workflow.cronExpr }}
                  </div>

                  <q-space></q-space>
                  <q-badge
                    outline
                    :color="workflow.status === 1 ? 'green' : 'red'"
                    class="tw-w-[50px]"
                  >
                    {{
                      isRunning(workflow)
                        ? '执行中'
                        : workflow.status == 1
                        ? '调度中'
                        : '已暂停'
                    }}
                  </q-badge>
                  <!-- <div :class="'tw-w-[50px] task__status' + task.status"></div> -->
                </div>

                <div
                  :class="
                    (activated(workflow) ? 'active ' : '') +
                    'task__title tw-inline-flex tw-items-center'
                  "
                >
                  <q-icon name="numbers" />
                  {{ workflow.title }}
                </div>
                <div class="task__remark">{{ workflow.remark || '-' }}</div>
                <div class="task__bottom-box">
                  <div class="task__bottom-time">
                    {{ formatTimestamp(workflow.createTime * 1000) }}
                  </div>
                  <DropdownWorkFlowManage :workflow-id="workflow.id" />
                </div>
              </div>
            </router-link>
          </q-list>
          <div
            v-if="!loading && (!workflows || workflows.length === 0)"
            class="tw-w-full tw-text-center tw-m-auto tw-text-gray-500"
          >
            <q-icon name="outlet" style="font-size: 3rem" />
            暂无数据
          </div>
        </q-infinite-scroll>
      </q-scroll-area>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { QInfiniteScroll, QScrollArea } from 'quasar';
  import { computed, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';

  import DropdownWorkFlowManage from './DropdownWorkFlowManage.vue';

  import { WorkFlow } from '@/api/request';
  import { useStore } from '@/store/index';
  import { formatTimestamp } from '@/utils/datetime';
  import { barStyle, thumbStyle } from '@/utils/thumbStyle';

  const props = defineProps({
    orgId: {
      type: String,
      required: true,
    },
  });

  const store = useStore();
  const route = useRoute();
  const scrollArea = ref<QScrollArea>();
  const loading = computed(() => store.state.WorkFlow.loadingWorkflows);

  store.commit('WorkFlow/clearWorkFlows');
  watch(
    () => route.name,
    (current) => {
      if (current?.toString() === 'workflows') refresh();
    },
  );

  function scrollTo(id: number) {
    const s = scrollArea.value;
    if (s === undefined) throw new Error('scroll-area instance is missing');
    const ids = Array.from(workflows.value.keys());
    const idx = ids.findIndex((x) => x === id);
    setTimeout(() => {
      if (idx < 0) {
        // scroll to end
        s.setScrollPercentage('vertical', 1.0);
      } else {
        const p = ((1.0 * idx) / ids.length) * s.getScroll().verticalSize - 50;
        s.setScrollPosition('vertical', p);
      }
    }, 100);
  }

  onMounted(async () => {
    store.watch(
      (state) => [state.Root.eventWorkFlow],
      ([eventWorkFlow]) => {
        if (!eventWorkFlow) return;

        const flow = workflows.value.get(eventWorkFlow.workFlowId);
        if (flow !== undefined) {
          store.commit('notifySuccess', {
            message: `任务编排 ${flow.title} 当前状态: ${eventWorkFlow.status}`,
          });
        }

        refresh();
      },
    );
    watch(
      () => [workflows.value],
      () => {
        const id = Number(route.params.workflowId);
        if (id !== 0 && !isNaN(id)) {
          scrollTo(id);
        }
      },
      { deep: true },
    );

    refresh();
  });

  const workflows = computed(() => {
    const wlist = store.state.WorkFlow.workflows;
    console.log(wlist);
    const list = Array.from(wlist.values());
    list.sort((i, j) => {
      return j.id - i.id;
    });
    return list;
  });
  async function onLoad(index: number, done: (stop: boolean) => void) {
    if (index === 1) {
      // index 为 1 时，由onmounted负责加载
      return;
    }
    pagination.page = index;
    const workflows = await refresh();
    if (workflows.length < pagination.pageSize) {
      done(true);
    } else {
      done(false);
    }
  }

  const pagination = reactive({
    page: 1,
    pageSize: 15,
  });

  async function refresh() {
    const [workflows] = await store.dispatch('WorkFlow/fetchWorkFlows', {
      orgId: props.orgId,
      ...pagination,
    });
    return workflows;
  }

  function activated(workflow: WorkFlow): boolean {
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
    height: min-content;
    margin-left: 15px;
    margin-right: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .task__status2 {
    border: 1px solid #f00;
    color: #f00;
    padding: 0 6px;
    line-height: 24px;
    border-radius: 5px;
    font-size: 12px;
    background-color: rgba(255, 0, 0, 0.2);
  }

  .task__status1 {
    border: 1px solid #67c23a;
    color: #67c23a;
    padding: 0 6px;
    line-height: 24px;
    border-radius: 5px;
    font-size: 12px;
    background-color: rgba(103, 194, 58, 0.2);
  }
</style>
