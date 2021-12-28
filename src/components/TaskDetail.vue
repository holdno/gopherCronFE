<template>
  <q-form class="q-pa-md tw-w-full" @submit="onSumbit" @reset="onReset">
    <q-input :model-value="task ? task.id : ''" disable label="任务 ID" />
    <q-input
      :model-value="project ? project.title : ''"
      disable
      label="所属项目"
    />
    <q-input v-model="editable.name" label="任务名称" />
    <q-input
      v-model="editable.cronExpr"
      label="调度计划 (*秒 *分 *时 *日 *月 *周 *年)"
    />
    <q-input
      v-model="editable.timeout"
      type="number"
      label="超时时间 (单位:秒 s 0则不限制)"
    />
    <q-input
      v-model="editable.command"
      type="textarea"
      label="执行指令"
      autogrow
    />
    <q-input
      v-model="editable.remark"
      type="textarea"
      label="任务备注"
      autogrow
    />
    <q-toggle
      v-model="editable.noseize"
      :false-value="0"
      :true-value="1"
      label="并行调度"
    />
    <q-toggle
      v-model="editable.status"
      :false-value="0"
      :true-value="1"
      label="是否启用"
    />
    <div class="q-pa-sm">
      <q-btn color="primary" type="submit" label="保存" :disable="!modified" />
      <q-btn
        color="primary"
        type="reset"
        label="重置"
        flat
        :disable="!modified"
      />
    </div>
    <div class="q-pa-sm">
      <p>TODO: 展示在线节点信息</p>
      <p>TODO: 执行按钮</p>
    </div>
  </q-form>
</template>

<script setup lang="ts">
  import { computed, ref, watchEffect } from 'vue';
  import { useStore } from '../store';

  const props = defineProps({
    id: {
      type: String,
      required: true,
    },
  });

  const store = useStore();
  const task = computed(() => store.state.tasks.find((t) => t.id === props.id));
  const project = computed(() =>
    store.state.projects.find((p) => p.id === task.value?.projectId),
  );
  const editable = ref(Object.assign({}, task.value));
  const modified = computed(() => {
    return JSON.stringify(task.value) !== JSON.stringify(editable.value);
  });
  watchEffect(() => {
    editable.value = Object.assign({}, task.value);
  });

  async function onSumbit() {
    await store.dispatch('saveTask', {
      task: editable.value,
    });
  }
  function onReset() {
    editable.value = Object.assign({}, task.value);
  }
</script>
