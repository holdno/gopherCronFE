<template>
  <div
    class="lg:q-pa-md tw-box-border tw-flex tw-flex-row tw-gap-4 tw-h-full tw-w-full"
  >
    <div
      :class="
        'xl:tw-basis-1/5 tw-basis-1/4  tw-h-full tw-w-full tw-shrink-0 ' +
        visibilyClass
      "
    >
      <WorkflowList />
    </div>
    <div class="tw-w-full tw-h-full tw-grow tw-overflow-hidden">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import WorkflowList from '@/components/WorkFlowList.vue';

  const route = useRoute();
  const visibilyClass = computed(() =>
    route.name && route.name.toString() !== 'workflows'
      ? 'tw-hidden lg:tw-block'
      : '',
  );
</script>
