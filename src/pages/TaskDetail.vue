<template>
  <TaskDetail :id="props.id" :project-id="props.projectId" />
</template>

<script setup lang="ts">
  import TaskDetail from '../components/TaskDetail.vue';
  const props = defineProps({
    id: {
      type: String,
      default: '',
    },
    projectId: {
      type: Number,
      required: true,
    },
  });
</script>
