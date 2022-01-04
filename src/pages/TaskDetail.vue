<template>
  <div class="q-pa-md tw-w-full tw-h-full">
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
    <q-tabs
      :model-value="tab"
      active-color="primary"
      align="left"
      class="lg:tw-hidden tw-display"
    >
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
    <div class="tw-flex tw-w-full tw-h-full">
      <q-tab-panels
        :model-value="tab"
        animated
        :vertical="width >= 1024"
        class="tw-w-full tw-max-h-[90%]"
      >
        <q-tab-panel name="detail">
          <TaskDetail :id="props.id" :project-id="props.projectId" />
        </q-tab-panel>
        <q-tab-panel name="logs">
          <TaskLogs :id="props.id" :project-id="props.projectId" />
        </q-tab-panel>
      </q-tab-panels>
      <div class="tw-hidden lg:tw-block">
        <q-tabs
          :model-value="tab"
          active-color="primary"
          vertical
          switch-indicator
          align="left"
        >
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useStore } from '../store';
  import TaskDetail from '../components/TaskDetail.vue';
  import TaskLogs from '../components/TaskLogs.vue';
  import { useRoute } from 'vue-router';
  import { useWindowSize } from 'vue-window-size';

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

  const { width } = useWindowSize();
</script>
