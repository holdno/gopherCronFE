<template>
  <div class="tw-h-full tw-w-full tw-flex tw-flex-col">
    <DialogProjectDeleteConfirm
      v-if="projectSelected"
      v-model="showDeleteConfirm"
      :project-id="projectSelected.id"
    />
    <DialogProjectForm v-model="showAddDialog" />
    <div class="q-pa-md tw-flex tw-justify-around">
      <q-input v-model="filter" borderless dense debounce="300" placeholder="Search">
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn flat :loading="loading" icon="refresh" @click="fetchProjects" />
      <q-btn flat icon="add" @click="showAddDialog = true" />
      <q-btn
        flat
        class="tw-text-red-300 lg:tw-flex tw-hidden"
        icon="delete"
        :disable="!projectSelected"
        @click="showDeleteConfirm = true"
      />
    </div>
    <q-scroll-area
      class="tw-grow tw-px-[15px]"
      visible
      :thumb-style="thumbStyle"
      :bar-style="barStyle"
    >
      <q-list class="tw-flex tw-flex-col tw-gap-2">
        <div
          v-for="project in projects"
          :key="project.id"
          :class="
            (!activated(project)
              ? 'tw-bg-[#27272a] '
              : 'tw-bg-primary tw-text-black ') +
            'tw-w-full tw-flex tw-flex-row tw-rounded-md'
          "
        >
          <router-link
            class="tw-grow tw-p-4"
            :to="{ name: 'project', params: { projectId: project.id } }"
          >{{ project.title }}</router-link>
          <DropdownProjectManage v-if="isAdmin" :project-id="project.id" />
        </div>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Project } from '@/api/request';
import { useStore } from '@/store';
import DropdownProjectManage from './DropdownProjectManage.vue';
import DialogProjectDeleteConfirm from './DialogProjectDeleteConfirm.vue';
import DialogProjectForm from './DialogProjectForm.vue';
import { thumbStyle, barStyle } from '@/utils/thumbStyle'

const store = useStore();
const loading = computed(() => store.state.loadingProjects);
onMounted(async () => {
  await store.dispatch('fetchProjects');
});
async function fetchProjects() {
  await store.dispatch('fetchProjects');
}

const filter = ref('');
const projects = computed(() =>
  store.state.projects.filter(
    (p: Project) =>
      p.title.indexOf(filter.value) >= 0 ||
      p.id.toString().indexOf(filter.value) >= 0,
  ),
);
function activated(project: Project): boolean {
  const route = useRoute();
  return route.params.projectId === project.id.toString();
}

const showAddDialog = ref(false);

const showDeleteConfirm = ref(false);
const projectSelected = computed(() =>
  projects.value.filter(activated).pop(),
);

const isAdmin = computed(() => store.getters.isAdmin);
</script>
