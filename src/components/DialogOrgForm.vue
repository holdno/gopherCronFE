<template>
  <q-dialog v-model="show" :no-backdrop-dismiss="!canDismiss">
    <q-card class="tw-w-96 q-pa-sm">
      <q-form @submit="onSubmit">
        <q-card-section>
          <div v-if="editable.id === ''" class="text-h6">创建组织</div>
          <div v-else class="text-h6">编辑组织</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="editable.title"
            type="text"
            label="组织名称"
            square
            filled
            class="tw-mb-4"
          />
          <q-input
            v-model="editable.remark"
            type="textarea"
            label="备注"
            square
            filled
          />
        </q-card-section>
        <q-card-section
          align="right"
          class="tw-flex tw-gap-4 tw-flex-col-reverse lg:tw-flex-row lg:tw-justify-end"
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
            type="submit"
            :label="editable.id === '' ? '创建' : '保存'"
            :disable="!canSubmit"
            class="lg:tw-w-24 tw-w-full"
            :loading="loading"
          />
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watchEffect } from 'vue';

  import { Org } from '@/api/org';
  import { useStore } from '@/store/index';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
  });

  const loading = ref(false);
  const emits = defineEmits(['update:modelValue']);

  const show = computed({
    get: () => props.modelValue,
    set: (value) => emits('update:modelValue', value),
  });

  const store = useStore();

  const editable = ref<Org>({ title: '', remark: '', id: '' });
  const origin = ref<Org>({ title: '', remark: '', id: '' });

  const canDismiss = computed(() => {
    const p = editable.value;
    const o = origin.value;
    return (
      p?.title.trim() === o?.title.trim() &&
      p?.remark.trim() === o?.remark.trim()
    );
  });

  const canSubmit = computed(() => {
    const p = editable.value;
    return p?.title.trim() !== '' && !canDismiss.value;
  });

  onMounted(() => {
    watchEffect(() => {
      if (!show.value) {
        editable.value = Object.assign({}, origin.value);
      }
    });
  });

  async function onSubmit() {
    const p = editable.value;
    if (!p) {
      store.commit('error', { error: '请输入组织信息' });
      return;
    }
    store.commit('cleanError');
    loading.value = true;
    if (p.id !== '') {
      await store.dispatch('updateOrg', {
        id: p.id,
        title: p.title.trim(),
        remark: p.remark.trim(),
      });
    } else {
      await store.dispatch('createOrg', {
        title: p.title.trim(),
        remark: p.remark.trim(),
      });
    }
    if (store.state.Root.currentError === undefined) show.value = false;
    loading.value = false;
  }
</script>
