<template>
  <div class="tw-h-full tw-flex-col tw-relative">
    <q-skeleton v-if="loading" type="QInput" class="tw-m-10" />
    <div
      v-else
      class="lg:tw-flex lg:tw-justify-around tw-w-full tw-h-[32rem] tw-mt-2 lg:tw-h-96 q-pa-sm tw-box-border"
    >
      <div v-if="!loading" class="tw-w-full lg:tw-h-full tw-h-1/2">
        <RecentLogCountChart :records="records" />
      </div>
      <div v-if="!loading" class="tw-w-full lg:tw-h-full tw-h-1/2">
        <ProjectsPieChart :projects="projects" />
      </div>
    </div>
    <ErrTaskLog
      v-if="store.getters.currentOrg"
      :org-id="store.getters.currentOrg"
      class="lg:tw-max-h-2/3 tw-box-border"
    ></ErrTaskLog>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';

  import ErrTaskLog from './ErrTaskLogs.vue';

  import ProjectsPieChart from '@/components/ProjectsPieChart.vue';
  import RecentLogCountChart from '@/components/RecentLogCountChart.vue';
  import { useStore } from '@/store/index';

  const store = useStore();
  const records = computed(() => store.state.Root.recentLogCountRecords);
  const projects = computed(() => store.state.Project.projects);

  const loading = ref(false);

  async function init(orgId: string) {
    loading.value = true;
    try {
      await store.dispatch('recentLog', orgId);
      await store.dispatch('Project/fetchProjects', {
        orgId: orgId,
      });
    } catch (e: any) {
      console.error(e);
    }
    loading.value = false;
  }

  const route = useRoute();
  onMounted(async () => {
    if (route.params.orgId !== store.getters.currentOrg) {
      store.commit('setCurrentOrg', route.params.orgId);
    }
    init(store.getters.currentOrg);
    watch(
      () => store.getters.currentOrg,
      (current, previous) => {
        init(current);
      },
    );
  });
</script>
