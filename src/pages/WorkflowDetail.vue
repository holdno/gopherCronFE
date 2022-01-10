<template>
  <div class="tw-w-full tw-h-full tw-flex tw-flex-col">
    <div class="tw-flex tw-flex-row tw-gap-4 tw-flex-wrap">
      <q-btn flat type="primary" :disable="!canUpdate" @click="updateWorkFlow">
        保存
      </q-btn>
      <q-btn flat icon="refresh" title="刷新" @click="refresh"> 刷新 </q-btn>
      <q-btn
        flat
        icon="restart_alt"
        title="重置视图"
        @click="() => workflow.ResetView()"
      >
        重置视图
      </q-btn>
      <q-btn
        flat
        icon="add"
        title="添加新任务节点"
        @click="() => workflow.ShowAddNodeDialog()"
      >
        添加新任务节点
      </q-btn>
      <q-btn
        flat
        icon="delete"
        title="删除已选的节点及节点关联关系"
        :disable="canRemoveNodes"
        @click="
          () => {
            workflow.SelectedNodes.length > 0 && workflow.RemoveSelectedNodes();
            workflow.SelectedEdges.length > 0 && workflow.RemoveSelectedEdges();
          }
        "
      >
        删除节点（关系）
      </q-btn>
      <q-btn
        flat
        icon="north_east"
        title="关联节点"
        :disable="!workflow || workflow.SelectedNodes.length !== 1"
        @click="
          () => {
            workflow.SetAddEdgeMode();
            store.getters.$q.notify({
              type: 'info',
              message: '请选择有效的下游节点',
              icon: 'tips_and_updates',
              position: 'top-right',
            });
          }
        "
        >关联节点</q-btn
      >
    </div>
    <WorkFlow ref="workflow" v-model="current" :tasks="tasks" />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watchEffect } from 'vue';
  import WorkFlow from '../components/WorkFlow.vue';
  import { Task, WorkFlowEdge } from '../request';
  import { useStore } from '../store';
  import { KahnTask } from '../types';

  const workflow = ref();
  const canRemoveNodes = computed(
    () =>
      workflow.value === undefined ||
      (workflow.value.SelectedNodes.length === 0 &&
        workflow.value.SelectedEdges.length === 0),
  );

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
        state: store.state.workflowTaskStates.find(
          (s) => s.projectId === task.projectId && s.taskId === task.id,
        ),
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

  async function refresh() {
    await store.dispatch('fetchWorkflowEdges', {
      workflowId: props.id,
    });
    tasks.value = await workflowEdgesToKahnTasks(store.state.workflowEdges);
  }

  onMounted(() => {
    watchEffect(async () => {
      await refresh();
    });
  });

  const canUpdate = computed(
    () => JSON.stringify(tasks.value) !== JSON.stringify(current.value),
  );

  async function updateWorkFlow() {
    await store.dispatch('updateWorkFlowEdges', {
      workflowId: props.id,
      edges: kahnTasksToWorkFlowEdges(current.value),
    });
    await refresh();
  }
</script>
