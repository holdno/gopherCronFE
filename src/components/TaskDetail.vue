<template>
  <div class="tw-h-full tw-w-full tw-flex tw-flex-col">
    <DialogTemporaryTaskForm
      v-model="showCreateTemporaryTask"
      :task="tmpTask"
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
        dense
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

      <q-btn outline class="tw-w-24 tw-opacity-90" @click="copyTask"
        >复制任务
        <q-tooltip class="bg-warning tw-text-black" :offset="[10, 10]">
          以当前任务内容为基础进行新任务的创建
        </q-tooltip>
      </q-btn>
    </div>
    <div
      v-if="isCopyMode"
      class="tw-flex tw-pb-3 tw-flex-wrap tw-gap-2 text-h6"
    >
      复制任务
    </div>
    <q-form class="tw-w-full" @submit="onSubmit" @reset="onReset">
      <q-input
        v-if="task && !isCreateMode"
        key="id"
        :model-value="task.id"
        disable
        label="任务 ID"
        square
        filled
        class="tw-mb-4"
      />
      <q-select
        v-if="isCreateMode"
        v-model="editable.projectId"
        filled
        class="tw-w-full tw-mb-4"
        emit-value
        map-options
        label="所属项目"
        placeholder="请选择项目"
        :options="projectOptions"
      ></q-select>
      <q-input
        v-else
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
          :label="isCopyMode ? '确认复制' : '保存'"
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
  import { Ref, computed, onMounted, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import { Project, Task, TemporaryTask, startTask } from '@/api/request';
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
      a.projectId === b.projectId &&
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
  const route = useRoute();
  const task = computed(() => {
    const t = store.state.Task.tasks
      .get(props.projectId)
      ?.find((t) => t.id === props.id || t.id === route.query.copyid);

    if (route.query.copyid && t) {
      const tt = JSON.parse(JSON.stringify(t));
      tt.isRunning = -1;
      tt.id = '';
      return tt;
    }

    return t;
  });

  const tmpTask = ref<TemporaryTask>();
  function updateTemporaryTask(task: Task) {
    tmpTask.value = {
      command: task.command,
      createTime: task.createTime,
      projectId: task.projectId,
      scheduleTime: 0,
      taskId: task.id,
      userId: 0,
      userName: '',
      noseize: 0,
      timeout: task.timeout,
      remark: '',
      host: '',
      isRunning: -1,
      tmpId: '',
    };
  }

  if (task.value) {
    updateTemporaryTask(task.value);
  }

  const project = computed(() =>
    store.state.Project.projects.find((p) => p.id === props.projectId),
  );

  const projectOptions = ref<{ value: number; label: string }[]>([]);
  function setProjectOptions(source: Project[]) {
    const newList: { value: number; label: string }[] = [];
    source?.forEach((v, k, a) => {
      newList.push({
        value: v.id,
        label: v.title,
      });
    });
    projectOptions.value = newList;
  }
  if (store.state.Project.projects && store.state.Project.projects.length > 0) {
    setProjectOptions(store.state.Project.projects);
  }
  watch(
    () => store.state.Project.projects,
    (o, n) => {
      setProjectOptions(n);
    },
  );

  const editable: Ref<Task> = ref(
    Object.assign({}, task.value || DefaultTaskValues.value),
  );

  const isCreateMode = computed(
    () => route.name && route.name.toString() === 'create_crontab_task',
  );

  const isCopyMode = computed(
    () => route.query.copyid && route.query.copyid !== '',
  );

  watch(
    () => props.id,
    (o, n) => {
      if (
        props.id !== task.value?.id ||
        (!isCreateMode.value && editable.value.id === '') ||
        editable.value.id !== task.value.id
      ) {
        editable.value = Object.assign(
          {},
          task.value || DefaultTaskValues.value,
        );
      }
      editable.value.isRunning = -1;
      if (task.value) {
        updateTemporaryTask(task.value);
      }
    },
  );
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

  async function fetchTasks(projectId: number) {
    await store.dispatch('Task/fetchTasks', { projectId: projectId });
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
    if (isCreateMode.value || isCopyMode.value) {
      editable.value.id = '';
    }

    try {
      const newTask = await store.dispatch('saveTask', {
        task: JSON.parse(JSON.stringify(editable.value)),
      });
      if (isCreateMode.value) {
        await fetchTasks(editable.value.projectId);
        router.push({
          name: 'crontab_task',
          params: {
            projectId: editable.value.projectId,
            taskId: newTask.id,
          },
        });
      }
    } catch (e: any) {
      console.error(e);
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
    try {
      await store.dispatch('deleteTask', { projectId, taskId });
      if (store.state.Root.currentError === undefined) {
        await fetchTasks(props.projectId);
        router.push({
          name: 'crontab_tasks',
          params: {
            projectId: props.projectId,
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

  const executing = computed(() => {
    if (onExecuting.value) {
      return true;
    }
    return task.value.isRunning === 1;
  });
  const onExecuting = ref(false);
  const showExecuteConfirm = ref(false);
  async function execute(projectId: number, taskId: string) {
    showExecuteConfirm.value = false;
    onExecuting.value = true;
    try {
      await startTask(store.getters.apiv1, projectId, taskId);
    } catch (e: any) {
      console.error(e);
    }
    onExecuting.value = false;
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
          onExecuting.value = false;
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
      await fetchTasks(props.projectId);
      editable.value.status = 0;
    } catch (e) {
      console.error(e);
      store.commit('error', { error: e });
    }
    waitingKill.value = false;
  };

  const showCreateTemporaryTask = ref(false);

  function copyTask() {
    router.push({
      name: 'create_crontab_task',
      query: { copyid: task.value?.id },
    });
  }
</script>
