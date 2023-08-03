<template>
  <div
    class="tw-h-full tw-bg-gradient-to-tl tw-from-primary tw-to-black tw-w-full tw-px-4"
  >
    <div
      class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-w-full"
    >
      <LogoTpl class="tw-w-24 md:tw-w-32" src="./logo_white.png"></LogoTpl>
      <div
        class="tw-bg-[#1D1D1D] tw-shadow tw-rounded tw-max-w-md lg:tw-w-1/3 sm:tw-w-2/3 tw-w-full tw-p-10 md:tw-mt-6 tw-mt-2"
      >
        <q-btn
          v-if="allowLoginMethods?.oidc"
          outline
          text-color="white"
          :loading="oidcLoading"
          :disable="oidcLoading || loading"
          class="focus:tw-ring-2 tw-mb-6 focus:tw-ring-offset-2 tw-font-semibold tw-leading-none tw-text-black tw-outline-non tw-border tw-rounded tw-py-2 tw-w-full"
          @click="getAuthURL"
        >
          使用 OIDC 登录
        </q-btn>
        <p
          tabindex="0"
          class="focus:tw-outline-none tw-text-2xl tw-font-extrabold tw-leading-6"
        >
          账号密码登录
        </p>
        <p
          tabindex="0"
          class="tw-pb-8 focus:tw-outline-none tw-text-sm tw-mt-4 tw-font-medium tw-leading-none tw-text-gray-500"
        >
          没有账号?
          <a
            href="javascript:void(0)"
            class="hover:text-gray-500 focus:text-gray-500 focus:outline-none focus:underline hover:underline text-sm font-medium leading-none text-gray-800 cursor-pointer"
            >请联系管理员开通</a
          >
        </p>
        <q-form @submit="onSubmit" @reset="onReset">
          <div>
            <label
              id="email"
              class="tw-text-sm tw-font-medium tw-leading-none tw-text-white"
              >账号</label
            >
            <q-input v-model="username" dense type="text" square filled />
          </div>
          <div class="tw-mt-6 tw-w-full">
            <label
              for="pass"
              class="tw-text-sm tw-font-medium tw-leading-none tw-text-white"
              >密码</label
            >
            <q-input v-model="password" dense type="password" square filled />
          </div>
          <div class="tw-mt-8">
            <q-btn
              color="primary"
              type="submit"
              label="登录"
              text-color="black"
              :loading="loading"
              :disable="oidcLoading || loading"
              class="focus:tw-ring-2 focus:tw-ring-offset-2 tw-font-semibold tw-leading-none tw-text-black tw-outline-non tw-border tw-rounded tw-py-2 tw-w-full"
            />
            <q-btn
              color="primary"
              type="reset"
              label="重置"
              flat
              class="tw-text-sm tw-w-full tw-mt-3 tw-border tw-rounded"
            />
          </div>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeMount, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import { LoginMethod, getOIDCAuthURL, loginMethods } from '@/api/request';
  import LogoTpl from '@/components/LogoTpl.vue';
  import { useStore } from '@/store/index';
  import { getQueryVariable } from '@/utils/utils';

  const username = ref('');
  const password = ref('');
  const store = useStore();
  const router = useRouter();
  const route = useRoute();
  const loading = ref(false);

  const oidcLoading = ref(false);

  let code = getQueryVariable('code');
  let state = getQueryVariable('state');
  if (!code) {
    code = route.query.code as string;
  }
  if (!state) {
    state = route.query.state as string;
  }
  if (code && state) {
    oidcLogin(code, state);
  }

  const allowLoginMethods = ref<LoginMethod>();

  async function getLoginMethods() {
    try {
      allowLoginMethods.value = await loginMethods();
    } catch (e: any) {
      console.error(e);
    }
  }

  getLoginMethods();

  async function oidcLogin(code: string, state: string) {
    oidcLoading.value = true;
    console.log('code', code, state);
    await store.dispatch('loginWithOIDC', {
      code,
      state,
    });
    if (store.state.Root.logined) {
      const redirect = route.query.redirect;
      let to = '/';
      if (typeof redirect === 'string') {
        to = redirect;
      } else if (redirect && redirect.length > 0) {
        to = redirect[0] || to;
      }
      await router.push(to);
    }
    oidcLoading.value = false;
  }

  async function getAuthURL() {
    oidcLoading.value = true;
    try {
      const url = await getOIDCAuthURL();
      window.location.href = url;
    } catch (e: any) {
      console.error(e);
      oidcLoading.value = false;
    }
  }

  async function onSubmit() {
    loading.value = true;
    await store.dispatch('login', {
      username: username.value,
      password: password.value,
    });
    if (store.state.Root.logined) {
      const redirect = route.query.redirect;
      let to = '/';
      if (typeof redirect === 'string') {
        to = redirect;
      } else if (redirect && redirect.length > 0) {
        to = redirect[0] || to;
      }
      await router.push(to);
    }
    loading.value = false;
  }

  function onReset() {
    username.value = '';
    password.value = '';
  }

  onBeforeMount(() => store.commit('unauthed'));
</script>
