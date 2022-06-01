<template>
  <q-layout
    view="hHh Lpr lff"
    class="rounded-borders tw-flex tw-flex-no-wrap tw-h-full tw-w-full"
  >
    <q-header elevated class="bg-black">
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="drawer = !drawer" />
        <q-toolbar-title>
          GopherCron
          <span v-if="version" class="tw-text-sm">({{ version }})</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      :mini="miniState && !adminMenuExpanded"
      :width="200"
      :breakpoint="500"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
    >
      <q-scroll-area style="margin-bottom: 80px; height: calc(100% - 80px)">
        <q-list padding>
          <q-item clickable :to="{ name: 'summary' }">
            <q-item-section avatar>
              <q-icon name="timeline" />
            </q-item-section>

            <q-item-section class="tw-font-medium">看板</q-item-section>
          </q-item>

          <q-item clickable :to="{ name: 'projects' }">
            <q-item-section avatar>
              <q-icon name="view_list" />
            </q-item-section>

            <q-item-section class="tw-font-medium">项目管理</q-item-section>
          </q-item>

          <q-item clickable :to="{ name: 'workflows' }">
            <q-item-section avatar>
              <q-icon name="mediation" />
            </q-item-section>

            <q-item-section class="tw-font-medium">任务编排</q-item-section>
          </q-item>

          <q-separator class="tw-bg-stone-800" />

          <q-expansion-item
            v-if="store.getters.isAdmin"
            v-model="adminMenuExpanded"
            label="系统管理"
            header-class="tw-font-medium"
            icon="admin_panel_settings"
          >
            <q-item clickable :inset-level="0.2" :to="{ name: 'user-admin' }">
              <q-item-section avatar>
                <q-icon name="supervisor_account" />
              </q-item-section>

              <q-item-section class="tw-font-medium">用户管理</q-item-section>
            </q-item>
            <q-item clickable :inset-level="0.2" :to="{ name: 'node-admin' }">
              <q-item-section avatar>
                <q-icon name="dynamic_form" />
              </q-item-section>

              <q-item-section class="tw-font-medium">节点管理</q-item-section>
            </q-item>
          </q-expansion-item>
          <q-separator class="tw-bg-stone-800" />

          <q-item clickable :to="{ name: 'logout' }">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>

            <q-item-section class="tw-font-medium">退出</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <UserBaseInfo
        class="tw-absolute tw-bottom-0 tw-left-0 tw-w-full"
        style="height: 80px"
      ></UserBaseInfo>
    </q-drawer>

    <q-page-container class="tw-w-full tw-h-full tw-box-border">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
  import { ref, watchEffect } from 'vue';
  import { useRoute } from 'vue-router';

  import UserBaseInfo from './UserBaseInfo.vue';

  import { getServiceVersion } from '@/api/version';
  import { useStore } from '@/store/index';

  const drawer = ref(true);
  const miniState = ref(true);
  const adminMenuExpanded = ref(false);
  const store = useStore();
  const route = useRoute();
  watchEffect(() => {
    if (!route.name) return;
    const adminMenuItemRouteNames = ['user-admin', 'node-admin'];
    adminMenuExpanded.value = adminMenuItemRouteNames.includes(
      route.name.toString(),
    );
  });

  const version = ref('');
  const getVersion = async () => {
    const v = await getServiceVersion();
    version.value = v;
  };
  getVersion();
</script>
