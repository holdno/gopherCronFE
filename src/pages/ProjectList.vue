<template>
  <div class="lg:tw-flex lg:tw-flex-row tw-w-full tw-h-full">
    <div
      :class="
        'xl:tw-basis-1/5 tw-basis-1/4 tw-h-full tw-w-full ' + visibilyClass
      "
    >
      <ProjectList />
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';

  import ProjectList from '@/components/ProjectList.vue';

  const route = useRoute();
  const visibilyClass = computed(() =>
    route.name && route.name.toString() !== 'projects'
      ? 'tw-hidden lg:tw-block'
      : '',
  );
</script>
