<template>
  <Confirm
    v-model="show"
    :content="'是否要删除任务编排 ' + workflow?.title + ' ?'"
    type="warning"
    :loading="loading"
    @confirm="workflow && deleteWorkFlow(workflow.id)"
  ></Confirm>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';

  import Confirm from './Confirm.vue';

  import { useStore } from '@/store/index';

  const props = defineProps({
    workflowId: {
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
  const workflow = computed(() =>
    store.state.WorkFlow.workflows.get(props.workflowId),
  );
  const loading = ref(false);
  async function deleteWorkFlow(workflowId: number) {
    loading.value = true;
    try {
      store.commit('cleanError');
      await store.dispatch('WorkFlow/deleteWorkFlow', { id: workflowId });
      if (store.state.Root.currentError === undefined) {
        router.push({ name: 'workflows' });
        show.value = false;
      }
    } catch (e: any) {
      console.error(e);
      store.commit('error', { error: e });
    }
    loading.value = false;
  }
</script>
