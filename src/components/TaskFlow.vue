<template>
  <v-network-graph
    v-model:selected-nodes="selectedNodes"
    v-model:selected-edges="selectedEdges"
    v-model:layouts="layouts"
    :nodes="nodes"
    :edges="edges"
    :configs="configs"
    :event-handlers="eventHandlers"
  />
  <q-menu ref="viewMenu" touch-position context-menu>
    <q-list dense>
      <q-item key="add-task" v-close-popup clickable>
        <q-item-section>添加</q-item-section>
      </q-item>
      <template v-if="canAddEdge">
        <q-item
          key="add-edge"
          v-close-popup
          clickable
          @click="() => addEdge(selectedNodes[0], selectedNodes[1])"
        >
          <q-item-section
            >添加指向：{{ edgeName(selectedNodes.reverse()) }}</q-item-section
          >
        </q-item>
      </template>
      <template v-if="selectedEdges.length > 0">
        <q-item
          key="remove-edge"
          v-close-popup
          clickable
          @click="() => removeEdges(selectedEdges)"
        >
          <q-item-section
            >删除指向：{{ selectedEdges.join(', ') }}</q-item-section
          >
        </q-item>
      </template>
      <template v-if="selectedNodes.length > 0">
        <q-item
          key="remove-task"
          v-close-popup
          clickable
          @click="() => selectedNodes.map(removeNode)"
        >
          <q-item-section
            >删除节点：{{ selectedNodes.join(', ') }}</q-item-section
          >
        </q-item>
      </template>
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

<script lang="ts">
  import { defineComponent, PropType, ref, reactive } from 'vue';
  import {
    Nodes,
    Edges,
    Layouts,
    ViewEvent,
    EventHandlers,
    UserConfigs,
    NodeLabelDirection,
  } from 'v-network-graph';
  import { ForceLayout } from 'v-network-graph/force-layout';
  import { cloneTask, Task } from '../types';
  import { TaskInLevels } from '../utils/kahn';
  import { QMenu } from 'quasar';

  const viewMenu = ref<QMenu>();
  const nodeMenu = ref<QMenu>();
  const menuTargetNode = ref('');
  const edgeMenu = ref<QMenu>();
  const menuTargetEdges = ref<string[]>([]);
  const selectedNodes = ref<string[]>([]);
  const selectedEdges = ref<string[]>([]);

  const edgeName = (nodes: string[]): string => {
    return nodes.join(' -> ');
  };

  const edgeParts = (edge: string): [string, string] => {
    const rv = edge.split(' -> ');
    if (rv.length !== 2) {
      throw new Error(`Invalid edge name: ${edge}`);
    }
    return [rv[0], rv[1]];
  };

  const configs: UserConfigs = {
    view: {
      layoutHandler: new ForceLayout(),
    },
    node: {
      selectable: true,
      label: {
        direction: NodeLabelDirection.NORTH,
      },
    },
    edge: {
      selectable: true,
      selected: {
        width: 4,
        color: '#eebb00',
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

  const Component = defineComponent({
    props: {
      tasks: {
        type: Object as PropType<Task[]>,
        required: true,
      },
    },
    setup(props) {
      return {
        current: reactive<Task[]>(props.tasks.map(cloneTask)),
        nodes: reactive<Nodes>({}),
        edges: reactive<Edges>({}),
        layouts: reactive<Layouts>({ nodes: {} }),
        edgeName,
        viewMenu,
        nodeMenu,
        menuTargetNode,
        edgeMenu,
        menuTargetEdges,
        configs,
        selectedNodes,
        selectedEdges,
      };
    },
    computed: {
      eventHandlers(): EventHandlers {
        const hideContextMenu = () => {
          this.viewMenu?.hide();
          this.nodeMenu?.hide();
          this.edgeMenu?.hide();
        };
        const showViewContextMenu = (params: ViewEvent<MouseEvent>) => {
          const { event } = params;
          // Disable brawser's default context menu
          event.stopPropagation();
          event.preventDefault();
          if (this.viewMenu) {
            hideContextMenu();
            this.viewMenu.show(event);
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
      },
      canAddEdge(): boolean {
        const nodes = this.selectedNodes;
        if (nodes.length === 2) {
          return (
            this.edges[edgeName(nodes)] === undefined &&
            this.edges[edgeName(nodes.reverse())] === undefined
          );
        }
        return false;
      },
    },
    mounted() {
      this.applyChange();
    },
    methods: {
      reset() {
        this.current = this.tasks.map(cloneTask);
        this.applyChange();
      },
      resetView() {
        this.applyChange();
      },
      removeNode(node: string) {
        let index = 0;
        let deleted = false;
        for (const task of this.current) {
          if (task.id === node) {
            this.current.splice(index, 1);
            deleted = true;
            break;
          }
          index++;
        }
        if (!deleted) {
          throw new Error(`Can not remove node: ${node}`);
        }

        for (const task of this.current) {
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

        this.applyChange();
      },
      removeEdges(edges: string[]) {
        for (const edge of edges) {
          const [source, target] = edgeParts(edge);
          this.removeEdge(source, target);
        }
      },
      removeEdge(source: string, target: string) {
        for (const task of this.current) {
          if (task.id === target && task.deps !== undefined) {
            const index = task.deps.indexOf(source, 0);
            if (index > -1) {
              task.deps.splice(index, 1);
              if (task.deps.length === 0) {
                delete task.deps;
              }
              this.updateEdges();
              return;
            }
          }
        }
        throw new Error(`Can not remove edge: ${edgeName([source, target])}`);
      },
      addEdge(source: string, target: string) {
        for (const task of this.current) {
          if (task.id === target) {
            if (!task.deps) task.deps = [];
            task.deps.push(source);
            this.updateEdges();
            this.unSelect();
            return;
          }
        }
        throw new Error(`Can not add edge: ${edgeName([source, target])}`);
      },
      unSelect() {
        this.selectedEdges.splice(0, this.selectedEdges.length);
        this.selectedNodes.splice(0, this.selectedNodes.length);
      },
      applyChange() {
        this.updateNodes();
        this.updateEdges();
        this.updateLayouts();
      },
      updateNodes() {
        for (const node of Object.keys(this.nodes)) {
          delete this.nodes[node];
        }
        for (const task of this.current) {
          this.nodes[task.id] = { name: task.id };
        }
      },
      updateEdges() {
        for (const edge of Object.keys(this.edges)) {
          delete this.edges[edge];
        }
        for (const task of this.current) {
          if (!task.deps) {
            continue;
          }
          for (const parentId of task.deps) {
            this.edges[edgeName([parentId, task.id])] = {
              source: parentId,
              target: task.id,
            };
          }
        }
      },
      updateLayouts() {
        const nodes = this.layouts.nodes;
        for (const node of Object.keys(nodes)) {
          delete nodes[node];
        }
        const levels = TaskInLevels(this.current);
        let y = 0;
        for (const level of levels) {
          let x = 0;
          for (const node of level) {
            nodes[node] = {
              x: x * 100 + y * 50,
              y: y * 100,
            };
            x++;
          }
          y++;
        }
      },
    },
  });
  export default Component;
</script>
