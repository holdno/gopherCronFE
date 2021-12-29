<template>
  <div class="q-pa-xs tw-h-full tw-w-full">
    <q-input
      v-model="filter"
      borderless
      dense
      debounce="300"
      placeholder="Search"
      class="q-pa-xs"
    >
      <template #append>
        <q-icon name="search" />
      </template>
    </q-input>
    <q-scroll-area class="tw-h-[95%]" visible>
      <q-list class="q-pa-xs">
        <router-link
          v-for="project in projects"
          :key="project.id"
          :to="{ name: 'project', params: { projectId: project.id } }"
        >
          <div
            :class="
              (!actived(project)
                ? 'tw-bg-[#27272a] '
                : 'tw-bg-primary tw-text-black ') +
              'tw-w-full q-pa-md tw-mb-1 tw-rounded-md tw-items-center hover:tw-bg-primary'
            "
          >
            {{ project.title }}
          </div>
        </router-link>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { Project } from '../request';
  import { useStore } from '../store';

  const store = useStore();
  onMounted(() => store.dispatch('fetchProjects'));

  const filter = ref('');
  const projects = computed(() =>
    store.state.projects.filter(
      (p: Project) =>
        p.title.indexOf(filter.value) >= 0 ||
        p.id.toString().indexOf(filter.value) >= 0,
    ),
  );
  function actived(project: Project): boolean {
    const route = useRoute();
    return route.params.projectId === project.id.toString();
  }
</script>
