<template>
  <q-dialog v-model="open" :no-backdrop-dismiss="!canDismiss">
    <q-card style="width: 300px">
      <q-card-section>
        <div class="text-h6">{{ user ? '编辑' : '新增' }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form class="tw-w-full" @submit="onSubmit">
          <q-input
            key="name"
            v-model="userData.name"
            :disable="userData.id !== undefined"
            type="textarea"
            label="名称"
            autogrow
            square
            filled
            class="tw-mb-4"
          />

          <q-input
            key="account"
            v-model="userData.account"
            :disable="userData.id !== undefined"
            type="text"
            label="账号(邮箱)"
            square
            filled
            class="tw-mb-4"
          />
          <q-input
            v-if="userData.id === undefined || !isAdmin"
            key="password_again"
            v-model="userData.password"
            type="password"
            :label="userData.id === undefined ? '密码' : '旧密码'"
            square
            filled
            class="tw-mb-4"
          />
          <q-input
            v-if="userData.id !== undefined"
            key="password"
            v-model="userData.newPassword"
            type="password"
            label="新密码"
            square
            filled
            class="tw-mb-4"
          />
          <q-input
            key="password_again"
            v-model="userData.passwordAgain"
            type="password"
            label="确认新密码"
            square
            filled
            class="tw-mb-4"
          />

          <div class="tw-flex tw-flex-row-reverse tw-gap-4">
            <q-btn
              color="primary"
              text-color="black"
              type="submit"
              label="提交"
              class="lg:tw-w-24 tw-w-full"
            />
            <q-btn
              flat
              type="reset"
              label="取消"
              class="lg:tw-w-24 tw-w-full"
              @click="open = false"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
  import { PropType, computed, ref } from 'vue';
  import { User } from '@/api/request';
  import { createUser, changePassword } from '@/api/user';
  import { store } from '@/store';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object as PropType<User>,
      default: null,
    },
  });
  const defaultValue =
    props.user != null
      ? { ...props.user, password: '', passwordAgain: '', newPassword: '' }
      : {
          id: undefined,
          account: '',
          password: '',
          newPassword: '',
          passwordAgain: '',
          name: '',
        };
  const userData = ref(Object.assign({}, defaultValue));
  const canDismiss = computed(() => {
    return JSON.stringify(defaultValue) === JSON.stringify(userData.value);
  });
  const isAdmin = store.getters.isAdmin;
  const emits = defineEmits(['update:modelValue', 'modify']);
  const reset = () => {
    userData.value = Object.assign({}, defaultValue);
  };

  const open = computed<boolean>({
    get() {
      return props.modelValue;
    },
    set(value) {
      if (!value) {
        reset();
      }
      emits('update:modelValue', value);
    },
  });

  const update = async () => {
    try {
      if (userData.value.newPassword !== userData.value.passwordAgain) {
        store.commit('error', { error: new Error('两次密码不一致') });
        return;
      }
      const resp = await changePassword({
        userID: userData.value.id ? userData.value.id : 0,
        password: userData.value.password,
        newPassword: userData.value.newPassword,
      });
      if (resp.meta.code === 0) {
        store.commit('success', { message: '修改成功' });
        open.value = false;
        emits('modify', {});
      }
    } catch (e) {
      console.log(e);
    }
  };

  const create = async () => {
    try {
      if (userData.value.password !== userData.value.passwordAgain) {
        store.commit('error', { error: new Error('两次密码不一致') });
        return;
      }
      const res = await createUser({
        account: userData.value.account,
        password: userData.value.password,
        name: userData.value.name,
      });

      if (res.meta.code === 0) {
        store.commit('success', { message: '新增成功' });
        open.value = false;
        emits('modify', {});
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onSubmit = async () => {
    if (props.user) {
      return await update();
    } else {
      return await create();
    }
  };
</script>
