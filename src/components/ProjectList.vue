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
    <q-list class="q-pa-xs tw-h-full">
      <q-scroll-area class="tw-h-full tw-overscroll-contain">
        <q-item
          v-for="project in projects"
          :key="project.id"
          class="tw-w-full"
          :to="{ name: 'project', params: { projectId: project.id } }"
        >
          <div class="tw-w-full">
            <q-card>
              <q-card-section class="text-center">
                <strong>{{ project.title }}</strong>
              </q-card-section>
            </q-card>
          </div>
        </q-item>
      </q-scroll-area>
    </q-list>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
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
</script>
