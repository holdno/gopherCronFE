<template>
  <div class="q-pa-md tw-flex tw-flex-row tw-gap-4 tw-h-[95%] tw-w-full">
    <div :class="'xl:tw-basis-1/3 tw-basis-1/4 tw-shrink-0 ' + visibilyClass">
      <WorkflowList />
    </div>
    <div class="tw-basis-auto tw-overflow-auto">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import WorkflowList from '../components/WorkflowList.vue';

  const route = useRoute();
  const visibilyClass = computed(() =>
    route.name && route.name.toString() !== 'workflows'
      ? 'tw-hidden lg:tw-block'
      : '',
  );
</script>
