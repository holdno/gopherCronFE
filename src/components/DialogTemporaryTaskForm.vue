<template>
  <q-dialog v-model="show" persistent>
    <q-card class="tw-w-96 q-pa-sm">
      <q-card-section>
        <div class="text-h6">创建任务</div>
        <div class="text-base">
          临时任务同样会与正式的定时任务竞争相同的锁，请避免调度冲突(指运行时间有交集)
        </div>
      </q-card-section>
      <q-card-section style="max-height: 50vh" class="scroll">
        <q-input
          v-if="task"
          key="id"
          :model-value="task.taskId"
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

        <div class="tw-flex tw-gap-2 tw-justify-end tw-mb-2">
          <q-btn
            dense
            unelevated
            class="tw-text-xs tw-h-6 tw-px-3"
            color="warning"
            text-color="black"
            label="一分钟后"
            @click="afterTime(1)"
          ></q-btn>
          <q-btn
            dense
            unelevated
            class="tw-text-xs tw-h-6 tw-px-3"
            color="warning"
            text-color="black"
            label="五分钟后"
            @click="afterTime(5)"
          ></q-btn>
          <q-btn
            dense
            unelevated
            class="tw-text-xs tw-h-6 tw-px-3"
            color="warning"
            text-color="black"
            label="一小时后"
            @click="afterTime(60)"
          ></q-btn>
        </div>

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
                    <q-btn
                      v-close-popup="true"
                      label="关闭"
                      color="primary"
                      flat
                    />
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
                    <q-btn
                      v-close-popup="true"
                      label="关闭"
                      color="primary"
                      flat
                    />
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

        <q-select
          v-model="editable.host"
          emit-value
          map-options
          autogrow
          square
          filled
          label="执行节点"
          :options="projectHosts"
          class="tw-mb-4"
        ></q-select>

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
        class="tw-flex tw-gap-2 tw-flex-col-reverse lg:tw-flex-row tw-justify-center lg:tw-justify-end"
      >
        <q-btn
          v-close-popup="true"
          flat
          label="取消"
          class="lg:tw-w-24 tw-w-full"
        />
        <q-btn
          color="primary"
          text-color="black"
          label="创建"
          class="lg:tw-w-24 tw-w-full !tw-ml-0"
          :loading="loading"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { PropType, computed, onMounted, ref, watchEffect } from 'vue';

  import { TemporaryTask } from '@/api/request';
  import { CreateTemporaryTask, CreateTemporaryTaskRequest } from '@/api/task';
  import { useStore } from '@/store/index';
  import { afterTimeStr } from '@/utils/datetime';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    task: {
      type: Object as PropType<TemporaryTask>,
      default: () => {
        return {};
      },
    },
  });

  const emits = defineEmits(['update:modelValue', 'created']);

  const show = computed({
    get: () => props.modelValue,
    set: (value) => {
      emits('update:modelValue', value);

      scheduleTime.value = '';
    },
  });

  const projectHosts = computed(() => {
    const hostList: {
      value: string;
      label: string;
    }[] = [
      {
        value: '',
        label: '随机',
      },
    ];
    const hosts = store.state.Project.projectClients.get(props.task.projectId);
    if (hosts) {
      hosts.forEach((v, k, a) => {
        const h = v.clientIP;
        hostList.push({
          value: h,
          label: h,
        });
      });
    }
    return hostList;
  });

  const store = useStore();

  const editable = ref<CreateTemporaryTaskRequest>({
    taskId: props.task.taskId,
    projectId: props.task.projectId,
    command: props.task.command,
    remark: props.task.remark,
    noseize: props.task.noseize,
    scheduleTime: 0,
    timeout: props.task.timeout,
    host: props.task.host,
  });
  const scheduleTime = ref('');
  function afterTime(t: number) {
    scheduleTime.value = afterTimeStr(t * 60, 'YYYY-MM-DD HH:mm');
  }

  onMounted(() => {
    watchEffect(() => {
      if (show.value) {
        editable.value = Object.assign(
          {},
          {
            taskId: props.task.taskId,
            projectId: props.task.projectId,
            command: props.task.command,
            remark: props.task.remark,
            noseize: props.task.noseize,
            scheduleTime: 0,
            timeout: props.task.timeout,
            host: props.task.host,
          },
        );
      }
    });
  });

  const loading = ref(false);
  async function onSubmit() {
    const p = editable.value;
    if (!p.remark) {
      store.commit('error', { error: { message: '任务说明必填' } });
      return;
    }
    if (!p.command) {
      store.commit('error', { error: { message: '执行命令必填' } });
      return;
    }
    loading.value = true;
    try {
      const res = await CreateTemporaryTask({
        projectId: p.projectId,
        taskId: p.taskId,
        command: p.command,
        noseize: p.noseize,
        scheduleTime: Date.parse(scheduleTime.value) / 1000,
        remark: p.remark,
        timeout: p.timeout,
        host: p.host,
      });
      if (res.code !== 0) {
        store.commit('error', { error: { message: res.message } });
      } else {
        store.commit('success', { message: '创建成功' });
        show.value = false;
        emits('created');
      }
    } catch (e: any) {}
    loading.value = false;
  }
</script>
