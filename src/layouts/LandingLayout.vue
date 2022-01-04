<template>
  <q-layout
    view="hHh Lpr lff"
    class="rounded-borders tw-flex tw-flex-no-wrap tw-h-full"
  >
    <q-header elevated class="bg-black">
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="drawer = !drawer" />
        <q-toolbar-title>GopherCron</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :mini="miniState && !adminMenuExpanded"
      :width="200"
      :breakpoint="500"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item v-ripple clickable :to="{ name: 'summary' }">
            <q-item-section avatar>
              <q-icon name="timeline" />
            </q-item-section>

            <q-item-section>Overview</q-item-section>
          </q-item>

          <q-item v-ripple clickable :to="{ name: 'projects' }">
            <q-item-section avatar>
              <q-icon name="view_list" />
            </q-item-section>

            <q-item-section>Projects</q-item-section>
          </q-item>

          <q-item v-ripple clickable :to="{ name: 'workflows' }">
            <q-item-section avatar>
              <q-icon name="mediation" />
            </q-item-section>

            <q-item-section>Workflows</q-item-section>
          </q-item>

          <q-separator class="tw-bg-stone-800" />

          <q-expansion-item
            v-if="store.getters.isAdmin"
            v-model="adminMenuExpanded"
            label="Admin"
            icon="admin_panel_settings"
          >
            <q-item
              v-ripple
              clickable
              :header-inset-level="2"
              :to="{ name: 'projects-admin' }"
            >
              <q-item-section avatar>
                <q-icon name="view_list" />
              </q-item-section>

              <q-item-section>Projects</q-item-section>
            </q-item>
          </q-expansion-item>
          <q-separator class="tw-bg-stone-800" />

          <q-item v-ripple clickable :to="{ name: 'logout' }">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>

            <q-item-section>Logout</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="tw-w-full tw-h-screen">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
  import { ref, watchEffect } from 'vue';
  import { useRoute } from 'vue-router';
  import { useStore } from '../store';
  const drawer = ref(false);
  const miniState = ref(true);
  const adminMenuExpanded = ref(false);
  const store = useStore();
  const route = useRoute();
  watchEffect(() => {
    if (!route.name) return;
    const adminMenuItemRouteNames = ['projects-admin'];
    adminMenuExpanded.value = adminMenuItemRouteNames.includes(
      route.name.toString(),
    );
  });
</script>
