<template>
  <div class="q-pa-md tw-flex tw-gap-4 tw-h-[95%]">
    <WorkflowList />
    <router-view />
  </div>
</template>

<script setup lang="ts">
  import WorkflowList from '../components/WorkflowList.vue';
</script>
