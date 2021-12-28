<template>
  <div class="tw-w-1/2 tw-h-1/2">
    <RecentLogCountChart :records="records" />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import RecentLogCountChart from '../components/RecentLogCountChart.vue';
  import { useStore } from '../store';

  const store = useStore();
  const records = computed(() => store.state.recentLogCountRecords);

  onMounted(async () => await store.dispatch('recentLog'));
</script>
