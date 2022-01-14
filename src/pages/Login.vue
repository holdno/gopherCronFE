<template>
  <div
    class="tw-h-full tw-bg-gradient-to-tl tw-from-green-400 tw-to-indigo-900 tw-w-full tw-py-16 tw-px-4"
  >
    <div
      class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-4/5 tw-w-full"
    >
      <img
        class="tw--top-1"
        src="https://tuk-cdn.s3.amazonaws.com/can-uploader/sign_in-svg1.svg"
        alt="logo"
      />
      <div
        class="tw-bg-white tw-shadow tw-rounded tw-max-w-lg md:tw-w sm:tw-w-2/3 tw-w-full tw-p-10 tw-mt-16"
      >
        <q-form @submit="onSubmit" @reset="onReset">
          <div>
            <label
              id="email"
              class="tw-text-sm tw-font-medium tw-leading-none tw-text-gray-800"
              >Email</label
            >
            <q-input
              v-model="username"
              type="text"
              input-class="tw-bg-gray-200 tw-border tw-rounded tw-text-xs tw-font-medium tw-leading-none tw-text-gray-800 tw-py-3 tw-w-full tw-pl-3 tw-mt-2"
            />
          </div>
          <div class="tw-mt-6 tw-w-full">
            <label
              for="pass"
              class="tw-text-sm tw-font-medium tw-leading-none tw-text-gray-800"
              >Password</label
            >
            <q-input
              v-model="password"
              type="password"
              input-class="tw-bg-gray-200 tw-border tw-rounded tw-text-xs tw-font-medium tw-leading-none tw-text-gray-800 tw-py-3 tw-w-full tw-pl-3 tw-mt-2"
            />
          </div>
          <div class="tw-mt-8">
            <q-btn
              color="primary"
              type="submit"
              label="登录"
              class="focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-700 tw-text-sm tw-font-semibold tw-leading-none tw-text-white focus:tw-outline-none tw-bg-indigo-700 tw-border tw-rounded hover:tw-bg-indigo-600 tw-py-4 tw-w-full"
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
  import { useStore } from '@/store';

  const username = ref('');
  const password = ref('');
  const store = useStore();
  const router = useRouter();
  const route = useRoute();

  async function onSubmit() {
    await store.dispatch('login', {
      username: username.value,
      password: password.value,
    });
    if (store.state.logined) {
      const redirect = route.query.redirect;
      let to = '/';
      if (typeof redirect === 'string') {
        to = redirect;
      } else if (redirect && redirect.length > 0) {
        to = redirect[0] || to;
      }
      await router.push(to);
    }
  }

  function onReset() {
    username.value = '';
    password.value = '';
  }

  onBeforeMount(() => store.commit('unauthed'));
</script>
