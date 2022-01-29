<template>
  <q-select
    v-model="project"
    label="项目列表"
    map-options
    emit-value
    behavior="menu"
    :options="
      projects.map((p) => ({
        label: p.title,
        value: p,
      }))
    "
    @filter="filterProjects"
  >
    <template #no-option>
      <q-item>
        <q-item-section class="text-grey"> No results </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
  import { QSelect } from 'quasar';
  import { computed, PropType, ref } from 'vue';
  import { Project } from '@/api/request';
  import { useStore } from '@/store/index';

  const props = defineProps({
    modelValue: {
      type: Object as PropType<Project>,
      default: null,
    },
  });
  const emits = defineEmits(['update:modelValue']);
  const project = computed<Project>({
    get() {
      return props.modelValue;
    },
    set(value) {
      emits('update:modelValue', value);
    },
  });
  const filter = ref('');
  const store = useStore();
  const projects = computed(() =>
    store.state.Root.projects.filter(
      (p: Project) =>
        p.title.indexOf(filter.value) >= 0 ||
        p.id.toString().indexOf(filter.value) >= 0,
    ),
  );
  const filterProjects = (
    inputValue: string,
    doneFn: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void,
    abortFn: () => void,
  ): void => {
    const update = () => (filter.value = inputValue);
    if (projects.value.length === 0) {
      store.dispatch('fetchProjects').then(() => doneFn(update));
    } else {
      doneFn(update);
    }
  };
</script>
