<template>
  <div class="lg:tw-flex lg:tw-flex-row tw-w-full tw-h-full">
    <div
      :class="
        'xl:tw-basis-1/5 tw-basis-1/4 tw-h-full tw-w-full tw-min-w-[280px] ' +
        visibilyClass
      "
    >
      <ProjectList v-if="orgId" :org-id="orgId" />
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';

  import ProjectList from '@/components/ProjectList.vue';

  defineProps({
    orgId: {
      type: String,
      required: true,
    },
  });

  const route = useRoute();
  const visibilyClass = computed(() =>
    route.name && route.name.toString() !== 'projects'
      ? 'tw-hidden lg:tw-block'
      : '',
  );
</script>
