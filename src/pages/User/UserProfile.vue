<template>
  <div>
    <div class="tw-bg-gradient-to-r tw-from-primary tw-to-purple-500">
      <div class="tw-mx-auto tw-container tw-px-6">
        <div class="xl:tw-flex tw-items-center tw-flex-wrap">
          <div class="xl:tw-w-3/4 2xl:tw-w-4/5"></div>
          <div
            class="xl:tw-w-1/4 2xl:tw-w-1/5 tw-flex tw-flex-col tw-items-center xl:tw-pl-8 tw-py-12 md:tw-pt-12 md:tw-pb-12 xl:tw-pb-6"
          >
            <div class="tw-w-full tw-flex tw-items-center tw-justify-center">
              <div class="tw-flex tw-flex-col tw-items-center">
                <div
                  class="tw-w-20 tw-h-20 tw-bg-gray-700 tw-rounded-full tw-flex tw-items-center tw-justify-center"
                >
                  <p
                    class="tw-text-lg tw-font-bold tw-rounded tw-leading-3 tw-text-white"
                  >
                    {{ generateAvatarName(user.name) }}
                  </p>
                </div>
                <p
                  class="tw-mt-2 tw-text-xs sm:tw-text-sm md:tw-text-base tw-font-semibold tw-text-center tw-text-white"
                >
                  {{ user.name }}
                </p>
              </div>
            </div>
            <!-- <div class="tw-flex tw-items-center tw-mt-7">
              <div class="">
                <p class="tw-text-base tw-text-gray-300">账号</p>
                <p class="tw-mt-2 tw-text-xs tw-text-gray-50"></p>
              </div>

              <div class="tw-ml-12">
                <p class="tw-text-base tw-text-gray-300">角色</p>
                <p class="tw-mt-2 tw-text-xs tw-text-gray-50">
                  {{ user.permissions ? user.permissions.join(',') : '-' }}
                </p>
              </div>
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <div class="tw-px-4 xl:tw-px-0">
      <div class="tw-mx-auto tw-container">
        <div class="xl:tw-flex">
          <div class="xl:tw-w-3/4 2xl:tw-w-4/5 tw--mt-8 xl:tw--mt-36">
            <div
              class="tw-pl-4 md:tw-pl-10 tw-py-4 md:tw-py-7 tw-bg-gray-100 tw-rounded-tl-lg tw-rounded-tr-lg tw-shadow"
            >
              <p
                class="tw-text-base sm:tw-text-lg md:tw-text-xl lg:tw-text-2xl tw-font-bold tw-leading-normal tw-text-gray-800"
              >
                更新日志
              </p>
            </div>
            <div
              class="q-dark tw-shadow-lg tw-pb-8 tw-px-4 md:tw-px-8 xl:tw-px-10 tw-h-5/6 tw-py-6"
            >
              V2.0.0-Beta<br />
              增加 workflow 功能
            </div>
          </div>
          <div class="xl:tw-w-1/4 2xl:tw-w-1/5 tw-pt-7 xl:tw-pl-8 tw-pb-7">
            <div>
              <p class="tw-text-base tw-font-semibold tw-text-gray-100">
                账号信息
              </p>
              <div class="tw-mt-4">
                <div
                  class="tw-flex tw-box-border tw-px-2 q-dark tw-h-10 tw-border-dashed tw-shadow tw-items-center tw-w-full tw-justify-between tw-rounded"
                >
                  {{ user.account }} boya.wang@baishancloud.com
                </div>
                <div
                  class="tw-flex tw-box-border tw-px-2 tw-mt-4 q-dark tw-h-10 tw-border-dashed tw-shadow tw-items-center tw-w-full tw-justify-between tw-rounded"
                >
                  {{ user.permissions ? user.permissions.join(',') : '-' }}
                </div>
              </div>
            </div>
            <div class="tw-mt-7">
              <p class="tw-text-base tw-font-semibold tw-text-gray-100">
                个人设置
              </p>
              <div
                class="tw-flex tw-mt-4 q-dark tw-h-12 tw-shadow tw-items-center tw-w-full tw-justify-between tw-rounded"
              >
                <q-btn
                  unelevated
                  class="q-dark tw-w-full tw-h-full"
                  label="修改密码"
                  @click="showModify = true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ModifyBox v-model="showModify" :user="user"></ModifyBox>
</template>

<script lang="ts" setup>
  import { useStore } from '@/store';
  import ModifyBox from '@/pages/UserListAdmin/ModifyBox.vue';
  import { ref } from 'vue';
  import { generateAvatarName } from '@/utils/utils';

  const store = useStore();
  const user = store.getters.currentUser;
  const showModify = ref(false);
</script>
