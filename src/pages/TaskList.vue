<template>
  <div class="tw-basis-1/6 tw-h-full">
    <TaskList :project-id="props.projectId" />
  </div>
  <div class="tw-basis-2/3 tw-h-full">
    <router-view />
  </div>
</template>

<script setup lang="ts">
  import TaskList from '../components/TaskList.vue';

  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
  });
</script>
