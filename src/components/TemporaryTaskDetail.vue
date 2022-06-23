<template>
  <Confirm
    v-model="showKillConfirm"
    content="确定要结束进程吗？"
    type="warning"
    @confirm="kill"
  ></Confirm>
  <q-card v-if="log" class="tw-mb-4" flat bordered>
    <q-item>
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
  <div class="tw-flex tw-flex-row-reverse tw-pb-3 tw-flex-wrap tw-gap-1">
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
  </div>
  <q-form class="tw-w-full">
    <q-input
      v-if="task"
      key="id"
      :model-value="task.taskId + ' - ' + task.tmpId"
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
      key="remark"
      v-model="editable.remark"
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
      v-model="editable.scheduleTime"
      label="调度时间"
      square
      disable
      filled
      class="tw-mb-4"
    />
    <q-input
      key="timeout"
      v-model.number="editable.timeout"
      type="number"
      label="超时时间 (单位:秒 s)"
      square
      disable
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
      disable
      square
      filled
      class="tw-mb-4"
    />

    <q-input
      key="remark"
      :model-value="editable.noseize === 1 ? '是' : '否'"
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
  import { computed, onMounted, ref, watchEffect } from 'vue';

  import { GetTemporaryTaskLogDetail, TaskLog } from '@/api/log';
  import { killTask } from '@/api/task';
  import Confirm from '@/components/Confirm.vue';
  import JSONViewer from '@/components/JSONViewer.vue';
  import { useStore } from '@/store/index';
  import { formatTimestamp } from '@/utils/datetime';

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

  const store = useStore();
  const task = computed(() =>
    store.state.Task.temporaryTasks
      .get(props.projectId)
      ?.find((t) => t.id === Number(props.id)),
  );
  const project = computed(() =>
    store.state.Project.projects.find((p) => p.id === props.projectId),
  );
  const editable = ref(Object.assign({}, task.value));
  watchEffect(() => {
    editable.value = Object.assign({}, task.value);
    getCurrentTaskLog();
  });
  onMounted(() => {
    store.watch(
      (state) => [state.Root.eventTask],
      ([eventTask]) => {
        if (!eventTask || eventTask.projectId !== props.projectId) return;

        store.dispatch('Task/fetchTemporaryTasks', {
          projectId: props.projectId,
        });
      },
    );
    getCurrentTaskLog();
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

  const log = ref<TaskLog | null>();
  async function getCurrentTaskLog() {
    if (!task.value) {
      return;
    }
    log.value = null;
    try {
      log.value = await GetTemporaryTaskLogDetail({
        taskId: task.value.taskId,
        projectId: task.value.projectId,
        tmpId: task.value.tmpId,
      });
    } catch (e: any) {}
  }
</script>
