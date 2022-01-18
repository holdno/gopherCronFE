<template>
  <q-dialog v-model="show">
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="delete" color="primary" text-color="white" />
        <span class="q-ml-sm"> 是否要删除项目 {{ project?.title }}</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="取消" color="primary" />
        <q-btn
          flat
          label="删除"
          color="red"
          @click="() => project && deleteProject(project.id)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { useStore } from '@/store';
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';

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
    store.state.projects.find((p) => p.id === props.projectId),
  );
  async function deleteProject(projectId: number) {
    store.commit('clearError');
    await store.dispatch('deleteProject', { projectId });
    if (store.state.currentError === undefined) {
      router.push({ name: 'projects' });
      show.value = false;
    }
  }
</script>
