<template>
  <q-dialog v-model="show" persistent>
    <q-card class="tw-w-96 q-pa-sm">
      <q-card-section>
        <div class="text-h6">创建任务</div>
      </q-card-section>
      <q-card-section style="max-height: 50vh" class="scroll">
        <q-input
          v-if="task"
          key="id"
          :model-value="task.id"
          disable
          label="关联任务 ID"
          square
          filled
          class="tw-mb-4"
        />
        <q-input
          key="remark"
          v-model="editable.remark"
          type="textarea"
          label="任务说明 *"
          autogrow
          square
          filled
          class="tw-mb-4"
        />
        <q-input
          v-model="scheduleTime"
          filled
          square
          label="调度时间 *"
          class="tw-mb-4"
        >
          <template #prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="scheduleTime"
                  text-color="black"
                  mask="YYYY-MM-DD HH:mm"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="关闭" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>

          <template #append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-time
                  v-model="scheduleTime"
                  mask="YYYY-MM-DD HH:mm"
                  text-color="black"
                  format24h
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="关闭" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input
          key="timeout"
          v-model.number="editable.timeout"
          type="number"
          label="超时时间 * (单位:秒 s)"
          square
          filled
          class="tw-mb-4"
        />
        <q-input
          key="command"
          v-model="editable.command"
          placeholder='echo "hello word"'
          type="textarea"
          label="执行指令 *"
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
      </q-card-section>

      <q-card-actions
        align="right"
        class="tw-flex tw-gap-2 tw-flex-col-reverse lg:tw-flex-row lg:tw-justify-end"
      >
        <q-btn v-close-popup flat label="取消" class="lg:tw-w-24 tw-w-full" />
        <q-btn
          color="primary"
          text-color="black"
          label="创建"
          class="lg:tw-w-24 tw-w-full"
          :loading="loading"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { PropType, computed, onMounted, ref, watchEffect } from 'vue';

  import { Task } from '@/api/request';
  import { CreateTemporaryTask, CreateTemporaryTaskRequest } from '@/api/task';
  import router from '@/router';
  import { useStore } from '@/store/index';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    task: {
      type: Object as PropType<Task>,
      default: () => {
        return {};
      },
    },
  });

  const emits = defineEmits(['update:modelValue']);

  const show = computed({
    get: () => props.modelValue,
    set: (value) => emits('update:modelValue', value),
  });

  const store = useStore();

  const editable = ref<CreateTemporaryTaskRequest>({
    taskId: props.task.id,
    projectId: props.task.projectId,
    command: props.task.command,
    remark: props.task.remark,
    noseize: props.task.noseize,
    scheduleTime: 0,
    timeout: props.task.timeout,
  });
  const scheduleTime = ref('');

  onMounted(() => {
    watchEffect(() => {
      if (!show.value) {
        editable.value = Object.assign(
          {},
          {
            taskId: props.task.id,
            projectId: props.task.projectId,
            command: props.task.command,
            remark: props.task.remark,
            noseize: props.task.noseize,
            scheduleTime: 0,
            timeout: props.task.timeout,
          },
        );
      }
    });
  });

  const loading = ref(false);
  async function onSubmit() {
    const p = editable.value;
    loading.value = true;
    if (!p.remark) {
      store.commit('error', { error: { message: '任务说明必填' } });
      return;
    }
    if (!p.command) {
      store.commit('error', { error: { message: '执行命令必填' } });
      return;
    }
    try {
      const res = await CreateTemporaryTask({
        projectId: p.projectId,
        taskId: p.taskId,
        command: p.command,
        noseize: p.noseize,
        scheduleTime: Date.parse(scheduleTime.value) / 1000,
        remark: p.remark,
        timeout: p.timeout,
      });
      if (res.code !== 0) {
        store.commit('error', { error: { message: res.message } });
      } else {
        store.commit('success', { message: '创建成功' });
        router.push({
          name: 'temporary_tasks',
          params: {
            projectId: props.task.projectId,
          },
        });
      }
    } catch (e: any) {}
    loading.value = false;
  }
</script>
