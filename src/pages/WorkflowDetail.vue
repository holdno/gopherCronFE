<template>
  <div class="tw-w-full tw-h-full">
    <WorkFlow v-model="current" :tasks="tasks" />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watchEffect } from 'vue';
  import WorkFlow from '../components/WorkFlow.vue';
  import { workflowEdgesTokahnTasks } from '../request';
  import { useStore } from '../store';
  import { Task } from '../types';

  const props = defineProps({
    id: {
      type: Number,
      required: true,
    },
  });
  const store = useStore();
  const tasks = computed(() =>
    workflowEdgesTokahnTasks(store.state.workflowEdges),
  );
  const current = ref<Task[]>([]);
  onMounted(() => {
    watchEffect(async () => {
      await store.dispatch('fetchWorkflowEdges', {
        workflowId: props.id,
      });
    });
  });
</script>
