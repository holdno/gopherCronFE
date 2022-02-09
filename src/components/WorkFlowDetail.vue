<template>
  <q-form @submit="onSubmit" @reset="onReset">
    <q-card-section>
      <div v-if="isCreateMode" class="text-h6">创建任务编排</div>
      <div v-else class="text-h6">任务编排详情</div>
    </q-card-section>
    <q-card-section>
      <q-input
        v-model="editable.title"
        type="text"
        label="名称"
        square
        filled
        class="tw-mb-4"
      />
      <q-input
        key="cron"
        v-model="editable.cronExpr"
        label="调度计划 (*秒 *分 *时 *日 *月 *周 *年)"
        square
        filled
        class="tw-mb-4"
      />
      <q-input
        v-model="editable.remark"
        type="textarea"
        label="备注"
        square
        filled
      />
      <q-toggle
        key="status"
        v-model="editable.status"
        :false-value="2"
        :true-value="1"
        label="是否启用"
        class="tw-mb-4"
      />
    </q-card-section>
    <q-card-section
      align="right"
      class="tw-flex tw-gap-4 tw-flex-col-reverse lg:tw-flex-row lg:tw-justify-end"
    >
      <q-btn
        type="reset"
        flat
        label="重置"
        class="lg:tw-w-24 tw-w-full"
        :disable="!modified"
      />
      <q-btn
        color="primary"
        text-color="black"
        type="submit"
        :label="isCreateMode ? '创建' : '保存'"
        :disable="!modified || !canSave"
        class="lg:tw-w-24 tw-w-full"
      />
    </q-card-section>
  </q-form>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch, watchEffect } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import {
    STATUS_WORK_FLOW_DISABLE,
    WorkFlow,
    createWorkflow,
    updateWorkflow,
  } from '@/api/request';
  import { useStore } from '@/store/index';

  const props = defineProps({
    id: {
      type: Number,
      default: 0,
    },
  });

  const DefaultTaskValues = computed<WorkFlow>(() => ({
    id: 0,
    title: '',
    cronExpr: '0 0 0 * * * *',
    remark: '',
    createTime: 0,
    status: STATUS_WORK_FLOW_DISABLE,
    state: null,
  }));

  const router = useRouter();
  const store = useStore();
  const workflowInfo = computed(() =>
    store.state.WorkFlow.workflows.get(props.id),
  );
  const editable = ref(
    Object.assign({}, workflowInfo.value || DefaultTaskValues.value),
  );
  function onReset() {
    editable.value = Object.assign(
      {},
      workflowInfo.value || DefaultTaskValues.value,
    );
  }

  watchEffect(() => {
    editable.value = Object.assign(
      {},
      workflowInfo.value || DefaultTaskValues.value,
    );
  });
  async function onSubmit() {
    const v = editable.value;
    if (isCreateMode.value) {
      await createWorkflow(
        store.getters.apiv1,
        v.title.trim(),
        v.remark.trim(),
        v.cronExpr.trim(),
        v.status,
      );
      router.push({
        name: 'workflows',
      });
    } else {
      await updateWorkflow(store.getters.apiv1, editable.value);
      await refreshInfo();
    }
  }
  const route = useRoute();
  const isCreateMode = computed(
    () => route.name && route.name.toString() === 'create_workflow',
  );

  async function refreshInfo() {
    if (!isCreateMode.value)
      store.dispatch('WorkFlow/fetchWorkFlow', { id: props.id });
  }

  const modified = computed(() => {
    return (
      JSON.stringify(workflowInfo.value) !== JSON.stringify(editable.value)
    );
  });
  const canSave = computed(() => {
    const { title, cronExpr } = editable.value;
    return title.trim() !== '' && cronExpr.trim() !== '';
  });

  onMounted(() => {
    refreshInfo();
    watch(
      () => props.id,
      async (current) => {
        await refreshInfo();
      },
    );
  });
</script>
