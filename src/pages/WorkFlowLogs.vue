<template>
  <div class="tw-w-full tw-h-full">
    <WorkFlowLogs :id="props.id" />
  </div>
</template>

<script setup lang="ts">
  import WorkFlowLogs from '../components/WorkFlowLogs.vue';

  const props = defineProps({
    id: {
      type: Number,
      required: true,
    },
  });
</script>
