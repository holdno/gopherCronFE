<template>
  <div :class="'tw-basis-1/6 tw-h-full tw-w-full ' + visibilyClass">
    <TaskList :project-id="props.projectId" />
  </div>
  <div class="tw-basis-2/3 tw-h-full tw-w-full">
    <router-view />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import TaskList from '../components/TaskList.vue';

  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
  });

  const route = useRoute();
  const visibilyClass = computed(() =>
    route.name && route.name.toString() === 'task'
      ? 'tw-hidden lg:tw-block'
      : '',
  );
</script>
