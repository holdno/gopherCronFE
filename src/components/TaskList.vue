<template>
  <div class="tw-h-full tw-w-full tw-flex tw-flex-col">
    <Confirm
      v-model="showDeleteConfirm"
      :content="'是否要删除任务' + selectedTask?.name + '?'"
      type="warning"
      :loading="deleteLoading"
      @confirm="
        selectedTask && deleteTask(selectedTask.projectId, selectedTask.id)
      "
    ></Confirm>
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
      <q-btn flat dense :to="{ name: 'create_crontab_task' }" icon="add" />
      <q-btn
        flat
        dense
        class="tw-text-red-300 lg:tw-flex tw-hidden"
        icon="delete"
        :disable="!selectedTask"
        @click="showDeleteConfirm = true"
      />
    </div>
    <div class="tw-w-full tw-grow">
      <q-scroll-area
        ref="scrollArea"
        class="tw-w-full tw-h-full tw-px-[15px]"
        visible
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
      >
        <q-list
          class="tw-w-full tw-flex tw-flex-col tw-gap-2 tw-pb-4 tw-overflow-hidden tw-relative"
        >
          <router-link
            v-for="task in tasks"
            :key="task.id"
            :to="{ name: 'crontab_task', params: { taskId: task.id } }"
          >
            <div
              :class="
                (!activated(task)
                  ? 'tw-bg-[#27272a] '
                  : 'tw-bg-primary tw-text-black ') +
                'tw-w-full tw-min-h-[130px] tw-rounded-lg tw-box-border tw-relative tw-overflow-hidden tw-block hover:tw-bg-primary hover:tw-text-black'
              "
            >
              <div
                class="tw-w-full tw-flex tw-gap-4 tw-overflow-hidden tw-px-[10px] tw-pt-[10px]"
              >
                <div class="tw-text-ellipsis tw-w-auto tw-truncate tw-gap-1">
                  <q-icon name="schedule" class="tw-inline" />
                  {{ task.cronExpr }}
                </div>

                <q-space></q-space>
                <q-badge
                  outline
                  :color="task.status === 1 ? 'green' : 'red'"
                  class="tw-w-[50px]"
                >
                  {{
                    task.isRunning == 1
                      ? '执行中'
                      : task.status == 1
                      ? '调度中'
                      : '已暂停'
                  }}
                </q-badge>
                <!-- <div :class="'tw-w-[50px] task__status' + task.status"></div> -->
              </div>
              <div
                :class="
                  (activated(task) ? 'active ' : '') +
                  'task__title tw-flex-col tw-items-center tw-w-full'
                "
              >
                <q-icon name="numbers" />
                {{ task.name }}
              </div>
              <div class="task__remark">{{ task.remark || '-' }}</div>
              <div class="task__bottom-box">
                <div class="task__bottom-time">
                  {{ formatTimestamp(task.createTime * 1000) }}
                </div>
              </div>
            </div>
          </router-link>
        </q-list>

        <div
          v-if="!loading && (!tasks || tasks.length === 0)"
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
  import { QScrollArea } from 'quasar';
  import { computed, onMounted, ref, watchEffect } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import { Task } from '@/api/request';
  import Confirm from '@/components/Confirm.vue';
  import { useStore } from '@/store/index';
  import { TASK_STATUS } from '@/types/task';
  import { formatTimestamp } from '@/utils/datetime';
  import { barStyle, thumbStyle } from '@/utils/thumbStyle';

  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
  });

  const store = useStore();
  const loading = computed(() => store.state.Task.loadingTasks);
  const route = useRoute();
  onMounted(() => {
    watchEffect(async () => {
      store.dispatch('subscribeTopic', [
        '/task/status/project/' + props.projectId,
      ]);
      filter.value = '';
      await fetchTasks();
      if (route.params.taskId) {
        scrollTo(route.params.taskId as string);
      }
    });
    store.watch(
      (state) => [state.Root.eventTask],
      ([eventTask]) => {
        if (!eventTask || eventTask.projectId !== props.projectId) return;

        const task = tasks.value.find((t) => t.id === eventTask.taskId);
        if (task !== undefined) {
          store.commit('notifySuccess', {
            message: `任务 ${task.name} 当前状态: ${eventTask.status}`,
          });

          store.commit('Task/updateTaskStatus', {
            projectId: task.projectId,
            taskId: task.id,
            isRunning: TASK_STATUS.isRunning(eventTask.status),
          });
        }
      },
    );
  });

  async function fetchTasks() {
    await store.dispatch('Task/fetchTasks', { ...props });
  }

  const filter = ref('');
  const tasks = computed(() => {
    return (
      store.state.Task.tasks
        .get(props.projectId)
        ?.filter(
          (t: Task) =>
            t.name.indexOf(filter.value) >= 0 ||
            t.id.toString().indexOf(filter.value) >= 0,
        ) || []
    );
  });

  const scrollArea = ref<QScrollArea>();
  function scrollTo(id: string) {
    const s = scrollArea.value;
    if (!s || !tasks.value) return;
    const idx = tasks.value.findIndex((x) => x.id === id);
    setTimeout(() => {
      if (idx < 0) {
        // scroll to start
        s.setScrollPercentage('vertical', 0);
      } else {
        const p =
          ((1.0 * idx) / tasks.value.length) * s.getScroll().verticalSize - 150;
        s.setScrollPosition('vertical', p);
      }
    }, 100);
  }

  function activated(task: Task): boolean {
    return route.params.taskId === task.id;
  }

  const selectedTask = computed(() => tasks.value.filter(activated).pop());

  const router = useRouter();
  router.beforeEach((to, from, next) => {
    if (!from.params.taskId && to.params.taskId) {
      // created task
      scrollTo(to.params.taskId as string);
    }
    next();
  });

  const showDeleteConfirm = ref(false);
  const deleteLoading = ref(false);
  async function deleteTask(projectId: number, taskId: string) {
    try {
      deleteLoading.value = true;
      store.commit('cleanError');
      await store.dispatch('deleteTask', { projectId, taskId });
      if (store.state.Root.currentError === undefined) {
        router.push({
          name: 'crontab_tasks',
          params: {
            projectId: projectId,
          },
        });
        showDeleteConfirm.value = false;
        await fetchTasks();
      }
    } catch (e: any) {
      console.error(e);
      store.commit('error', { error: e });
    }
    deleteLoading.value = false;
  }
</script>

<style scoped>
  .task__title {
    margin-top: 10px;
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

    line-height: 20px;
    width: 200px;
    height: 20px;
    /* position: absolute;
    top: -30px;
    left: 20px; */
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

  .task__status0 {
    /* position: absolute;
    top: 10px;
    right: 15px; */
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
