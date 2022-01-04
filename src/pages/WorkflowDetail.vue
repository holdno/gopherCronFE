<template>
  <TaskFlow :tasks="tasks" />
</template>

<script setup lang="ts">
  import { computed, onMounted, watchEffect } from 'vue';
  import TaskFlow from '../components/TaskFlow.vue';
  import { workflowEdgesTokahnTasks } from '../request';
  import { useStore } from '../store';

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
  onMounted(() => {
    watchEffect(async () => {
      await store.dispatch('fetchWorkflowEdges', {
        workflowId: props.id,
      });
    });
  });
</script>
