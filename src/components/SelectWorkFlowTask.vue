<template>
  <q-select
    v-model="task"
    label="任务列表"
    map-options
    emit-value
    behavior="menu"
    :disable="props.disabled"
    :options="
      tasks.map((t) => ({
        label: t.name,
        value: t,
      }))
    "
    @filter="filterTasks"
  ></q-select>
</template>

<script setup lang="ts">
  import { QSelect } from 'quasar';
  import { PropType, computed, onMounted, ref, watch } from 'vue';

  import { WorkFlowTask } from '@/api/request';
  import { useStore } from '@/store/index';

  const props = defineProps({
    modelValue: {
      type: Object as PropType<WorkFlowTask>,
      default: null,
    },
    projectId: {
      type: Number,
      required: true,
    },
    workflowId: {
      type: Number,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });
  const emits = defineEmits(['update:modelValue']);
  const task = computed<WorkFlowTask>({
    get() {
      return props.modelValue;
    },
    set(value) {
      emits('update:modelValue', value);
    },
  });
  const filter = ref('');
  const store = useStore();
  const tasks = computed(() =>
    store.state.Root.workFlowTasks.filter(
      (t: WorkFlowTask) =>
        (t.workflowId === 0 || t.workflowId === props.workflowId) &&
        (t.name.indexOf(filter.value) >= 0 || t.id.indexOf(filter.value) >= 0),
    ),
  );
  const filterTasks = (
    inputValue: string,
    doneFn: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void,
    abortFn: () => void,
  ): void => {
    const update = () => (filter.value = inputValue);
    if (tasks.value.length === 0) {
      store
        .dispatch('fetchWorkFlowTasks', { projectId: props.projectId })
        .then(() => doneFn(update));
    } else {
      doneFn(update);
    }
  };

  onMounted(() => {
    store.commit('setWorkFlowTasks', { workFlowTasks: [] });
    watch(
      () => props.projectId,
      (current, previous) => {
        emits('update:modelValue', undefined);
        store.commit('setWorkFlowTasks', { workFlowTasks: [] });
      },
    );
  });
</script>
