<template>
  <q-dialog v-model="show">
    <q-card class="tw-w-96 q-pa-sm">
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
          @remove="removeUser(user)"
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
            <q-btn flat icon="add" text-color="primary" @click="onSubmit">
              添加
            </q-btn>
          </template>
        </q-input>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';

  import {
    User,
    addProjectUser,
    apiv1,
    fetchProjectUsers,
    removeProjectUser,
  } from '@/api/request';

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
  async function onSubmit() {
    await addProjectUser(apiv1, props.projectId, newUser.value);
    newUser.value = '';
    await fetchUsers();
  }

  async function removeUser(user: User) {
    await removeProjectUser(apiv1, props.projectId, user.id);
    await fetchUsers();
  }
</script>
