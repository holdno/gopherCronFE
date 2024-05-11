<template>
  <q-select
    v-model="project"
    label="项目列表"
    map-options
    emit-value
    dark
    color="text-white"
    standout="bg-white text-black"
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
  import { PropType, computed, ref } from 'vue';

  import { Project } from '@/api/request';
  import { useStore } from '@/store/index';

  const props = defineProps({
    modelValue: {
      type: Object as PropType<Project>,
      default: null,
    },
    orgId: {
      type: String,
      required: true,
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
    store.state.Project.projects.filter(
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
      store
        .dispatch('Project/fetchProjects', { orgId: props.orgId })
        .then(() => doneFn(update));
    } else {
      doneFn(update);
    }
  };
</script>
