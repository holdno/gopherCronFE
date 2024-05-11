<template>
  <q-select
    v-model="task"
    label="任务列表"
    map-options
    emit-value
    dark
    color="text-white"
    standout="bg-white text-black"
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

  import { Task } from '@/api/request';
  import { useStore } from '@/store/index';

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
  const tasks = computed(
    () =>
      store.state.Task.tasks
        .get(props.projectId)
        ?.filter(
          (t: Task) =>
            t.name.indexOf(filter.value) >= 0 ||
            t.id.indexOf(filter.value) >= 0,
        ) || [],
  );
  const filterTasks = (
    inputValue: string,
    doneFn: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void,
    abortFn: () => void,
  ): void => {
    const update = () => (filter.value = inputValue);
    if (tasks.value.length === 0) {
      store
        .dispatch('Task/fetchTasks', { projectId: props.projectId })
        .then(() => doneFn(update));
    } else {
      doneFn(update);
    }
  };

  onMounted(() => {
    watch(
      () => props.projectId,
      (current, previous) => {
        emits('update:modelValue', undefined);
      },
    );
  });
</script>
