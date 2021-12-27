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
      :mini="miniState"
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

          <q-item v-ripple clickable :to="{ name: 'taskflow' }">
            <q-item-section avatar>
              <q-icon name="mediation" />
            </q-item-section>

            <q-item-section>Taskflows</q-item-section>
          </q-item>

          <q-separator />

          <q-item v-ripple clickable :to="{ name: 'logout' }">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>

            <q-item-section>Logout</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="tw-w-full">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  const Component = defineComponent({
    setup() {
      return {
        drawer: ref(false),
        miniState: ref(true),
      };
    },
  });
  export default Component;
</script>
