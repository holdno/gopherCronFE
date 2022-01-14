<template>
  <div class="q-pa-md tw-h-full tw-w-full tw-flex tw-flex-col">
    <q-dialog v-model="showDeleteConfirm">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="primary" text-color="white" />
          <span class="q-ml-sm">
            是否要删除项目 {{ projectSelected?.title }}</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="取消" color="primary" />
          <q-btn
            flat
            label="删除"
            color="red"
            @click="() => projectSelected && deleteProject(projectSelected.id)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showAddDialog" :no-backdrop-dismiss="!canDismiss">
      <q-card class="tw-w-96 q-pa-sm">
        <q-form @submit="onSubmit">
          <q-card-section>
            <div class="text-h6">创建项目</div>
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="newProject.title"
              type="text"
              label="项目名"
              square
              filled
              class="tw-mb-4"
            />
            <q-input
              v-model="newProject.remark"
              type="textarea"
              label="备注"
              square
              filled
            />
          </q-card-section>
          <q-card-actions align="around">
            <q-btn
              color="primary"
              text-color="black"
              type="submit"
              label="创建"
              :disable="!canSubmit"
              class="lg:tw-w-24 tw-w-full lg:tw-mr-4 lg:tw-mb-0 tw-mb-4"
            />
            <q-btn
              v-close-popup
              flat
              label="取消"
              class="lg:tw-w-24 tw-w-full"
            />
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
      >
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
    <q-scroll-area class="tw-grow" visible>
      <q-list class="q-pa-xs">
        <router-link
          v-for="project in projects"
          :key="project.id"
          :to="{ name: 'project', params: { projectId: project.id } }"
        >
          <div
            :class="
              (!activated(project)
                ? 'tw-bg-[#27272a] '
                : 'tw-bg-primary tw-text-black ') +
              'tw-w-full q-pa-md tw-mb-4 tw-rounded-md tw-items-center hover:tw-bg-primary hover:tw-text-black'
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
  import { useRoute, useRouter } from 'vue-router';
  import { Project } from '@/request';
  import { useStore } from '@/store';

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

  const showDeleteConfirm = ref(false);
  const projectSelected = computed(() =>
    projects.value.filter(activated).pop(),
  );
  const router = useRouter();
  async function deleteProject(projectId: number) {
    store.commit('clearError');
    await store.dispatch('deleteProject', { projectId });
    if (store.state.currentError === undefined) {
      router.push({ name: 'projects' });
      showDeleteConfirm.value = false;
    }
  }
</script>
