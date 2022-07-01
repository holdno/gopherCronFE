<template>
  <div
    :class="
      'xl:tw-basis-1/5 tw-basis-1/4 tw-w-full tw-h-full tw-bg-[#1E1E1E]' +
      (inList ? ' tw-hidden lg:tw-block' : '')
    "
  >
    <div class="tw-h-full tw-w-full tw-flex tw-flex-col">
      <q-tabs :model-value="tab" active-color="primary">
        <q-route-tab
          name="crontab"
          label="普通"
          :to="{
            name: 'crontab_tasks',
            params: { projectId: props.projectId },
          }"
          replace
        />
        <q-route-tab
          name="temporary"
          label="临时"
          :to="{
            name: 'temporary_tasks',
            params: { projectId: props.projectId },
          }"
          replace
        >
          <q-tooltip class="bg-warning tw-text-black" :offset="[10, 10]">
            指定时间调度一次的任务
          </q-tooltip>
        </q-route-tab>
        <q-route-tab
          name="workflow"
          label="任务流"
          :to="{
            name: 'workflow_tasks',
            params: { projectId: props.projectId },
          }"
          replace
        />
      </q-tabs>
      <q-tab-panels :model-value="tab" animated class="tw-w-full tw-grow">
        <q-tab-panel name="normal" class="tw-p-0">
          <TaskList :project-id="props.projectId" />
        </q-tab-panel>
        <q-tab-panel name="temporary" class="tw-p-0">
          <TemporaryTaskList :project-id="props.projectId" />
        </q-tab-panel>
        <q-tab-panel name="workflow" class="tw-p-0">
          <WorkFlowTaskList :project-id="props.projectId" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
  <div
    :class="
      'xl:tw-basis-3/5 tw-basis-1/2 tw-h-full tw-w-full' +
      (!inList ? ' tw-hidden lg:tw-block' : '')
    "
  >
    <router-view />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';

  import TaskList from '@/components/TaskList.vue';
  import TemporaryTaskList from '@/components/TemporaryTaskList.vue';
  import WorkFlowTaskList from '@/components/WorkFlowTaskList.vue';

  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
  });

  const route = useRoute();
  const inList = computed(
    () =>
      route.name &&
      !['crontab_tasks', 'workflow_tasks', 'temporary_tasks'].includes(
        route.name.toString(),
      ),
  );

  const tab = computed(() => {
    if (route.name) {
      const routeName = route.name.toString();
      if (routeName.search('crontab') >= 0) return 'normal';
      else if (routeName.search('workflow') >= 0) return 'workflow';
      else if (routeName.search('temporary') >= 0) return 'temporary';
    }
    throw new Error(`Unknown route name ${route.name?.toString()}`);
  });
</script>
