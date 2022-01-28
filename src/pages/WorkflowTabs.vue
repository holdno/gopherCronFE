<template>
  <div
    class="lg:tw-px-4 lg:tw-pt-2 tw-w-full tw-h-full tw-flex tw-flex-col tw-box-border"
  >
    <q-tabs
      v-if="!isCreateMode"
      :model-value="tab"
      active-color="primary"
      align="left"
      class="lg:tw-hidden tw-display"
    >
      <q-route-tab
        name="graph"
        label="流程"
        :to="{ name: 'workflow', params: { workflowId: props.id } }"
        replace
      />
      <q-route-tab
        name="logs"
        label="日志"
        :to="{ name: 'workflow_logs', params: { workflowId: props.id } }"
        replace
      />
      <q-route-tab
        name="detail"
        label="详情"
        :to="{ name: 'workflow_detail', params: { workflowId: props.id } }"
        replace
      />
    </q-tabs>
    <div class="tw-flex tw-h-full tw-w-full tw-overflow-hidden">
      <q-tab-panels
        :model-value="tab"
        animated
        :vertical="width >= 1024"
        class="tw-w-full tw-h-full tw-bg-[#121212] tw-p-0 lg:tw-pr-4 tw-box-border"
      >
        <q-tab-panel name="graph">
          <WorkflowGraph :id="props.id" />
        </q-tab-panel>
        <q-tab-panel name="logs">
          <WorkFlowLogs :id="props.id" />
        </q-tab-panel>
        <q-tab-panel name="detail">
          <WorkFlowDetail :id="props.id" />
        </q-tab-panel>
      </q-tab-panels>
      <div class="tw-hidden lg:tw-block">
        <q-tabs
          v-if="!isCreateMode"
          :model-value="tab"
          active-color="primary"
          vertical
          switch-indicator
          align="left"
        >
          <q-route-tab
            name="graph"
            label="流程"
            :to="{ name: 'workflow', params: { workflowId: props.id } }"
            replace
          />
          <q-route-tab
            name="logs"
            label="日志"
            :to="{ name: 'workflow_logs', params: { workflowId: props.id } }"
            replace
          />
          <q-route-tab
            name="detail"
            label="详情"
            :to="{ name: 'workflow_detail', params: { workflowId: props.id } }"
            replace
          />
        </q-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import WorkflowGraph from './WorkflowGraph.vue';
  import WorkFlowLogs from '@/components/WorkFlowLogs.vue';
  import WorkFlowDetail from '@/components/WorkFlowDetail.vue';
  import { useWindowSize } from 'vue-window-size';

  const props = defineProps({
    id: {
      type: Number,
      default: 0,
    },
  });
  const { width } = useWindowSize();
  const route = useRoute();
  const isCreateMode = computed(
    () => route.name && route.name.toString() === 'create_workflow',
  );
  const tab = computed(() => {
    if (isCreateMode.value) {
      return 'detail';
    }
    if (route.name) {
      const routeName = route.name.toString();
      if (routeName === 'workflow_logs') return 'logs';
      else if (routeName === 'workflow') return 'graph';
      else if (routeName === 'workflow_detail') return 'detail';
    }
    throw new Error(`Unknown route name ${route.name?.toString()}`);
  });
</script>
