<template>
  <div class="tw-h-full tw-w-full tw-flex tw-flex-col">
    <DialogTemporaryTaskForm
      v-model="showCreateTemporaryTask"
      :task="task"
      @created="createdTemporaryTask"
    ></DialogTemporaryTaskForm>
    <Confirm
      v-model="showDeleteConfirm"
      :content="'是否要删除任务' + task?.name + '?'"
      type="warning"
      :loading="deleteLoading"
      @confirm="project && task && deleteTask(project.id, task.id)"
    ></Confirm>
    <Confirm
      v-model="showKillConfirm"
      content="确定要结束进程吗？强制结束后任务的启用状态会自动变更为停用状态。"
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
        class="tw-w-24 tw-opacity-90"
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
          :loading="loading"
          class="lg:tw-w-24 tw-w-full lg:tw-mr-4 lg:tw-mb-0 tw-mb-4"
        >
        </q-btn>
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

  import { Task, startTask } from '@/api/request';
  import { killTask } from '@/api/task';
  import Confirm from '@/components/Confirm.vue';
  import DialogTemporaryTaskForm from '@/components/DialogTemporaryTaskForm.vue';
  import { useStore } from '@/store/index';
  import { TASK_STATUS } from '@/types/task';

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

  function createdTemporaryTask() {
    router.push({
      name: 'temporary_tasks',
      params: {
        projectId: props.projectId,
      },
    });
  }

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
    isRunning: -1,
    noseize: 0,
    exclusion: 0,
    clientIp: '',
    tmpId: '',
  }));

  function compareTaskEquals(
    a: Task | undefined,
    b: Task | undefined,
  ): boolean {
    if (!a) {
      return false;
    }
    if (!b) {
      return false;
    }

    return (
      a.name === b.name &&
      a.cronExpr === b.cronExpr &&
      a.remark === b.remark &&
      a.timeout === b.timeout &&
      a.status === b.status &&
      a.noseize === b.noseize &&
      a.command === b.command
    );
  }

  const store = useStore();
  const task = computed(() => {
    return store.state.Task.tasks
      .get(props.projectId)
      ?.find((t) => t.id === props.id);
  });
  const project = computed(() =>
    store.state.Project.projects.find((p) => p.id === props.projectId),
  );
  const editable = ref(
    Object.assign({}, task.value || DefaultTaskValues.value),
  );
  editable.value.isRunning = -1;
  watchEffect(() => {
    if (props.id !== editable.value.id) {
      editable.value = Object.assign({}, task.value || DefaultTaskValues.value);
      editable.value.isRunning = -1;
    }
  });
  const modified = computed(() => {
    if (task.value?.isRunning === 1) {
      return false;
    }
    return !compareTaskEquals(task.value, editable.value);
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

  async function fetchTasks() {
    await store.dispatch('Task/fetchTasks', { projectId: props.projectId });
  }

  const router = useRouter();
  const loading = ref(false);
  async function onSubmit() {
    store.commit('cleanError');
    if (!canSave.value) {
      store.commit('error', { error: { message: cantSaveReason.value } });
      return;
    }
    loading.value = true;
    const newTask = await store.dispatch('saveTask', {
      task: JSON.parse(JSON.stringify(editable.value)),
    });
    if (isCreateMode.value) {
      const projectId = props.projectId;
      await fetchTasks();
      router.push({
        name: 'crontab_task',
        params: {
          projectId: projectId,
          taskId: newTask.id,
        },
      });
    }
    loading.value = false;
  }
  function onReset() {
    editable.value = Object.assign({}, task.value || DefaultTaskValues.value);
  }

  const showDeleteConfirm = ref(false);
  const deleteLoading = ref(false);
  async function deleteTask(projectId: number, taskId: string) {
    store.commit('cleanError');
    deleteLoading.value = true;
    console.log('delete loading', deleteLoading.value);
    try {
      await store.dispatch('deleteTask', { projectId, taskId });
      if (store.state.Root.currentError === undefined) {
        await fetchTasks();
        router.push({
          name: 'crontab_tasks',
          params: {
            projectId: route.params.projectId,
          },
        });
        showDeleteConfirm.value = false;
      }
    } catch (e: any) {
      console.error(e);
      store.commit('error', { error: e });
    }

    deleteLoading.value = false;
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
    } catch (e: any) {
      executing.value = false;
    }
  }

  onMounted(() => {
    store.watch(
      (state) => [state.Root.eventTask],
      ([eventTask]) => {
        if (
          !eventTask ||
          eventTask.projectId !== props.projectId ||
          eventTask.taskId !== props.id
        )
          return;
        if (TASK_STATUS.isFinished(eventTask.status)) {
          executing.value = false;
        }
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
      await fetchTasks();
      editable.value.status = 0;
    } catch (e) {
      console.error(e);
      store.commit('error', { error: e });
    }
    waitingKill.value = false;
  };

  const showCreateTemporaryTask = ref(false);
</script>
