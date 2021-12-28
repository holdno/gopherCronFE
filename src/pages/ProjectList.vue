<template>
  <div class="q-pa-md lg:tw-flex lg:tw-flex-row tw-w-full tw-h-full">
    <div
      :class="
        'xl:tw-basis-1/6 tw-basis-1/4 tw-h-full tw-w-full ' + visibilyClass
      "
    >
      <ProjectList />
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
  import { useStore } from '../store';
  import ProjectList from '../components/ProjectList.vue';
  import { computed, onBeforeMount } from 'vue';
  import { useRoute } from 'vue-router';

  const store = useStore();
  onBeforeMount(() => store.commit('setTasks', { tasks: [] }));

  const route = useRoute();
  const visibilyClass = computed(() =>
    route.name && ['project', 'task'].includes(route.name.toString())
      ? 'tw-hidden lg:tw-block'
      : '',
  );
</script>
