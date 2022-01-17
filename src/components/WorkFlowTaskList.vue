<template>
  <div class="tw-h-full tw-w-full tw-flex tw-flex-col">
    <q-dialog v-model="showDeleteConfirm">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="primary" text-color="white" />
          <span class="q-ml-sm"> 是否要删除任务 {{ selectedTask?.name }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="取消" color="primary" />
          <q-btn
            flat
            label="删除"
            color="red"
            @click="
              () =>
                selectedTask &&
                deleteTask(selectedTask.projectId, selectedTask.id)
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
      <q-btn flat :loading="loading" icon="refresh" @click="fetchTasks" />
      <q-btn flat :to="{ name: 'create_workflow_task' }" icon="add" />
      <q-btn
        flat
        class="tw-text-red-300 lg:tw-flex tw-hidden"
        icon="delete"
        :disable="!selectedTask"
        @click="showDeleteConfirm = true"
      />
    </div>
    <q-scroll-area class="tw-h-full tw-grow" visible>
      <q-list class="">
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
              'tw-w-full tw-min-h-[130px] tw-py-3 tw-mb-4 tw-rounded-md tw-box-border tw-relative tw-overflow-hidden tw-block hover:tw-bg-primary hover:tw-text-black'
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
            <div class="task__remark">
              {{ task.remark || '-' }}
            </div>
            <div class="task__bottom-box">
              <div class="task__bottom-time">
                {{ formatTimestamp(task.createTime * 1000) }}
              </div>
            </div>
          </div>
        </router-link>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watchEffect } from 'vue';
  import { useStore } from '@/store';
  import { WorkFlowTask } from '@/request';
  import { formatTimestamp } from '@/utils/datetime';
  import { useRoute, useRouter } from 'vue-router';

  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
  });

  const store = useStore();
  const loading = computed(() => store.state.loadingWorkFlowTasks);

  onMounted(() => {
    watchEffect(async () => {
      await fetchTasks();
    });
    store.watch(
      (state) => [state.eventTask, state.eventWorkFlowTask],
      (current) => {
        fetchTasks();
      },
    );
  });
  async function fetchTasks() {
    await store.dispatch('fetchWorkFlowTasks', { ...props });
  }

  const filter = ref('');
  const tasks = computed(() =>
    store.state.workFlowTasks.filter(
      (t: WorkFlowTask) =>
        t.name.indexOf(filter.value) >= 0 ||
        t.id.toString().indexOf(filter.value) >= 0,
    ),
  );

  function activated(task: WorkFlowTask): boolean {
    const route = useRoute();
    return route.params.taskId === task.id;
  }

  const selectedTask = computed(() => tasks.value.filter(activated).pop());
  const router = useRouter();
  const showDeleteConfirm = ref(false);
  async function deleteTask(projectId: number, taskId: string) {
    store.commit('clearError');
    await store.dispatch('deleteWorkFlowTask', { projectId, taskId });
    if (store.state.currentError === undefined) {
      router.push({
        name: 'project',
        params: {
          projectId: projectId,
        },
      });
      showDeleteConfirm.value = false;
      await fetchTasks();
    }
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

  .task__status0 {
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
