<template>
  <div class="q-pa-xs tw-h-full tw-w-full">
    <q-dialog v-model="showAddDialog" :no-backdrop-dismiss="!canDismiss">
      <q-card class="tw-w-96">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">创建项目</div>
          </q-card-section>
          <q-card-section>
            <q-input v-model="newProject.title" type="text" label="项目名" />
            <q-input v-model="newProject.remark" type="textarea" label="备注" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              label="创建"
              color="primary"
              type="submit"
              :disable="!canSubmit"
            />
            <q-btn v-close-popup flat label="取消" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <div class="q-pa-xs tw-flex tw-justify-around">
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
      <q-btn :loading="loading" icon="refresh" @click="fetchProjects" />
      <q-btn icon="add" @click="showAddDialog = true" />
    </div>
    <q-scroll-area class="tw-h-[95%]" visible>
      <q-list class="q-pa-md">
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
  import { computed, onMounted, ref, watchEffect } from 'vue';
  import { useRoute } from 'vue-router';
  import { Project } from '../request';
  import { useStore } from '../store';

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
  function actived(project: Project): boolean {
    const route = useRoute();
    return route.params.projectId === project.id.toString();
  }

  const showAddDialog = ref(false);
  const newProject = ref({
    title: '',
    remark: '',
  });
  const canDismiss = computed(() => {
    const p = newProject.value;
    return p.title.trim() === '' && p.remark.trim() === '';
  });
  const canSubmit = computed(() => {
    const p = newProject.value;
    return p.title.trim() !== '';
  });
  watchEffect(() => {
    if (!showAddDialog.value) {
      newProject.value = {
        title: '',
        remark: '',
      };
    }
  });
  async function onSubmit() {
    const p = newProject.value;
    store.commit('clearError');
    await store.dispatch('createProject', {
      title: p.title.trim(),
      remark: p.remark.trim(),
    });
    if (store.state.currentError === undefined) showAddDialog.value = false;
  }
</script>
