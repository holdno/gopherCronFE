<template>
  <div class="tw-h-full tw-w-full tw-flex tw-flex-col">
    <div class="q-pa-md tw-flex tw-justify-around">
      <q-input
        v-model="filter"
        borderless
        dense
        debounce="300"
        placeholder="Search"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn flat dense :loading="loading" icon="refresh" @click="fetchTasks" />
    </div>
    <div class="tw-w-full tw-grow">
      <q-scroll-area
        class="tw-w-full tw-h-full tw-px-[15px]"
        visible
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
      >
        <q-list
          v-if="tasks"
          class="tw-w-full tw-flex tw-flex-col tw-gap-2 tw-pb-4"
        >
          <router-link
            v-for="task in temporaryTasks"
            :key="task.id"
            :to="{ name: 'temporary_task', params: { taskId: task.id } }"
          >
            <div
              :class="
                (!activated(task)
                  ? 'tw-bg-[#27272a] '
                  : 'tw-bg-primary tw-text-black ') +
                'tw-w-full tw-min-h-[130px] tw-pt-[30px] tw-rounded-md tw-box-border tw-relative tw-overflow-hidden tw-block hover:tw-bg-primary hover:tw-text-black'
              "
            >
              <div :class="'task__status' + task.scheduleStatus">
                {{ task.scheduleStatus == 1 ? '等待中' : '已完成' }}
              </div>
              <div
                :class="
                  (activated(task) ? 'active ' : '') +
                  'task__title tw-inline-flex tw-items-center'
                "
              >
                <div class="task__cron">
                  <q-icon name="schedule" />
                  {{ formatTimestamp(task.scheduleTime * 1000) }}
                </div>
                <q-icon name="numbers" />
                {{ task.remark }}
              </div>
              <div class="task__remark">创建人：{{ task.userName || '-' }}</div>
              <div class="task__bottom-box">
                <div class="task__bottom-time">
                  {{ formatTimestamp(task.createTime * 1000) }}
                </div>
              </div>
            </div>
          </router-link>
        </q-list>
        <div
          v-if="!loading && (!temporaryTasks || temporaryTasks.length === 0)"
          class="tw-w-full tw-text-center tw-m-auto tw-text-gray-500"
        >
          <q-icon name="outlet" style="font-size: 3rem" />
          暂无数据
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watchEffect } from 'vue';
  import { useRoute } from 'vue-router';

  import { TemporaryTask } from '@/api/request';
  import { useStore } from '@/store/index';
  import { formatTimestamp } from '@/utils/datetime';
  import { barStyle, thumbStyle } from '@/utils/thumbStyle';

  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
  });

  const filter = ref('');

  const store = useStore();
  const loading = computed(() => store.state.Task.loadingTasks);

  async function fetchTasks() {
    await store.dispatch('Task/fetchTasks', { ...props });
    await store.dispatch('Task/fetchTemporaryTasks', { ...props });
  }
  onMounted(async () => {
    watchEffect(async () => {
      await fetchTasks();
    });

    if (!store.state.Task.tasks) {
      await store.dispatch('Task/fetchTasks', { projectId: props.projectId });
    }
  });
  const tasks = computed(() => store.state.Task.tasks.get(props.projectId));
  const temporaryTasks = computed(
    () =>
      store.state.Task.temporaryTasks
        .get(props.projectId)
        ?.filter(
          (t: TemporaryTask) => t.taskId.toString().indexOf(filter.value) >= 0,
        ) || [],
  );

  function activated(task: TemporaryTask): boolean {
    const route = useRoute();
    return Number(route.params.taskId) === task.id;
  }
</script>

<style scoped>
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
    height: 30px;
    top: -30px;
    left: 15px;
  }

  .task__remark {
    font-size: 14px;
    line-height: 20px;
    margin: 10px 15px;
    max-height: 60px;
    overflow: hidden;
    word-break: break-all;
  }

  .task__bottom-box {
    height: 24px;
    line-height: 24px;
    margin-left: 15px;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
  }

  .task__status1 {
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

  .task__status2 {
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
