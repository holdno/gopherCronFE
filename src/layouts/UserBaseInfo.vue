<template>
  <div
    class="tw-flex tw-bg-primary tw-justify-start tw-space-x-2 tw-items-center tw-h-full tw-py-4 tw-px-3.5 tw-box-border tw-w-full tw-text-black tw-overflow-hidden"
  >
    <div
      class="tw-w-10 tw-h-10 tw-bg-gray-700 tw-rounded-sm tw-flex tw-items-center tw-justify-center"
    >
      <p class="tw-text-xs tw-font-bold tw-rounded tw-leading-3 tw-text-white">
        {{ avatar }}
      </p>
    </div>
    <div class="q-item__section--main tw-flex tw-w-full tw-justify-between">
      <div class="tw-flex tw-flex-col tw-space-y-2 tw-overflow-hidden">
        <p
          class="tw-text-base tw-leading-4 tw-whitespace-nowrap tw-overflow-hidden tw-overflow-ellipsis"
        >
          {{ user.name }}
        </p>
        <p class="tw-cursor-pointer tw-text-xs tw-leading-3">
          {{ user.account }}
        </p>
      </div>
      <q-btn
        flat
        dense
        size="md"
        icon="more_horiz"
        round
        @click="redirectUserProfile"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { User } from '@/api/request';
  import { useStore } from '@/store/index';
  import { generateAvatarName } from '@/utils/utils';
  import { useRouter } from 'vue-router';

  const store = useStore();
  const user: User = store.getters.currentUser;
  const avatar = generateAvatarName(user.name);

  const router = useRouter();
  const redirectUserProfile = () => {
    router.push({ name: 'user-profile' });
  };
</script>
