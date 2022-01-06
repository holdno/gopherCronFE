<template>
  <div class="tw-w-1/2 tw-h-full">
    <v-network-graph
      ref="graph"
      v-model:selected-nodes="selectedNodes"
      v-model:selected-edges="selectedEdges"
      v-model:layouts="layouts"
      :nodes="nodes"
      :edges="edges"
      :configs="configs"
      :event-handlers="eventHandlers"
    />
  </div>
  <q-dialog v-model="showAddNodeDialog" class="tw-w-screen tw-h-screen">
    <div
      class="tw-w-1/2 tw-h-1/2 tw-text-primary tw-flex tw-flex-row tw-gap-4 q-pa-md"
    >
      <SelectProject v-model="project" />
      <SelectTask
        v-if="project !== undefined"
        v-model="task"
        :project-id="project.id"
      />
      <q-btn @click="addTaskNode">添加</q-btn>
    </div>
  </q-dialog>
  <q-menu ref="viewMenu" touch-position context-menu>
    <q-list dense>
      <q-item
        key="add-task"
        v-close-popup
        clickable
        @click="() => (showAddNodeDialog = true)"
      >
        <q-item-section>添加</q-item-section>
      </q-item>
      <q-item
        v-if="canAddEdge"
        key="add-edge"
        v-close-popup
        clickable
        @click="() => addEdge(selectedNodes[0], selectedNodes[1])"
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
        <q-item-section
          >删除指向：{{
            selectedEdges.map(edgeParts).map(edgeName).join(', ')
          }}</q-item-section
        >
      </q-item>
      <q-item
        v-if="selectedNodes.length > 0"
        key="remove-task"
        v-close-popup
        clickable
        @click="() => removeNodes(selectedNodes)"
      >
        <q-item-section
          >删除节点：{{
            selectedNodes.map(nodeName).join(', ')
          }}</q-item-section
        >
      </q-item>
      <q-separator />
      <q-item key="reset-view" v-close-popup clickable @click="resetView">
        <q-item-section>重置视图</q-item-section>
      </q-item>
      <q-item key="reset" v-close-popup clickable @click="reset">
        <q-item-section>重置</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
  import {
    PropType,
    ref,
    computed,
    watch,
    onMounted,
    toRaw,
    reactive,
  } from 'vue';
  import {
    Nodes,
    Edges,
    NodePositions,
    Layouts,
    ViewEvent,
    EventHandlers,
    UserConfigs,
    NodeLabelDirection,
    VNetworkGraphInstance,
  } from 'v-network-graph';
  import { ForceLayout } from 'v-network-graph/force-layout';
  import { cloneTask, KahnTask } from '../types';
  import { TaskInLevels } from '../utils/kahn';
  import { QMenu } from 'quasar';
  import SelectProject from './SelectProject.vue';
  import SelectTask from './SelectTask.vue';
  import { Project, Task } from '../request';

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

  const configs: UserConfigs = {
    view: {
      layoutHandler: layoutHandler,
      fit: true,
    },
    node: {
      selectable: true,
      label: {
        direction: NodeLabelDirection.NORTH,
        color: COLOR_PRIMARY,
      },
      normal: {
        color: COLOR_PRIMARY,
      },
      hover: {
        color: COLOR_PRIMARY,
      },
      focusring: {
        color: COLOR_PRIMARY,
      },
    },
    edge: {
      selectable: true,
      normal: {
        color: COLOR_PRIMARY,
      },
      hover: {
        color: COLOR_PRIMARY,
      },
      selected: {
        color: COLOR_PRIMARY,
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

  const taskNodes = computed<Nodes>(() => {
    const nodes: Nodes = {};
    for (const task of props.modelValue) {
      nodes[task.id] = { id: task.id, name: task.name };
    }
    return nodes;
  });

  function updateNodes(current: Nodes) {
    for (const key of Object.keys(nodes)) {
      delete nodes[key];
    }
    for (const key of Object.keys(current)) {
      nodes[key] = Object.assign({}, current[key]);
    }
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
  }

  const layouts = reactive<Layouts>({ nodes: {} });

  const taskLayouts = computed<Layouts>(() => {
    const nodes: NodePositions = {};
    const levels = TaskInLevels(props.modelValue);
    let y = 0;
    for (const level of levels) {
      let x = 0;
      for (const node of level) {
        nodes[node] = {
          x: x * 100 + y * 50,
          y: y * 100,
          fixed: false,
        };
        x++;
      }
      y++;
    }
    return { nodes };
  });

  function updateLayouts(current: Layouts) {
    const nodes = layouts.nodes;
    for (const key of Object.keys(nodes)) {
      delete nodes[key];
    }
    for (const key of Object.keys(current.nodes)) {
      nodes[key] = Object.assign({}, current.nodes[key]);
    }
  }

  function resetView() {
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

  function addEdge(source: string, target: string) {
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

  const canAddEdge = computed(() => {
    const nodes = selectedNodes.value;
    if (nodes.length === 2) {
      return (
        edges[edgeKey(nodes)] === undefined &&
        edges[edgeKey(Array.from(nodes).reverse())] === undefined
      );
    }
    return false;
  });

  const showAddNodeDialog = ref(false);
  const project = ref<Project>();
  const task = ref<Task>();

  function addTaskNode() {
    emits('update:modelValue', [
      ...props.modelValue,
      {
        name: task.value?.name,
        id: `${project.value?.id}_${task.value?.id}`,
      },
    ]);
    project.value = undefined;
    task.value = undefined;
    showAddNodeDialog.value = false;
  }

  onMounted(() => {
    watch(
      () => props.tasks,
      (current, previous) => {
        reset();
      },
    );
    watch(
      () => props.modelValue,
      (current, previous) => {
        updateEdges(taskEdges.value);
        updateNodes(taskNodes.value);
        if (toRaw(current) === props.tasks) {
          updateLayouts(taskLayouts.value);
          graph.value?.panToCenter();
        }
      },
    );
  });
</script>
