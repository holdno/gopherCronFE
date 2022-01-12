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
      key="cron"
      v-model="editable.cronExpr"
      label="调度计划 (*秒 *分 *时 *日 *月 *周 *年)"
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
    <q-toggle
      key="status"
      v-model="editable.status"
      :false-value="0"
      :true-value="1"
      label="是否启用"
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
      <q-btn
        v-if="!isCreateMode"
        flat
        icon="delete"
        @click="showDeleteConfirm = true"
      />
    </div>
    <div class="q-pa-sm">
      <p>TODO: 展示在线节点信息</p>
      <p>TODO: 执行按钮</p>
    </div>
  </q-form>
</template>

<script setup lang="ts">
  import { computed, ref, watchEffect } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useStore } from '../store';

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
    cronExpr: '0 0 0 * * * *',
    remark: '',
    timeout: 0,
    createTime: 0,
    status: 0,
    isRunning: 0,
    noseize: 0,
    exclusion: 0,
    clientIp: '',
    tmpId: '',
  }));

  const store = useStore();
  const task = computed(() => store.state.tasks.find((t) => t.id === props.id));
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
    const { name, command, timeout, cronExpr } = editable.value;
    return name !== '' && command !== '' && timeout >= 0 && cronExpr !== '';
  });

  const router = useRouter();
  async function onSubmit() {
    const newTask = await store.dispatch('saveTask', {
      task: editable.value,
    });
    await store.dispatch('fetchTasks', {
      projectId: props.projectId,
    });
    router.push({
      name: 'task',
      params: {
        taskId: newTask.id,
      },
    });
  }
  function onReset() {
    editable.value = Object.assign({}, task.value || DefaultTaskValues.value);
  }

  const showDeleteConfirm = ref(false);
  async function deleteTask(projectId: number, taskId: string) {
    store.commit('clearError');
    await store.dispatch('deleteTask', { projectId, taskId });
    if (store.state.currentError === undefined) {
      router.push({ name: 'tasks' });
      showDeleteConfirm.value = false;
    }
  }

  const route = useRoute();
  const isCreateMode = computed(
    () => route.name && route.name.toString() === 'create_task',
  );
</script>
