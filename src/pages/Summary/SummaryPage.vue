<template>
  <div class="tw-h-full tw-flex-col tw-relative">
    <div
      class="lg:tw-flex lg:tw-justify-around tw-w-full tw-h-[32rem] tw-mt-2 lg:tw-h-96 q-pa-sm tw-box-border"
    >
      <div class="tw-w-full lg:tw-h-full tw-h-1/2">
        <RecentLogCountChart :records="records" />
      </div>
      <div class="tw-w-full lg:tw-h-full tw-h-1/2">
        <ProjectsPieChart :projects="projects" />
      </div>
    </div>
    <ErrTaskLog class="lg:tw-max-h-2/3 tw-box-border"></ErrTaskLog>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import RecentLogCountChart from '@/components/RecentLogCountChart.vue';
  import ProjectsPieChart from '@/components/ProjectsPieChart.vue';
  import { useStore } from '@/store';
  import ErrTaskLog from './ErrTaskLogs.vue';

  const store = useStore();
  const records = computed(() => store.state.recentLogCountRecords);
  const projects = computed(() => store.state.projects);

  onMounted(async () => {
    await store.dispatch('recentLog');
    await store.dispatch('fetchProjects');
  });
</script>
