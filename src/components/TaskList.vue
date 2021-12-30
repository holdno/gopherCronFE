<template>
  <div class="q-pa-xs tw-h-full tw-w-full">
    <div class="q-pa-xs tw-flex tw-justify-around">
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
      <q-btn :to="{ name: 'create_task' }" icon="add" />
    </div>
    <q-scroll-area class="tw-h-[95%]" visible>
      <q-list class="q-pa-md">
        <q-item
          v-for="task in tasks"
          :key="task.id"
          active-class="tw-bg-primary tw-text-black"
          :class="
            (!actived(task) ? 'tw-bg-[#27272a] ' : '') +
            'tw-w-full tw-min-h-[130px] tw-pt-[30px] tw-mb-[10px] tw-rounded-md tw-box-border tw-relative tw-overflow-hidden tw-block hover:tw-bg-primary hover:tw-text-black'
          "
          :to="{ name: 'task', params: { taskId: task.id } }"
        >
          <div :class="'task__status' + task.status">
            {{ task.status == 1 ? '调度中' : '已暂停' }}
          </div>
          <div
            :class="
              (actived(task) ? 'active ' : '') +
              'task__title tw-inline-flex tw-items-center'
            "
          >
            <div class="task__cron">
              <q-icon name="schedule" />
              {{ task.cronExpr }}
            </div>
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
            <!-- <div
              class="task__bottom-button"
              @click.stop="shutdown($event, item)"
            >
              {{ task.isRunning == 1 ? '结束进程' : '等待执行' }}
            </div> -->
          </div>
        </q-item>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watchEffect } from 'vue';
  import { useStore } from '../store';
  import { Task } from '../request';
  import { formatTimestamp } from '../utils/datetime';
  import { useRoute } from 'vue-router';

  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
  });

  const store = useStore();
  watchEffect(() => {
    store.dispatch('fetchTasks', { ...props });
  });

  const filter = ref('');
  const tasks = computed(() =>
    store.state.tasks.filter(
      (t: Task) =>
        t.name.indexOf(filter.value) >= 0 ||
        t.id.toString().indexOf(filter.value) >= 0,
    ),
  );

  function actived(task: Task): boolean {
    const route = useRoute();
    return route.params.taskId === task.id;
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
