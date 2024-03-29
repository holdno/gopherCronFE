<template>
  <q-dialog v-model="show" :no-backdrop-dismiss="!canDismiss">
    <q-card class="tw-w-96 q-pa-sm">
      <q-form @submit="onSubmit">
        <q-card-section>
          <div v-if="project === undefined" class="text-h6">创建项目</div>
          <div v-else class="text-h6">编辑项目</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="editable.title"
            type="text"
            label="项目名"
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
            :label="project === undefined ? '创建' : '保存'"
            :disable="!canSubmit"
            :loading="loading"
            class="lg:tw-w-24 tw-w-full"
          />
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watchEffect } from 'vue';

  import { useStore } from '@/store/index';

  const props = defineProps({
    projectId: {
      type: Number,
      default: 0,
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
    orgId: {
      type: String,
      required: true,
    },
  });

  const emits = defineEmits(['update:modelValue']);

  const show = computed({
    get: () => props.modelValue,
    set: (value) => emits('update:modelValue', value),
  });

  const store = useStore();

  const project = computed(() =>
    store.state.Project.projects.find((p) => p.id === props.projectId),
  );

  const origin = computed(() => {
    const p = project.value;
    return {
      title: p?.title || '',
      remark: p?.remark || '',
    };
  });

  const editable = ref(origin.value);

  const canDismiss = computed(() => {
    const p = editable.value;
    const o = origin.value;
    return (
      p.title.trim() === o.title.trim() && p.remark.trim() === o.remark.trim()
    );
  });

  const canSubmit = computed(() => {
    const p = editable.value;
    return p.title.trim() !== '' && !canDismiss.value;
  });

  onMounted(() => {
    watchEffect(() => {
      if (!show.value) {
        editable.value = Object.assign({}, origin.value);
      }
    });
  });

  const loading = ref(false);
  async function onSubmit() {
    loading.value = true;
    try {
      const p = editable.value;
      store.commit('cleanError');
      if (props.projectId > 0) {
        await store.dispatch('updateProject', {
          projectId: props.projectId,
          title: p.title.trim(),
          remark: p.remark.trim(),
          orgId: props.orgId,
        });
      } else {
        await store.dispatch('createProject', {
          orgId: props.orgId,
          title: p.title.trim(),
          remark: p.remark.trim(),
        });
      }
      if (store.state.Root.currentError === undefined) show.value = false;
    } catch (e: any) {
      console.error(e);
      store.commit('error', { error: e });
    }
    loading.value = false;
  }
</script>
