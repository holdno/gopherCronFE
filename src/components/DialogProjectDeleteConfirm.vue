<template>
  <Confirm
    v-model="show"
    :content="'是否要删除项目' + project?.title + '?'"
    type="warning"
    @confirm="project && deleteProject(project.id)"
  ></Confirm>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';

  import Confirm from './Confirm.vue';

  import { useStore } from '@/store/index';

  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
  });

  const emits = defineEmits(['update:modelValue']);

  const show = computed({
    get: () => props.modelValue,
    set: (value) => emits('update:modelValue', value),
  });
  const router = useRouter();
  const store = useStore();
  const project = computed(() =>
    store.state.Root.projects.find((p) => p.id === props.projectId),
  );
  async function deleteProject(projectId: number) {
    store.commit('clearError');
    await store.dispatch('deleteProject', { projectId });
    if (store.state.Root.currentError === undefined) {
      router.push({ name: 'projects' });
      show.value = false;
    }
  }
</script>
