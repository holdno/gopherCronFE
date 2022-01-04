<template>
  <div class="q-pa-md">
    <WorkflowList />
    <router-view />
  </div>
</template>

<script setup lang="ts">
  import WorkflowList from '../components/WorkflowList.vue';
</script>
