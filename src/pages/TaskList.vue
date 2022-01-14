<template>
  <div
    :class="
      'xl:tw-basis-1/6 tw-basis-1/4 tw-h-full tw-w-full tw-bg-[#1E1E1E] ' +
      visibilyClass
    "
  >
    <TaskList :project-id="props.projectId" />
  </div>
  <div class="xl:tw-basis-2/3 tw-basis-1/2 tw-h-full tw-w-full">
    <router-view />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import TaskList from '@/components/TaskList.vue';

  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
  });

  const route = useRoute();
  const visibilyClass = computed(() =>
    route.name && route.name.toString() !== 'project'
      ? 'tw-hidden lg:tw-block'
      : '',
  );
</script>
