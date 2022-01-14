<template>
  <q-dialog v-model="open">
    <q-card style="width: 300px">
      <q-card-section>
        <div class="text-h6">{{ user ? '编辑' : '新增' }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form class="tw-w-full" @submit="onSubmit">
          <q-input
            key="name"
            v-model="userData.name"
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
            type="text"
            label="账号(邮箱)"
            square
            filled
            class="tw-mb-4"
          />
          <q-input
            key="password"
            v-model="userData.password"
            type="password"
            label="密码"
            autogrow
            square
            filled
            class="tw-mb-4"
          />

          <div class="q-pa-sm">
            <q-btn
              color="primary"
              text-color="black"
              type="submit"
              label="提交"
              class="lg:tw-w-24 tw-w-full lg:tw-mr-4 lg:tw-mb-0 tw-mb-4"
            />
            <q-btn
              color="primary"
              type="reset"
              label="取消"
              @click="open = false"
              flat
              class="lg:tw-w-24 tw-w-full"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, PropType, computed } from 'vue';
import { User } from '@/request';

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

const userData = ref({
  account: '',
  password: '',
  name: '',
});

const emits = defineEmits(['update:modelValue']);

const open = computed<boolean>({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const onSubmit = () => { };
</script>
