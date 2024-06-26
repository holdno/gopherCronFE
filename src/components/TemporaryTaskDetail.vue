<template>
  <DialogTemporaryTaskForm
    v-model="showCopyConfirm"
    :task="copiedTask"
    @created="reloadTmpTasks"
  ></DialogTemporaryTaskForm>
  <Confirm
    v-model="showKillConfirm"
    content="确定要结束进程吗？"
    type="warning"
    @confirm="kill"
  ></Confirm>
  <Confirm
    v-model="showRemoveConfirm"
    content="确定要删除该临时任务吗？"
    type="warning"
    @confirm="remove"
  ></Confirm>
  <q-skeleton
    v-show="loading"
    type="QInput"
    class="tw-h-52 tw-mb-4"
    animation="fade"
  />
  <q-card v-if="!loading && log" class="tw-mb-4" flat bordered>
    <q-item>
      <q-item-section>
        <q-item-label overline>节点 IP</q-item-label>
        <q-item-label>
          {{ log.clientIp }}
        </q-item-label>
      </q-item-section>
      <q-item-section>
        <q-item-label overline>开始时间</q-item-label>
        <q-item-label>
          {{ formatTimestamp(log.startTime * 1000) }}
        </q-item-label>
      </q-item-section>
      <q-item-section>
        <q-item-label overline>结束时间</q-item-label>
        <q-item-label>
          {{ formatTimestamp(log.endTime * 1000) }}
        </q-item-label>
      </q-item-section>
    </q-item>

    <q-separator />

    <q-card-section class="tw-w-full tw-overflow-x-auto">
      <JSONViewer :json="log.result" />
    </q-card-section>
  </q-card>
  <div
    v-if="loading"
    class="tw-flex tw-flex-row-reverse tw-pb-3 tw-flex-wrap tw-gap-2"
  >
    <q-skeleton type="QBtn" animation="fade" />
  </div>

  <div
    v-if="!loading"
    class="tw-flex tw-flex-row-reverse tw-pb-3 tw-flex-wrap tw-gap-2"
  >
    <q-btn v-if="task?.isRunning" :loading="true"> </q-btn>
    <q-btn
      v-if="task?.isRunning !== 1 && !log?.result"
      text-color="red"
      outline
      class="tw-w-24 tw-ml-1"
      :loading="waitingRemove"
      @click="showRemoveConfirm = true"
      >删除任务</q-btn
    >
    <q-btn
      v-if="task?.isRunning === 1"
      outline
      text-color="red"
      :disable="task?.isRunning !== 1"
      class="tw-w-24 tw-ml-1"
      :loading="waitingKill"
      @click="showKillConfirm = true"
      >结束进程</q-btn
    >
    <q-btn outline class="tw-w-24 tw-ml-1" @click="tiggerTaskCopy"
      >复制任务</q-btn
    >
  </div>
  <div v-if="loading">
    <q-skeleton type="QInput" class="tw-mb-4" square animation="fade" />
    <q-skeleton type="QInput" class="tw-mb-4" square animation="fade" />
    <q-skeleton type="QInput" class="tw-mb-4" square animation="fade" />
    <q-skeleton type="QInput" class="tw-mb-4" square animation="fade" />
    <q-skeleton type="QInput" class="tw-mb-4" square animation="fade" />
    <q-skeleton type="QInput" class="tw-mb-4" square animation="fade" />
    <q-skeleton type="QInput" class="tw-mb-4" square animation="fade" />
  </div>
  <q-form v-if="!loading && task" class="tw-w-full">
    <q-input
      v-if="task"
      key="id"
      :model-value="task.taskId + ' - ' + task.tmpId"
      disable
      label="任务 ID（task_id - tmp_id）"
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
      key="remark"
      v-model="task.remark"
      type="textarea"
      label="任务备注"
      autogrow
      disable
      square
      filled
      class="tw-mb-4"
    />
    <q-input
      key="cron"
      :model-value="
        formatTimestamp(task.scheduleTime * 1000, 'YYYY-MM-DD HH:mm')
      "
      label="调度时间"
      square
      disable
      filled
      class="tw-mb-4"
    />
    <q-input
      key="timeout"
      v-model.number="task.timeout"
      type="number"
      label="超时时间 (单位:秒 s)"
      square
      disable
      filled
      class="tw-mb-4"
    />
    <q-input
      key="command"
      v-model="task.command"
      placeholder='echo "hello word"'
      type="textarea"
      label="执行指令"
      autogrow
      disable
      square
      filled
      class="tw-mb-4"
    />
    <q-input
      key="timeout"
      :model-value="task.host || '随机'"
      label="指定执行节点"
      square
      disable
      filled
      class="tw-mb-4"
    />
    <q-input
      key="noseize"
      :model-value="task.noseize === 1 ? '是' : '否'"
      type="textarea"
      label="并行调度"
      autogrow
      disable
      square
      filled
      class="tw-mb-4"
    />
  </q-form>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';

  import { GetTemporaryTaskLogDetail, TaskLog } from '@/api/log';
  import { TemporaryTask } from '@/api/request';
  import { killTask, removeTemporaryTask } from '@/api/task';
  import Confirm from '@/components/Confirm.vue';
  import DialogTemporaryTaskForm from '@/components/DialogTemporaryTaskForm.vue';
  import JSONViewer from '@/components/JSONViewer.vue';
  import { useStore } from '@/store/index';
  import { TASK_STATUS } from '@/types/task';
  import { formatTimestamp } from '@/utils/datetime';

  const props = defineProps({
    id: {
      type: Number,
      default: 0,
      required: true,
    },
    projectId: {
      type: Number,
      required: true,
    },
  });

  const showCopyConfirm = ref(false);
  const copiedTask = ref<TemporaryTask | undefined>();
  function copyTask(t: TemporaryTask) {
    copiedTask.value = {
      taskId: t.taskId,
      projectId: t.projectId,
      remark: t.remark,
      command: t.command,
      timeout: t.timeout,
      host: t.host,
      createTime: 0,
      isRunning: 0,
      noseize: 0,
      tmpId: '',
      scheduleTime: 0,
      userId: 0,
      userName: '',
    };
  }

  const log = ref<TaskLog | null>();
  const store = useStore();
  // const task = computed(() =>
  //   store.state.Task.temporaryTasks
  //     .get(props.projectId)
  //     ?.find((t) => t.id === Number(props.id)),
  // );

  const task = ref<TemporaryTask | undefined>();

  function updateCurrentTask() {
    task.value = store.state.Task.temporaryTasks
      .get(props.projectId)
      ?.find((t) => t.id === Number(props.id));
  }
  watch(
    () => props.id,
    (o, n) => {
      console.log('watched', o, n);
      updateCurrentTask();
    },
  );

  watch(task, (o, n) => {
    console.log('watched task', o, n);
    if (!log.value || o?.tmpId !== n?.tmpId) {
      updateCurrentTaskLog();
    }
  });

  function tiggerTaskCopy() {
    if (task.value) {
      copyTask(task.value);
      showCopyConfirm.value = true;
    } else {
      console.error('failed to copy task, the task is not found');
    }
  }

  const project = computed(() =>
    store.state.Project.projects.find((p) => p.id === props.projectId),
  );
  async function reloadTmpTasks() {
    try {
      await store.dispatch('Task/fetchTemporaryTasks', {
        projectId: props.projectId,
      });
    } catch (e: any) {
      console.error('failed to dispatch fetchTemporaryTasks', e);
    }
  }
  onMounted(() => {
    store.watch(
      (state) => [state.Root.eventTask],
      async ([eventTask]) => {
        if (
          !eventTask ||
          eventTask.projectId !== props.projectId ||
          eventTask.tmpId !== task.value?.tmpId
        )
          return;
        if (!log.value && TASK_STATUS.isFinished(eventTask.status)) {
          updateCurrentTaskLog();
        }
      },
    );
    updateCurrentTask();
  });

  const waitingKill = ref(false);
  const showKillConfirm = ref(false);
  const kill = async () => {
    if (!task.value) {
      return;
    }
    showKillConfirm.value = false;
    waitingKill.value = true;
    try {
      await killTask({
        projectId: props.projectId,
        taskId: task.value.taskId,
      });
      await reloadTmpTasks();
    } catch (e) {
      console.log(e);
    }
    waitingKill.value = false;
  };

  const waitingRemove = ref(false);
  const showRemoveConfirm = ref(false);
  const router = useRouter();
  const remove = async () => {
    showRemoveConfirm.value = false;
    waitingRemove.value = true;
    try {
      await removeTemporaryTask(Number(props.id));
      await reloadTmpTasks();
      router.back();
    } catch (e) {
      console.log(e);
    }
    waitingRemove.value = false;
  };

  const loading = ref(true);

  function showLoadingWithDelay(delay = 500): () => void {
    let requestDone = false;
    let timeouted = false;
    loading.value = true;

    setTimeout(() => {
      timeouted = true;
      if (requestDone) {
        loading.value = false;
      }
    }, delay);

    const close = () => {
      requestDone = true;
      if (timeouted) {
        loading.value = false;
      }
    };
    return close;
  }

  async function updateCurrentTaskLog() {
    if (!task.value) {
      return;
    }
    const closeFunc = showLoadingWithDelay(500);
    log.value = null;
    try {
      log.value = await GetTemporaryTaskLogDetail({
        taskId: task.value.taskId,
        projectId: task.value.projectId,
        tmpId: task.value.tmpId,
      });
    } catch (e: any) {
      console.error(e);
    }
    closeFunc();
  }
</script>
