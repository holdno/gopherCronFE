<template>
  <q-dialog v-model="show">
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar
          :icon="config.icon"
          :color="config.iconColor"
          :text-color="config.iconColor === 'primary' ? 'black' : 'white'"
        />
        <span class="q-ml-sm">{{ content }}</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-close-popup
          flat
          :label="cancelLabel"
          :color="config.cancelColor"
          @click="cancel"
        />
        <q-btn
          flat
          :label="confirmLabel"
          :color="config.confirmColor"
          @click="callback"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
  import { Ref, computed, ref } from 'vue';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      default: '',
    },
    confirmLabel: {
      type: String,
      default: '确认',
    },
    cancelLabel: {
      type: String,
      default: '取消',
    },
    type: {
      type: String,
      default: 'confirm',
    },
  });
  const emits = defineEmits(['update:modelValue', 'confirm', 'cancel']);
  const show = computed({
    get: () => props.modelValue,
    set: (value) => emits('update:modelValue', value),
  });

  const callback = () => {
    emits('confirm');
  };
  const cancel = () => {
    emits('cancel');
  };

  interface ButtonConfig {
    confirmColor: string;
    cancelColor: string;
    iconColor: string;
    icon: string;
  }

  const config: Ref<ButtonConfig> = ref({
    confirmColor: '',
    cancelColor: '',
    icon: '',
    iconColor: '',
  });
  switch (props.type) {
    case 'warning':
      config.value.confirmColor = 'red';
      config.value.cancelColor = '';
      config.value.icon = 'notifications_active';
      config.value.iconColor = 'red';
      break;
    default:
      config.value.confirmColor = 'primary';
      config.value.cancelColor = '';
      config.value.icon = 'check';
      config.value.iconColor = 'primary';
      break;
  }
</script>
