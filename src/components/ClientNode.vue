<template>
  <q-card flat bordered>
    <q-card-section class="text-center">
      <strong>{{ clientIp }}</strong>
      <br />
      {{ region }}
      <br />
      {{ version }}
    </q-card-section>
    <q-separator />
    <q-card-section class="flex flex-center">
      <q-input
        v-model="nodeWeight"
        outlined
        dense
        type="number"
        prefix="权重："
        @keyup.enter="setNodeWeight"
      >
        <template #append>
          <q-btn dense unelevated :loading="loading" @click="setNodeWeight">
            提交
          </q-btn>
        </template>
      </q-input>
    </q-card-section>
  </q-card>
</template>

<script setup>
  import { ref } from 'vue';

  import { changeNodeWeight } from '@/api/project';
  import { useStore } from '@/store/index';

  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
    clientIp: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
  });

  const store = useStore();

  const nodeWeight = ref(props.weight);
  const loading = ref(false);

  async function setNodeWeight() {
    loading.value = true;
    const clientIP = props.clientIp.split(':')[0];
    try {
      await changeNodeWeight(
        props.projectId,
        clientIP,
        Number(nodeWeight.value),
      );
      await store.dispatch('Project/fetchProjectClients', {
        projectId: props.projectId,
      });
      store.commit('success', { message: '修改成功' });
    } catch (e) {
      console.error(e);
    }
    loading.value = false;
  }
</script>
