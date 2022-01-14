<template>
  <q-dialog v-model="showDeleteConfirm">
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="delete" color="primary" text-color="white" />
        <span class="q-ml-sm"> 是否要删除任务 {{ task?.name }}</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="取消" color="primary" />
        <q-btn
          flat
          label="删除"
          color="red"
          @click="() => project && task && deleteTask(project.id, task.id)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <div
    v-if="!isCreateMode"
    class="tw-flex tw-flex-row-reverse tw-pb-3 tw-flex-wrap tw-gap-1"
  >
    <q-btn
      flat
      class="tw-w-24 tw-text-red-300 lg:tw-hidden"
      icon="delete"
      @click="showDeleteConfirm = true"
    />
    <q-btn
      color="primary"
      text-color="black"
      :disable="true || modified"
      class="tw-w-24"
      :loading="executing"
      @click="() => task && execute(projectId, task.id)"
    >
      执行
    </q-btn>
  </div>
  <q-form class="tw-w-full" @submit="onSubmit" @reset="onReset">
    <q-input
      v-if="task"
      key="id"
      :model-value="task.id"
      disable
      label="任务 ID"
      square
      filled
      class="tw-mb-4"
    />
    <q-input
      key="project"
      :model-value="project ? project.title : ''"
      disable
      label="所属项目"
      square
      filled
      class="tw-mb-4"
    />
    <q-input
      key="name"
      v-model="editable.name"
      label="任务名称"
      square
      filled
      class="tw-mb-4"
    />
    <q-input
      key="timeout"
      v-model="editable.timeout"
      type="number"
      label="超时时间 (单位:秒 s 0则不限制)"
      square
      filled
      class="tw-mb-4"
    />
    <q-input
      key="command"
      v-model="editable.command"
      type="textarea"
      label="执行指令"
      autogrow
      square
      filled
      class="tw-mb-4"
    />
    <q-input
      key="remark"
      v-model="editable.remark"
      type="textarea"
      label="任务备注"
      autogrow
      square
      filled
      class="tw-mb-4"
    />
    <q-toggle
      key="noseize"
      v-model="editable.noseize"
      :false-value="0"
      :true-value="1"
      label="并行调度"
      class="tw-mb-4"
    />
    <div class="q-pa-sm">
      <q-btn
        color="primary"
        text-color="black"
        type="submit"
        label="保存"
        :disable="!modified || !canSave"
        class="lg:tw-w-24 tw-w-full lg:tw-mr-4 lg:tw-mb-0 tw-mb-4"
      />
      <q-btn
        color="primary"
        type="reset"
        label="重置"
        flat
        :disable="!modified"
        class="lg:tw-w-24 tw-w-full"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watchEffect } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { startTask } from '@/request';
  import { useStore } from '@/store';

  const props = defineProps({
    id: {
      type: String,
      default: '',
    },
    projectId: {
      type: Number,
      required: true,
    },
  });

  const DefaultTaskValues = computed(() => ({
    id: '',
    name: '',
    projectId: props.projectId,
    command: 'echo "hello world"',
    remark: '',
    timeout: 300,
    createTime: 0,
    noseize: 0,
  }));

  const store = useStore();
  const task = computed(() =>
    store.state.workFlowTasks.find((t) => t.id === props.id),
  );
  const project = computed(() =>
    store.state.projects.find((p) => p.id === props.projectId),
  );
  const editable = ref(
    Object.assign({}, task.value || DefaultTaskValues.value),
  );
  watchEffect(() => {
    editable.value = Object.assign({}, task.value || DefaultTaskValues.value);
  });
  const modified = computed(() => {
    return JSON.stringify(task.value) !== JSON.stringify(editable.value);
  });
  const canSave = computed(() => {
    const { name, command, timeout } = editable.value;
    return name !== '' && command !== '' && timeout > 0;
  });

  const router = useRouter();
  async function onSubmit() {
    await store.dispatch('saveWorkFlowTask', {
      task: {
        ...editable.value,
        timeout: Number(editable.value.timeout),
      },
    });
    await store.dispatch('fetchWorkFlowTasks', {
      projectId: props.projectId,
    });
    router.push({
      name: 'workflow_tasks',
      params: {
        projectId: props.projectId,
      },
    });
  }
  function onReset() {
    editable.value = Object.assign({}, task.value || DefaultTaskValues.value);
  }

  const showDeleteConfirm = ref(false);
  async function deleteTask(projectId: number, taskId: string) {
    store.commit('clearError');
    await store.dispatch('deleteWorkFlowTask', { projectId, taskId });
    if (store.state.currentError === undefined) {
      store.dispatch('fetchWorkFlowTasks', { ...props });
      router.push({ name: 'workflow_tasks' });
      showDeleteConfirm.value = false;
    }
  }

  const route = useRoute();
  const isCreateMode = computed(
    () => route.name && route.name.toString() === 'create_workflow_task',
  );

  const executing = ref(false);
  async function execute(projectId: number, taskId: string) {
    executing.value = true;
    try {
      await startTask(store.getters.apiv1, projectId, taskId);
    } finally {
      executing.value = false;
    }
  }

  onMounted(() => {
    store.watch(
      (state) => [state.eventWorkFlowTask],
      (current) => {
        store.dispatch('fetchWorkFlowTasks', {
          projectId: props.projectId,
        });
      },
    );
  });
</script>