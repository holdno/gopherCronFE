<template>
  <tr
    tabindex="0"
    class="focus:tw-outline-none tw-text-sm tw-leading-none tw-text-gray-600 tw-h-16"
  >
    <td class="tw-w-1/2">
      <div class="tw-flex tw-items-center">
        <div
          class="tw-w-10 tw-h-10 tw-bg-gray-700 tw-rounded-sm tw-flex tw-items-center tw-justify-center"
        >
          <p class="tw-text-xs tw-font-bold tw-leading-3 tw-text-white">FIG</p>
        </div>
        <div class="tw-pl-2">
          <p
            class="tw-text-sm tw-font-medium tw-leading-none dark:tw-text-white"
          >
            {{ user.name }}
          </p>
          <p class="tw-text-xs tw-leading-3 tw-text-gray-600 tw-mt-2">
            {{ user.permissions.join(', ') }}
          </p>
        </div>
      </div>
    </td>
    <td>
      <q-btn flat class="tw-text-red-300" @click="showDeleteConfirm = true"
        >删除用户</q-btn
      >
    </td>
  </tr>
  <q-dialog v-model="showDeleteConfirm">
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="delete" color="red" text-color="white" />
        <span class="q-ml-sm"> 是否要删除用户 {{ user.name }}</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="取消" color="primary" />
        <q-btn flat label="删除" color="red" @click="deleteUser" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <ModifyBox v-model="showEdit"></ModifyBox>
</template>

<script setup lang="ts">
  import { ref, PropType } from 'vue';
  import { User } from '@/request';
  import ModifyBox from './ModifyBox.vue';

  const props = defineProps({
    user: {
      type: Object as PropType<User>,
      default: null,
    },
  });

  const deleteUser = () => {
    console.log(props.user.id);
  };

  const showEdit = ref(false);
  const showDeleteConfirm = ref(false);
</script>
