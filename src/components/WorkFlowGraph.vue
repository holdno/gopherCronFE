<template>
  <v-network-graph
    v-if="show"
    ref="graph"
    v-model:selected-nodes="selectedNodes"
    v-model:selected-edges="selectedEdges"
    v-model:layouts="layouts"
    :class="visual ? '' : 'tw-opacity-0'"
    :nodes="nodes"
    :edges="edges"
    :configs="configs"
    :zoom-level="0.75"
    :event-handlers="eventHandlers"
  />
  <q-dialog
    v-model="addNodeDialogVisibility"
    class="tw-w-screen tw-h-screen"
    @hide="HideAddNodeDialog"
  >
    <q-card class="tw-w-96 q-pa-sm">
      <q-card-section>
        <div class="text-h6">添加新的任务节点</div>
      </q-card-section>
      <q-card-section>
        <SelectProject v-model="project" />
        <SelectWorkFlowTask
          v-model="task"
          :disabled="project === undefined"
          :project-id="project ? project.id : 0"
          :workflow-id="props.workflowId"
        />
      </q-card-section>
      <q-card-actions align="around">
        <q-btn
          class="tw-w-full tw-mx-2 tw-my-3"
          :color="task ? 'primary' : ''"
          :text-color="task ? 'black' : 'white'"
          :disable="!task"
          @click="addTaskNode"
          >添加</q-btn
        >
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-menu ref="viewMenu" touch-position context-menu>
    <q-list dense>
      <q-item key="add-task" v-close-popup clickable @click="ShowAddNodeDialog">
        <q-item-section>添加</q-item-section>
      </q-item>
      <q-item
        v-if="canAddEdge"
        key="add-edge"
        v-close-popup
        clickable
        @click="() => AddEdge(selectedNodes[0], selectedNodes[1])"
      >
        <q-item-section>添加指向：{{ edgeName(selectedNodes) }}</q-item-section>
      </q-item>
      <q-item
        v-if="selectedEdges.length > 0"
        key="remove-edge"
        v-close-popup
        clickable
        @click="() => removeEdges(selectedEdges)"
      >
        <q-item-section>
          删除指向：{{ selectedEdges.map(edgeParts).map(edgeName).join(', ') }}
        </q-item-section>
      </q-item>
      <q-item
        v-if="selectedNodes.length > 0"
        key="remove-task"
        v-close-popup
        clickable
        @click="() => removeNodes(selectedNodes)"
      >
        <q-item-section>
          删除节点：{{ selectedNodes.map(nodeName).join(', ') }}
        </q-item-section>
      </q-item>
      <q-separator />
      <q-item key="reset-view" v-close-popup clickable @click="ResetView">
        <q-item-section>重置视图</q-item-section>
      </q-item>
      <q-item key="reset" v-close-popup clickable @click="reset">
        <q-item-section>重置</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
  import { QMenu } from 'quasar';
  import {
    Edges,
    EventHandlers,
    Layouts,
    NodeLabelDirection,
    NodePositions,
    Nodes,
    UserConfigs,
    VNetworkGraphInstance,
    ViewEvent,
  } from 'v-network-graph';
  import { ForceLayout } from 'v-network-graph/force-layout';
  import {
    PropType,
    computed,
    nextTick,
    onMounted,
    reactive,
    ref,
    toRaw,
    watch,
    watchEffect,
  } from 'vue';

  import { Project, WorkFlowTask } from '@/api/request';
  import SelectProject from '@/components/SelectProject.vue';
  import SelectWorkFlowTask from '@/components/SelectWorkFlowTask.vue';
  import { KahnTask, cloneTask } from '@/types';
  import { TaskInLevels } from '@/utils/kahn';

  const show = ref(false);
  const visual = ref(false);
  const graph = ref<VNetworkGraphInstance>();
  const viewMenu = ref<QMenu>();
  const selectedNodes = ref<string[]>([]);
  const selectedEdges = ref<string[]>([]);

  const nodeName = (nodeKey: string): string => {
    return nodes[nodeKey].name || nodeKey;
  };

  const edgeKey = (nodeKeys: string[]): string => {
    return nodeKeys.join(' -> ');
  };

  const edgeName = (nodeKeys: string[]): string => {
    return nodeKeys.map((k) => nodes[k].name).join(' -> ');
  };

  const edgeParts = (edge: string): [string, string] => {
    const rv = edge.split(' -> ');
    if (rv.length !== 2) {
      throw new Error(`Invalid edge name: ${edge}`);
    }
    return [rv[0], rv[1]];
  };

  const COLOR_PRIMARY = '#99F6e4';
  const layoutHandler = new ForceLayout();

  const NodeColor = (node: any) => (node ? node.color : COLOR_PRIMARY);
  const EdgeColor = (edge: any) => (edge ? edge.color : COLOR_PRIMARY);

  const configs: UserConfigs = {
    view: {
      layoutHandler: layoutHandler,
      scalingObjects: false,
      fit: false,
    },
    node: {
      selectable: true,
      label: {
        direction: NodeLabelDirection.NORTH,
        color: NodeColor,
      },
      normal: {
        color: NodeColor,
      },
      hover: {
        color: NodeColor,
      },
      focusring: {
        color: COLOR_PRIMARY,
      },
    },
    edge: {
      selectable: true,
      normal: {
        color: EdgeColor,
      },
      hover: {
        color: EdgeColor,
      },
      selected: {
        color: EdgeColor,
        width: 4,
        dasharray: '10',
        linecap: 'round',
        animate: true,
        animationSpeed: 10,
      },
      marker: {
        source: {
          type: 'none',
          width: 4,
          height: 4,
          margin: -1,
          units: 'strokeWidth',
          color: null,
        },
        target: {
          type: 'arrow',
          width: 4,
          height: 4,
          margin: -1,
          units: 'strokeWidth',
          color: null,
        },
      },
    },
  };

  const props = defineProps({
    workflowId: {
      type: Number,
      required: true,
    },
    tasks: {
      type: Object as PropType<KahnTask[]>,
      required: true,
    },
    modelValue: {
      type: Object as PropType<KahnTask[]>,
      default: new Array<KahnTask[]>(0),
    },
  });
  const emits = defineEmits(['update:modelValue']);

  const eventHandlers = computed<EventHandlers>(() => {
    const hideContextMenu = () => {
      viewMenu.value?.hide();
    };
    const showViewContextMenu = (params: ViewEvent<MouseEvent>) => {
      const { event } = params;
      // Disable browser's default context menu
      event.stopPropagation();
      event.preventDefault();
      const menu = viewMenu.value;
      if (menu) {
        hideContextMenu();
        menu.show(event);
      }
    };
    return {
      'view:load': () => {},
      'view:contextmenu': showViewContextMenu,
      'node:select': (nodes) => {
        hideContextMenu();
      },
      'edge:select': (edges) => {
        hideContextMenu();
      },
    };
  });

  const nodes = reactive<Nodes>({});

  const ColorNode = (task: KahnTask): string => {
    const status = task.state?.currentStatus;
    if (status === 'done') {
      return COLOR_PRIMARY;
    } else if (status === 'running') {
      return 'green';
    } else if (status === 'failed') {
      return 'red';
    } else if (status === 'starting') {
      return 'white';
    }
    return 'gray';
  };

  const taskNodes = computed<Nodes>(() => {
    const nodes: Nodes = {};
    for (const task of props.modelValue) {
      nodes[task.id] = { id: task.id, name: task.name, color: ColorNode(task) };
    }
    return nodes;
  });

  const NodeMapTask = computed<Map<String, KahnTask>>(() => {
    const map = new Map();
    for (const task of props.modelValue) {
      map.set(task.id, task);
    }
    return map;
  });

  function updateNodes(current: Nodes) {
    for (const key of Object.keys(nodes)) {
      delete nodes[key];
    }
    for (const key of Object.keys(current)) {
      nodes[key] = Object.assign({}, current[key]);
    }
    selectedNodes.value = [];
  }

  const edges = reactive<Edges>({});

  const taskEdges = computed<Edges>(() => {
    const edges: Edges = {};
    for (const task of props.modelValue) {
      if (!task.deps) {
        continue;
      }
      for (const parentId of task.deps) {
        edges[edgeKey([parentId, task.id])] = {
          source: parentId,
          target: task.id,
          color: ColorNode(task),
        };
      }
    }
    return edges;
  });

  function updateEdges(current: Edges) {
    for (const key of Object.keys(edges)) {
      delete edges[key];
    }
    for (const key of Object.keys(current)) {
      edges[key] = Object.assign({}, current[key]);
    }
    selectedEdges.value = [];
  }

  const layouts = ref<Layouts>({ nodes: {} });

  const taskLayouts = computed<Layouts>(() => {
    const nodes: NodePositions = {};
    const levels = TaskInLevels(props.modelValue);
    const xOffset = 50;
    const yOffset = 50;
    let y = 0;
    for (const level of levels) {
      let x = 0;
      for (const node of level) {
        nodes[node] = {
          x: x * xOffset + (y * xOffset) / 2,
          y: y * yOffset,
          fixed: false,
        };
        x++;
      }
      y++;
    }
    return { nodes };
  });

  function updateLayouts(current: Layouts) {
    const nodes = layouts.value.nodes;
    for (const key of Object.keys(nodes)) {
      delete nodes[key];
    }
    for (const key of Object.keys(current.nodes)) {
      nodes[key] = Object.assign({}, current.nodes[key]);
    }
  }

  function ResetView() {
    updateNodes(taskNodes.value);
    updateEdges(taskEdges.value);
    updateLayouts(taskLayouts.value);
  }

  function removeNode(current: KahnTask[], node: string) {
    let index = 0;
    let deleted = false;
    for (const task of current) {
      if (task.id === node) {
        current.splice(index, 1);
        deleted = true;
        break;
      }
      index++;
    }
    if (!deleted) {
      throw new Error(`Can not remove node: ${node}`);
    }

    for (const task of current) {
      if (task.deps !== undefined) {
        const index = task.deps.indexOf(node, 0);
        if (index > -1) {
          task.deps.splice(index, 1);
          if (task.deps.length === 0) {
            delete task.deps;
          }
        }
      }
    }
  }

  function removeNodes(nodes: string[]) {
    const current = props.modelValue.map(cloneTask);
    nodes.forEach((node) => removeNode(current, node));
    emits('update:modelValue', current);
  }

  function AddEdge(source: string, target: string) {
    const current = props.modelValue.map(cloneTask);
    for (const task of current) {
      if (task.id === target) {
        if (!task.deps) task.deps = [];
        task.deps.push(source);
        unSelect();
        emits('update:modelValue', current);
        return;
      }
    }
    throw new Error(`Can not add edge: ${edgeKey([source, target])}`);
  }

  function removeEdge(current: KahnTask[], source: string, target: string) {
    for (const task of current) {
      if (task.id === target && task.deps !== undefined) {
        const index = task.deps.indexOf(source, 0);
        if (index > -1) {
          task.deps.splice(index, 1);
          if (task.deps.length === 0) {
            delete task.deps;
          }
          return;
        }
      }
    }
    throw new Error(`Can not remove edge: ${edgeKey([source, target])}`);
  }

  function removeEdges(edges: string[]) {
    const current = props.modelValue.map(cloneTask);
    for (const edge of edges) {
      const [source, target] = edgeParts(edge);
      removeEdge(current, source, target);
    }
    emits('update:modelValue', current);
  }

  function unSelect() {
    selectedEdges.value.splice(0, selectedEdges.value.length);
    selectedNodes.value.splice(0, selectedNodes.value.length);
  }

  function reset() {
    emits('update:modelValue', props.tasks);
  }

  const CanAddEdge = (source: string, target: string) =>
    edges[edgeKey([source, target])] === undefined &&
    edges[edgeKey([target, source])] === undefined;

  const canAddEdge = computed(() => {
    const nodes = selectedNodes.value;
    if (nodes.length === 2) {
      const [source, target] = nodes;
      return CanAddEdge(source, target);
    }
    return false;
  });

  const addNodeDialogVisibility = ref(false);
  const project = ref<Project>();
  const task = ref<WorkFlowTask>();

  function ShowAddNodeDialog() {
    addNodeDialogVisibility.value = true;
  }

  function HideAddNodeDialog() {
    project.value = undefined;
    task.value = undefined;
    addNodeDialogVisibility.value = false;
  }

  function addTaskNode() {
    emits('update:modelValue', [
      ...props.modelValue,
      {
        name: task.value?.name,
        id: `${project.value?.id}_${task.value?.id}`,
        origin: task.value,
      },
    ]);
    HideAddNodeDialog();
  }

  onMounted(() => {
    watch(
      () => props.tasks,
      (current, previous) => {
        show.value = false;
        visual.value = false;
        previousNodes.value = undefined;
        reset();
      },
    );

    watch(
      () => props.modelValue,
      (current) => {
        updateNodes(taskNodes.value);
        updateEdges(taskEdges.value);
        if (JSON.stringify(current) === JSON.stringify(props.tasks)) {
          updateLayouts(taskLayouts.value);
        }
        show.value = true;
      },
    );

    function similarLayout(A: NodePositions, B: NodePositions): boolean {
      try {
        for (const key of Object.keys(A)) {
          const nodeA = A[key];
          const nodeB = B[key];
          if (
            Math.abs(nodeA.x - nodeB.x) > 0.5 ||
            Math.abs(nodeA.y - nodeB.y) > 0.5
          )
            return false;
        }
      } catch (error) {
        return false;
      }
      return true;
    }

    const previousNodes = ref();
    watch<[Layouts, VNetworkGraphInstance | undefined, boolean]>(
      () => [layouts.value, graph.value, show.value],
      ([currentLayouts, graph, show]) => {
        if (!visual.value && graph && show) {
          // graph.panToCenter();
          if (similarLayout(currentLayouts.nodes, previousNodes.value)) {
            setTimeout(() => {
              nextTick(() => {
                graph.panToCenter();
                visual.value = true;
              });
            }, 500);
          }
        }

        previousNodes.value = JSON.parse(
          JSON.stringify(toRaw(layouts.value.nodes)),
        );
      },
      { deep: true },
    );
  });

  function RemoveSelectedNodes() {
    removeNodes(selectedNodes.value);
  }

  function RemoveSelectedEdges() {
    removeEdges(selectedEdges.value);
  }

  function SetAddEdgeMode() {
    const [source] = selectedNodes.value;
    const cancel = watchEffect(() => {
      if (selectedNodes.value.length !== 1) return;
      const [target] = selectedNodes.value;
      if (source === target || !CanAddEdge(source, target)) return;
      AddEdge(source, target);
      cancel();
    });
  }

  defineExpose({
    ShowAddNodeDialog,
    RemoveSelectedNodes,
    SelectedNodes: selectedNodes,
    RemoveSelectedEdges,
    SelectedEdges: selectedEdges,
    ResetView,
    AddEdge,
    SetAddEdgeMode,
    NodeMapTask,
  });
</script>
