<template>
  <div class="tw-w-full tw-h-full">
    <WorkFlow v-model="current" :tasks="tasks" />
    <q-btn :disable="!canUpdate" @click="updateWorkFlow">保存</q-btn>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watchEffect } from 'vue';
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
  const tasks = ref<KahnTask[]>([]);
  const current = ref<KahnTask[]>([]);
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

  function kahnTasksToWorkFlowEdges(tasks: KahnTask[]): WorkFlowEdge[] {
    const edges = [];
    const id2task = new Map<string, Task>();
    console.log(tasks);
    for (const task of tasks) {
      id2task.set(task.id, task.origin);
    }

    for (const task of tasks) {
      if (task.deps !== undefined && task.deps.length > 0) {
        for (const dep of task.deps) {
          const depTask = id2task.get(dep);
          if (depTask === undefined) {
            throw new Error('original task object missing');
          }
          edges.push({
            id: 0,
            workflowId: 0,
            createTime: 0,

            projectId: task.origin.projectId,
            taskId: task.origin.id,
            dependencyProjectId: depTask.projectId,
            dependencyTaskId: depTask.id,
          });
        }
      } else {
        edges.push({
          id: 0,
          workflowId: 0,
          createTime: 0,

          projectId: task.origin.projectId,
          taskId: task.origin.id,
          dependencyProjectId: 0,
          dependencyTaskId: '',
        });
      }
    }
    return edges;
  }
  onMounted(() => {
    watchEffect(async () => {
      await store.dispatch('fetchWorkflowEdges', {
        workflowId: props.id,
      });
      tasks.value = await workflowEdgesToKahnTasks(store.state.workflowEdges);
    });
  });

  const canUpdate = computed(
    () => JSON.stringify(tasks.value) !== JSON.stringify(current.value),
  );
  function updateWorkFlow() {
    store.dispatch('updateWorkFlow', {
      workflowId: props.id,
      edges: kahnTasksToWorkFlowEdges(current.value),
    });
  }
</script>
