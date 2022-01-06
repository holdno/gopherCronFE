<template>
  <div class="tw-w-full tw-h-full">
    <WorkFlow v-model="current" :tasks="tasks" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, watchEffect } from 'vue';
  import WorkFlow from '../components/WorkFlow.vue';
  import { Task, WorkFlowEdge } from '../request';
  import { useStore } from '../store';
  import { KahnTask } from '../types';

  const props = defineProps({
    id: {
      type: Number,
      required: true,
    },
  });
  const store = useStore();

  async function workflowEdgesToKahnTasks(
    edges: WorkFlowEdge[],
  ): Promise<KahnTask[]> {
    const childMapParents = new Map<string, string[]>();
    const keyMapTask = new Map<string, Task>();
    for (const edge of edges) {
      await store.dispatch('fetchTasks', {
        projectId: edge.projectId,
        cached: true,
      });
      const tasks = store.state.fetchTasksCache.get(edge.projectId);
      if (tasks === undefined)
        throw new Error(`fetchTasksCache missing projectId=${edge.projectId}`);

      const task = tasks.find((t) => t.id === edge.taskId);
      if (task === undefined)
        throw new Error(
          `fetchTasksCache missing projectId=${edge.projectId} taskId=${edge.taskId}`,
        );

      const key = `${edge.projectId}_${edge.taskId}`;
      keyMapTask.set(key, task);
      if (!childMapParents.has(key)) {
        childMapParents.set(key, []);
      }
      if (edge.dependencyProjectId > 0 && edge.dependencyTaskId !== '') {
        const parentKey = `${edge.dependencyProjectId}_${edge.dependencyTaskId}`;
        const parents = childMapParents.get(key);
        parents !== undefined &&
          childMapParents.set(key, [...parents, parentKey]);
      }
    }
    return Array.from(childMapParents.keys()).map((key) => {
      const task = keyMapTask.get(key);
      if (task === undefined) throw new Error(`keyMapTask missing ${key}`);

      return {
        name: task.name,
        id: key,
        deps: childMapParents.get(key),
        origin: task,
      };
    });
  }
  const tasks = ref<KahnTask[]>([]);
  const current = ref<KahnTask[]>([]);
  onMounted(() => {
    watchEffect(async () => {
      await store.dispatch('fetchWorkflowEdges', {
        workflowId: props.id,
      });
      tasks.value = await workflowEdgesToKahnTasks(store.state.workflowEdges);
    });
  });
</script>
