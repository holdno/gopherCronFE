<template>
  <q-dialog v-model="show">
    <Confirm
      v-model="showConfirm"
      type="warning"
      :content="`确定要移除用户 ${selected?.name} 吗？`"
      @confirm="selected && removeUser(selected).then(closeRemoveUserConfirm)"
    />
    <q-card class="tw-w-full tw-mx-6 lg:tw-w-1/2">
      <q-card-section>
        <div class="text-h6">项目成员管理</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="tw-flex md:tw-flex-row tw-flex-col tw-gap-2">
        <q-input
          v-model="newUser"
          placeholder="请输入用户帐号"
          dense
          outlined
          class="tw-grow"
        >
        </q-input>
        <q-select
          v-model="userRole"
          outlined
          dense
          class="tw-w-full md:tw-w-32"
          emit-value
          map-options
          placeholder="请选择用户权限"
          :options="roleOptions"
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
              v-for="user of users"
              :key="user.id"
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
                      <span class="tw-whitespace-nowrap">{{ user.name }}</span>
                      <span class="tw-text-gray-400"> - </span>
                      <span class="tw-whitespace-nowrap tw-opacity-75">{{
                        user.permissions &&
                        getUserPermission(user.permissions[0])
                      }}</span>
                    </a>
                  </h2>
                </div>
                <div
                  class="tw-mt-1 tw-flex tw-items-center tw-gap-x-2.5 tw-text-xs tw-leading-5 tw-text-gray-400"
                >
                  <p class="tw-truncate tw-text-primary">{{ user.account }}</p>
                  <svg
                    viewbox="0 0 2 2"
                    class="tw-h-0.5 tw-w-0.5 tw-flex-none tw-fill-gray-300"
                  >
                    <circle cx="1" cy="1" r="1"></circle>
                  </svg>
                  <p class="tw-whitespace-nowrap">
                    {{
                      formatTimestamp(
                        user.createTime * 1000,
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
                  @click="openRemoveUserConfirm(user)"
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
    <!-- <q-card class="tw-w-96 q-pa-sm">
      <q-card-section>
        <div class="text-h6">项目人员管理</div>
      </q-card-section>
      <q-card-section>
        <q-chip
          v-for="user of users"
          :key="user.id"
          removable
          color="primary"
          text-color="black"
          @remove="openRemoveUserConfirm(user)"
        >
          {{ user.name }}
        </q-chip>
      </q-card-section>
      <q-card-actions>
        <q-input
          v-model="newUser"
          class="tw-w-full"
          placeholder="请输入用户帐号"
        >
          <template #append>
            <q-btn
              :loading="loading"
              flat
              icon="add"
              text-color="primary"
              @click="onSubmit"
            >
              添加
            </q-btn>
          </template>
        </q-input>
      </q-card-actions>
    </q-card> -->
  </q-dialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';

  import Confirm from './Confirm.vue';

  import {
    User,
    addProjectUser,
    apiv1,
    fetchProjectUsers,
    removeProjectUser,
  } from '@/api/request';
  import { formatTimestamp } from '@/utils/datetime';
  import { getUserPermission, roleOptions } from '@/utils/permission';

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

  const userRole = ref('user');

  const emits = defineEmits(['update:modelValue']);

  const show = computed({
    get: () => props.modelValue,
    set: (value) => emits('update:modelValue', value),
  });

  const users = ref<User[]>([]);

  async function fetchUsers() {
    users.value = await fetchProjectUsers(apiv1, props.projectId);
  }
  watch<[number, boolean]>(
    () => [props.projectId, show.value],
    async ([, show]) => {
      if (show) fetchUsers();
      newUser.value = '';
    },
  );

  const newUser = ref('');
  const loading = ref(false);
  async function onSubmit() {
    loading.value = true;
    try {
      await addProjectUser(
        apiv1,
        props.projectId,
        newUser.value,
        userRole.value,
      );
      newUser.value = '';
      await fetchUsers();
    } finally {
      loading.value = false;
    }
  }

  const selected = ref<User>();
  const showConfirm = ref(false);

  function openRemoveUserConfirm(user: User) {
    selected.value = user;
    showConfirm.value = true;
  }

  function closeRemoveUserConfirm() {
    selected.value = undefined;
    showConfirm.value = false;
  }

  async function removeUser(user: User) {
    loading.value = true;
    try {
      await removeProjectUser(apiv1, props.projectId, user.id);
      await fetchUsers();
    } finally {
      loading.value = false;
    }
  }
</script>
