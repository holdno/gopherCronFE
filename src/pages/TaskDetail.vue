<template>
  <TaskDetail :id="props.id" />
</template>

<script setup lang="ts">
  import TaskDetail from '../components/TaskDetail.vue';
  const props = defineProps({
    id: {
      type: String,
      required: true,
    },
  });
</script>
