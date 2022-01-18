<template>
  <tr
    tabindex="0"
    class="focus:tw-outline-none tw-text-sm tw-leading-none tw-text-gray-600 tw-h-16"
  >
    <td class="tw-w-1/3 tw-px-4">
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
            {{ user.name }}
          </p>
          <p class="tw-text-xs tw-leading-3 tw-text-gray-400 tw-mt-2">
            {{ user.permissions.join(', ') || '-' }}
          </p>
        </div>
      </div>
    </td>
    <td class="tw-w-1/4 tw-px-4">
      <div class="tw-flex tw-items-center tw-text-gray-400">
        {{ user.account }}
      </div>
    </td>
    <td class="tw-w-1/4 tw-px-4">
      <div class="tw-flex tw-items-center tw-text-gray-400">
        {{ formatTimestamp(user.createTime * 1000) }}
      </div>
    </td>
    <td class="tw-px-4">
      <div class="tw-w-min tw-flex tw-scale-75 md:tw-scale-100">
        <q-btn
          color="primary"
          class="tw-mr-2 md:tw-mr-4"
          text-color="black"
          @click="showEdit = true"
          >编辑</q-btn
        >
        <q-btn
          :disable="user.id === 1"
          flat
          class="tw-text-red-300"
          @click="showDeleteConfirm = true"
          >删除用户</q-btn
        >
      </div>
    </td>
  </tr>
  <q-dialog v-model="showDeleteConfirm">
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="delete" color="red" text-color="white" />
        <span class="q-ml-sm">是否要删除用户 {{ user.name }}</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="取消" />
        <q-btn flat label="删除" color="red" @click="deleteUser" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <ModifyBox v-model="showEdit" :user="user" @modify="onModify"></ModifyBox>
</template>

<script setup lang="ts">
  import { ref, PropType } from 'vue';
  import { User } from '@/api/request';
  import { deleteUser as deleteUserRequest } from '@/api/user';
  import { formatTimestamp } from '@/utils/datetime';
  import ModifyBox from './ModifyBox.vue';
  import { useStore } from '@/store';

  const props = defineProps({
    user: {
      type: Object as PropType<User>,
      default: null,
    },
  });
  const emits = defineEmits(['modify']);
  const store = useStore();
  const generateAvatarName = (name: string) => {
    if (name === '') {
      return 'EM';
    }
    if (name.length > 3) {
      return name.substring(name.length - 2).toUpperCase();
    } else if (name.length < 3) {
      return name.substring(0, 1).toUpperCase();
    } else {
      return name.substring(1, 3).toUpperCase();
    }
  };
  const avatar = generateAvatarName(props.user.name);

  const onModify = () => {
    emits('modify', {});
  };

  const deleteUser = async () => {
    const resp = await deleteUserRequest({ id: props.user.id });
    if (resp.meta.code === 0) {
      store.commit('success', { message: '删除成功' });
      showDeleteConfirm.value = false;
      emits('modify', {});
    }
  };

  const showEdit = ref(false);
  const showDeleteConfirm = ref(false);
</script>
