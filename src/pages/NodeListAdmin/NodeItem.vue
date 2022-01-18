<template>
  <tr
    tabindex="0"
    class="focus:tw-outline-none tw-text-sm tw-leading-none tw-text-gray-600 tw-h-16"
  >
    <td class="tw-w-2/3">
      <div class="tw-flex tw-items-center">
        <div
          class="tw-w-10 tw-h-10 tw-bg-gray-700 tw-rounded-sm tw-flex tw-items-center tw-justify-center"
        >
          <p class="tw-text-xs tw-font-bold tw-leading-3 tw-text-white">
            {{ avatar }}
          </p>
        </div>
        <div class="tw-pl-2">
          <p
            class="tw-text-sm tw-font-medium tw-leading-none dark:tw-text-white"
          >
            {{ node.clientIP }}
          </p>
          <p class="tw-text-xs tw-leading-3 tw-text-gray-400 tw-mt-2">
            {{ node.version }}
          </p>
        </div>
      </div>
    </td>
    <td>
      <div class="tw-w-min tw-flex tw-scale-75 md:tw-scale-100">
        <q-btn flat class="tw-text-red-300" @click="showReload = true"
          >重载配置</q-btn
        >
      </div>
    </td>
  </tr>
  <q-dialog v-model="showReload">
    <q-card>
      <q-card-section class="tw-flex-row tw-flex tw-items-center">
        <q-avatar icon="delete" color="red" text-color="white" />
        <span class="q-ml-sm">是否要重载节点 {{ node.clientIP }} 的配置？</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="取消" />
        <q-btn
          flat
          label="确定"
          color="primary"
          :loading="loading"
          @click="reload"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
  import { Node, reloadNodeConfig } from '@/api/node';
  import { store } from '@/store';
  import { PropType, ref } from 'vue';

  const props = defineProps({
    node: {
      type: Object as PropType<Node>,
      default: null,
    },
  });

  const generateAvatarName = (name: string) => {
    if (name === '') {
      return 'NODE';
    }
    const k = name.split('.');
    return k[k.length - 1];
  };
  const avatar = generateAvatarName(props.node.clientIP);

  const loading = ref(false);
  const showReload = ref(false);
  const reload = async () => {
    loading.value = true;
    try {
      const resp = await reloadNodeConfig({ clientIP: props.node.clientIP });
      if (resp.code !== 0) {
        store.commit('error', { message: resp.message });
      } else {
        showReload.value = false;
      }
    } catch (e) {
      console.log(e);
    }
    loading.value = false;
  };
</script>
