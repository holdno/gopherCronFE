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
  import { computed, onMounted, PropType, ref, watch } from 'vue';
  import { Task } from '@/api/request';
  import { useStore } from '@/store';

  const props = defineProps({
    modelValue: {
      type: Object as PropType<Task>,
      default: null,
    },
    projectId: {
      type: Number,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });
  const emits = defineEmits(['update:modelValue']);
  const task = computed<Task>({
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
    store.state.tasks.filter(
      (t: Task) =>
        t.name.indexOf(filter.value) >= 0 || t.id.indexOf(filter.value) >= 0,
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
        .dispatch('fetchTasks', { projectId: props.projectId })
        .then(() => doneFn(update));
    } else {
      doneFn(update);
    }
  };

  onMounted(() => {
    store.commit('setTasks', { tasks: [] });
    watch(
      () => props.projectId,
      (current, previous) => {
        emits('update:modelValue', undefined);
        store.commit('setTasks', { tasks: [] });
      },
    );
  });
</script>
