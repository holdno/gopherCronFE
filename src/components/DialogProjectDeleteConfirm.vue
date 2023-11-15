<template>
  <Confirm
    v-model="show"
    :content="'是否要删除项目' + project?.title + '?'"
    type="warning"
    :loading="loading"
    @confirm="project && deleteProject(project.id)"
  ></Confirm>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';

  import Confirm from './Confirm.vue';

  import { useStore } from '@/store/index';

  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
    orgId: {
      type: String,
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

  const store = useStore();
  const project = computed(() =>
    store.state.Project.projects.find((p) => p.id === props.projectId),
  );
  const loading = ref(false);
  async function deleteProject(projectId: number) {
    loading.value = true;
    try {
      store.commit('cleanError');
      await store.dispatch('deleteProject', {
        projectId: projectId,
        orgId: props.orgId,
      });
      if (store.state.Root.currentError === undefined) {
        show.value = false;
      }
    } catch (e: any) {
      console.error(e);
    }
    loading.value = false;
  }
</script>
