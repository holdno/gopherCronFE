<template>
  <q-dialog v-model="show">
    <Confirm
      v-model="showConfirm"
      type="warning"
      :content="`确定要移除 ${selected?.callBackUrl} 吗？`"
      @confirm="
        selected && removeWebhook(selected).then(closeRemoveWebhookConfirm)
      "
    />
    <q-card class="tw-w-full tw-mx-6 lg:tw-w-1/2">
      <q-card-section>
        <div class="text-h6">WebHook管理</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="tw-flex md:tw-flex-row tw-flex-col tw-gap-2">
        <q-input
          v-model="newHook.callBackUrl"
          placeholder="请输入webhook地址"
          dense
          outlined
          class="tw-grow"
        >
        </q-input>
        <q-select
          v-model="newHook.type"
          outlined
          dense
          class="tw-w-full md:tw-w-32"
          emit-value
          map-options
          placeholder="请选择hook类型"
          :options="hookOptions"
        ></q-select>
        <q-btn
          :loading="loading"
          outline
          text-color="primary"
          @click="onSubmit"
        >
          添加
        </q-btn>
      </q-card-section>

      <q-separator />

      <q-card-section style="max-height: 40vh; height: 40vh" class="scroll">
        <q-infinite-scroll class="tw-w-full tw-h-full" :offset="100">
          <ul role="list" class="tw-divide-y tw-divide-white/5">
            <li
              v-for="data of hooks"
              :key="data.type"
              class="tw-relative tw-flex tw-items-center tw-space-x-4 tw-py-2"
            >
              <div class="tw-min-w-0 tw-flex-auto">
                <div class="tw-flex tw-items-center tw-gap-x-3">
                  <div class="flex-none rounded-full p-1">
                    <div
                      class="tw-h-2 tw-w-2 tw-rounded-full tw-bg-current"
                    ></div>
                  </div>
                  <h2
                    class="tw-min-w-0 tw-text-sm tw-font-semibold tw-leading-6 tw-text-white"
                  >
                    <a class="tw-flex tw-gap-x-2">
                      <span class="tw-whitespace-nowrap">{{
                        data.callBackUrl
                      }}</span>
                    </a>
                  </h2>
                </div>
                <div
                  class="tw-mt-1 tw-flex tw-items-center tw-gap-x-2.5 tw-text-xs tw-leading-5 tw-text-gray-400"
                >
                  <p class="tw-truncate tw-text-primary">
                    {{ getHookType(data.type) }}
                  </p>
                  <svg
                    viewbox="0 0 2 2"
                    class="tw-h-0.5 tw-w-0.5 tw-flex-none tw-fill-gray-300"
                  >
                    <circle cx="1" cy="1" r="1"></circle>
                  </svg>
                  <p v-if="data.createTime" class="tw-whitespace-nowrap">
                    {{
                      formatTimestamp(
                        data.createTime * 1000,
                        'YYYY-MM-DD HH:mm',
                      )
                    }}
                  </p>
                </div>
              </div>
              <div
                class="rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset"
              >
                <q-btn
                  type="primary"
                  unelevated
                  class="tw-text-red-500"
                  @click="openRemoveWebhookConfirm(data)"
                  >移除</q-btn
                >
              </div>
            </li>
          </ul>
        </q-infinite-scroll>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="关闭" color="primary" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';

  import Confirm from './Confirm.vue';

  import { createWebhook, deleteWebhook, getWebhookList } from '@/api/webhook';
  import { WebHook, getHookType, hookOptions } from '@/types/webhook';
  import { formatTimestamp } from '@/utils/datetime';

  const props = defineProps({
    projectId: {
      type: Number,
      default: 0,
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
  });

  const emits = defineEmits(['update:modelValue']);

  const show = computed({
    get: () => props.modelValue,
    set: (value) => emits('update:modelValue', value),
  });

  const hooks = ref<WebHook[]>([]);

  async function fetchWebhooks() {
    hooks.value = await getWebhookList(props.projectId);
  }
  watch<[number, boolean]>(
    () => [props.projectId, show.value],
    async ([, show]) => {
      if (show) fetchWebhooks();
      initNewHook();
    },
  );

  const newHook = ref<WebHook>({
    callBackUrl: '',
    type: 'task-result',
    projectId: props.projectId,
  });
  function initNewHook() {
    newHook.value = {
      callBackUrl: '',
      type: 'task-result',
      createTime: undefined,
      projectId: props.projectId,
    };
  }
  const loading = ref(false);
  async function onSubmit() {
    if (!newHook.value) {
      return;
    }
    loading.value = true;
    try {
      await createWebhook({
        projectId: Number(newHook.value.projectId),
        callBackUrl: newHook.value.callBackUrl,
        type: newHook.value.type,
      });
      initNewHook();
      await fetchWebhooks();
    } finally {
      loading.value = false;
    }
  }

  const selected = ref<WebHook>();
  const showConfirm = ref(false);

  function openRemoveWebhookConfirm(data: WebHook) {
    selected.value = data;
    showConfirm.value = true;
  }

  function closeRemoveWebhookConfirm() {
    selected.value = undefined;
    showConfirm.value = false;
  }

  async function removeWebhook(data: WebHook) {
    loading.value = true;
    try {
      await deleteWebhook(data.projectId as number, data.type);
      await fetchWebhooks();
    } finally {
      loading.value = false;
    }
  }
</script>
