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
      <q-btn flat dense :to="{ name: 'create_workflow_task' }" icon="add" />
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
        class="tw-h-full tw-w-full tw-px-[15px]"
        visible
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
      >
        <q-list class="tw-w-full tw-flex tw-flex-col tw-gap-2 tw-pb-4">
          <router-link
            v-for="task in tasks"
            :key="task.id"
            :to="{ name: 'workflow_task', params: { taskId: task.id } }"
          >
            <div
              :class="
                (!activated(task)
                  ? 'tw-bg-[#27272a] '
                  : 'tw-bg-primary tw-text-black ') +
                'tw-w-full tw-min-h-[130px] tw-py-3 tw-rounded-lg tw-box-border tw-relative tw-overflow-hidden tw-block hover:tw-bg-primary hover:tw-text-black'
              "
            >
              <div
                :class="
                  (activated(task) ? 'active ' : '') +
                  'task__title tw-inline-flex tw-items-center'
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
  import { computed, onMounted, ref, watchEffect } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import { WorkFlowTask } from '@/api/request';
  import Confirm from '@/components/Confirm.vue';
  import { useStore } from '@/store/index';
  
  import { formatTimestamp } from '@/utils/datetime';
  import { barStyle, thumbStyle } from '@/utils/thumbStyle';

  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
  });

  const store = useStore();
  const loading = computed(() => store.state.WorkFlowTask.loadingTasks);

  onMounted(() => {
    watchEffect(async () => {
      await fetchTasks();
    });

    store.dispatch('subscribeTopic', [
      '/task/status/project/' + props.projectId,
    ]);

    store.watch(
      (state) => [state.Root.eventWorkFlowTask],
      ([eventWorkFlowTask]) => {
        if (
          !eventWorkFlowTask ||
          eventWorkFlowTask.projectId !== props.projectId
        )
          return;

        const task = tasks.value.find((t) => t.id === eventWorkFlowTask.taskId);
        if (task !== undefined) {
          store.commit('notifySuccess', {
            message: `任务 ${task.name} 当前状态: ${eventWorkFlowTask.status}`,
          });
        }

        fetchTasks();
      },
    );
  });
  async function fetchTasks() {
    await store.dispatch('WorkFlowTask/fetchTasks', { ...props });
  }

  const filter = ref('');
  const tasks = computed(
    () =>
      store.state.WorkFlowTask.tasks
        .get(props.projectId)
        ?.filter(
          (t: WorkFlowTask) =>
            t.name.indexOf(filter.value) >= 0 ||
            t.id.toString().indexOf(filter.value) >= 0,
        ) || [],
  );

  function activated(task: WorkFlowTask): boolean {
    const route = useRoute();
    return route.params.taskId === task.id;
  }

  const selectedTask = computed(() => tasks.value.filter(activated).pop());
  const router = useRouter();
  const showDeleteConfirm = ref(false);
  const deleteLoading = ref(false);
  async function deleteTask(projectId: number, taskId: string) {
    deleteLoading.value = true;
    try {
      store.commit('cleanError');
      await store.dispatch('deleteWorkFlowTask', { projectId, taskId });
      if (store.state.Root.currentError === undefined) {
        router.push({
          name: 'workflow_tasks',
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
