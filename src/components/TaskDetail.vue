<template>
  <div class="tw-h-full tw-w-full tw-flex tw-flex-col">
    <DialogTemporaryTaskForm
      v-model="showCreateTemporaryTask"
      :task="task"
    ></DialogTemporaryTaskForm>
    <Confirm
      v-model="showDeleteConfirm"
      :content="'是否要删除任务' + task?.name + '?'"
      type="warning"
      @confirm="project && task && deleteTask(project.id, task.id)"
    ></Confirm>
    <Confirm
      v-model="showKillConfirm"
      content="确定要结束进程吗？"
      type="warning"
      @confirm="kill"
    ></Confirm>
    <Confirm
      v-model="showExecuteConfirm"
      content="确定要立即执行吗？"
      @confirm="task && execute(projectId, task.id)"
    ></Confirm>
    <div
      v-if="!isCreateMode"
      class="tw-flex tw-flex-row-reverse tw-pb-3 tw-flex-wrap tw-gap-2"
    >
      <q-btn
        flat
        class="tw-w-24 tw-text-red-300 lg:tw-hidden"
        icon="delete"
        @click="showDeleteConfirm = true"
      />

      <q-btn
        v-if="task?.isRunning === 1"
        flat
        text-color="red"
        :disable="task?.isRunning !== 1"
        class="tw-w-24 tw-ml-1"
        :loading="waitingKill"
        @click="showKillConfirm = true"
        >结束进程</q-btn
      >
      <q-btn
        color="primary"
        text-color="black"
        :disable="modified || task?.isRunning === 1"
        class="tw-w-24"
        :loading="executing || task?.isRunning === 1"
        @click="showExecuteConfirm = true"
        >立即执行</q-btn
      >

      <q-btn
        color="warning"
        text-color="black"
        :disable="modified || task?.isRunning === 1"
        class="tw-w-24 tw-opacity-90"
        :loading="executing || task?.isRunning === 1"
        @click="showCreateTemporaryTask = true"
        >临时调度
        <q-tooltip class="bg-warning tw-text-black" :offset="[10, 10]">
          指定时间调度一次的任务
        </q-tooltip>
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
        key="cron"
        v-model="editable.cronExpr"
        label="调度计划 (*秒 *分 *时 *日 *月 *周 *年)"
        square
        filled
        class="tw-mb-4"
      />
      <q-input
        key="timeout"
        v-model.number="editable.timeout"
        type="number"
        label="超时时间 (单位:秒 s)"
        square
        filled
        class="tw-mb-4"
      />
      <q-input
        key="command"
        v-model="editable.command"
        placeholder='echo "hello word"'
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
          :disable="!modified"
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
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watchEffect } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import { startTask } from '@/api/request';
  import { killTask } from '@/api/task';
  import Confirm from '@/components/Confirm.vue';
  import DialogTemporaryTaskForm from '@/components/DialogTemporaryTaskForm.vue';
  import { useStore } from '@/store/index';

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
    command: '',
    cronExpr: '0 0 0 * * * *',
    remark: '',
    timeout: 300,
    createTime: 0,
    status: 0,
    isRunning: 0,
    noseize: 0,
    exclusion: 0,
    clientIp: '',
    tmpId: '',
  }));

  const store = useStore();
  const task = computed(() =>
    store.state.Task.tasks.get(props.projectId)?.find((t) => t.id === props.id),
  );
  const project = computed(() =>
    store.state.Project.projects.find((p) => p.id === props.projectId),
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
    return name !== '' && command !== '' && timeout > 0 && cronExpr !== '';
  });
  const cantSaveReason = computed(() => {
    const { name, command, timeout, cronExpr } = editable.value;
    if (name === '') {
      return '任务名称不能为空';
    } else if (command === '') {
      return '执行指令不能为空';
    } else if (timeout <= 0) {
      return '超时时间未指定';
    } else if (cronExpr === '') {
      return '调度计划未指定';
    }
    return '';
  });

  const router = useRouter();
  async function onSubmit() {
    store.commit('cleanError');
    if (!canSave.value) {
      store.commit('error', { error: { message: cantSaveReason.value } });
      return;
    }
    const newTask = await store.dispatch('saveTask', {
      task: editable.value,
    });
    if (isCreateMode.value) {
      router.push({
        name: 'crontab_task',
        params: {
          taskId: newTask.id,
        },
      });
    }
  }
  function onReset() {
    editable.value = Object.assign({}, task.value || DefaultTaskValues.value);
  }

  const showDeleteConfirm = ref(false);
  async function deleteTask(projectId: number, taskId: string) {
    store.commit('cleanError');
    await store.dispatch('deleteTask', { projectId, taskId });
    if (store.state.Root.currentError === undefined) {
      await store.dispatch('Task/fetchTasks', { ...props });
      router.push({ name: 'crontab_tasks' });
      showDeleteConfirm.value = false;
    }
  }

  const route = useRoute();
  const isCreateMode = computed(
    () => route.name && route.name.toString() === 'create_crontab_task',
  );

  const executing = ref(false);
  const showExecuteConfirm = ref(false);
  async function execute(projectId: number, taskId: string) {
    showExecuteConfirm.value = false;
    executing.value = true;
    try {
      await startTask(store.getters.apiv1, projectId, taskId);
    } finally {
      executing.value = false;
    }
  }

  onMounted(() => {
    store.watch(
      (state) => [state.Root.eventTask],
      ([eventTask]) => {
        if (!eventTask || eventTask.projectId !== props.projectId) return;

        store.dispatch('Task/fetchTasks', {
          projectId: props.projectId,
        });
      },
    );
  });

  const waitingKill = ref(false);
  const showKillConfirm = ref(false);
  const kill = async () => {
    showKillConfirm.value = false;
    waitingKill.value = true;
    try {
      await killTask({ projectId: props.projectId, taskId: props.id });
    } catch (e) {
      console.log(e);
    }
    waitingKill.value = false;
  };

  const showCreateTemporaryTask = ref(false);
</script>
