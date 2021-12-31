<template>
  <div class="q-pa-md">
    <div class="tw-text-[#7e7e7e] tw-mb-4">
      <div
        class="tw-flex tw-items-center tw-justify-start tw-gap-4 tw-text-lg tw-mb-4"
      >
        <span><q-icon name="folder" /> {{ project?.title }} </span>
        <span>
          ID:
          {{ projectId }}
        </span>
      </div>
      <div v-if="project && project.remark.trim() !== ''" class="tw-pb-4">
        {{ project.remark }}
      </div>
    </div>
    <q-tabs v-model="tab">
      <q-route-tab
        name="detail"
        label="详情"
        :to="{ name: 'task', params: { taskId: props.id } }"
        replace
      />
      <q-route-tab
        name="logs"
        label="日志"
        :to="{ name: 'task_logs', params: { taskId: props.id } }"
        replace
      />
    </q-tabs>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="detail">
        <TaskDetail :id="props.id" :project-id="props.projectId" />
      </q-tab-panel>
      <q-tab-panel name="logs">
        <TaskLogs :id="props.id" :project-id="props.projectId" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useStore } from '../store';
  import TaskDetail from '../components/TaskDetail.vue';
  import TaskLogs from '../components/TaskLogs.vue';
  import { useRoute } from 'vue-router';

  const props = defineProps({
    id: {
      type: String,
      default: '',
    },
    projectId: {
      type: Number,
      required: true,
    },
  });

  const store = useStore();
  const project = computed(() =>
    store.state.projects.find((p) => p.id === props.projectId),
  );

  const route = useRoute();
  const tab = computed(() => {
    if (route.name === 'task') return 'detail';
    else if (route.name === 'task_logs') return 'logs';
    else throw new Error(`Unknown route name ${route.name?.toString}`);
  });
</script>
