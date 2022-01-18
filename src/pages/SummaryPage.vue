<template>
  <div class="lg:tw-flex lg:tw-justify-around tw-w-full tw-mt-2 tw-h-1/2 q-pa-sm">
    <div class="tw-w-full tw-h-full">
      <RecentLogCountChart :records="records" />
    </div>
    <div class="tw-w-full tw-h-full">
      <ProjectsPieChart :projects="projects" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import RecentLogCountChart from '@/components/RecentLogCountChart.vue';
import ProjectsPieChart from '@/components/ProjectsPieChart.vue';
import { useStore } from '@/store';

const store = useStore();
const records = computed(() => store.state.recentLogCountRecords);
const projects = computed(() => store.state.projects);

onMounted(async () => {
  await store.dispatch('recentLog');
  await store.dispatch('fetchProjects');
});
</script>
