<template>
  <q-layout
    view="hHh Lpr lff"
    class="rounded-borders tw-flex tw-flex-no-wrap tw-h-full tw-w-full"
  >
    <q-header elevated class="bg-black">
      <q-toolbar class="tw-gap-4">
        <q-btn flat round dense icon="menu" @click="drawer = !drawer" />
        <q-toolbar-title>
          GopherCron
          <span v-if="version" class="tw-text-sm">({{ version }})</span>
        </q-toolbar-title>
        <q-btn
          flat
          round
          dense
          :icon="
            notificationSetting.status ? 'notifications' : 'notifications_off'
          "
          @click="switchNotificationSetting"
        >
          <q-tooltip>
            {{
              notificationSetting.status
                ? '点击关闭任务状态通知'
                : '点击开启任务状态通知'
            }}
          </q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          href="https://github.com/holdno/gopherCron"
          target="_blank"
        >
          <svg
            fill="#fff"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
        </q-btn>
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
  import { computed, ref, watchEffect } from 'vue';
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

  const notificationSetting = computed(() => store.getters.notificationSetting);
  console.log(notificationSetting.value);
  function switchNotificationSetting() {
    store.dispatch('changeNotificationStatus');
  }
</script>
