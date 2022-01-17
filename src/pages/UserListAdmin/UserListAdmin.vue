<template>
  <div class="tw-w-full tw-p-4">
    <div class="q-dark tw-w-full tw-rounded tw-overflow-hidden">
      <div class="tw-px-4 tw-py-4">
        <div class="sm:tw-flex tw-items-center tw-justify-between">
          <p
            tabindex="0"
            class="focus:tw-outline-none tw-text-base sm:tw-text-lg md:tw-text-xl lg:tw-text-2xl tw-font-bold tw-leading-normal tw-text-primary"
          >
            用户管理
          </p>
          <div class="tw-mt-4 sm:tw-mt-0">
            <q-btn
              flat
              class="tw-text-white"
              icon="add"
              @click="showCreate = true"
            ></q-btn>
          </div>
        </div>
      </div>
      <div class="q-dark tw-px-4 tw-pb-5">
        <div class="tw-overflow-x-auto">
          <table class="tw-w-full tw-whitespace-nowrap">
            <tbody>
              <UserItem
                v-for="user in userList"
                :key="user.id"
                :user="user"
                @modify="refreshList"
              ></UserItem>
            </tbody>
          </table>
        </div>
      </div>
      <div class="q-pa-lg flex flex-center">
        <q-pagination
          v-model="page"
          color="black"
          :max="totalPage"
          :boundary-numbers="false"
        />
      </div>
      <ModifyBox v-model="showCreate" @modify="refreshList"></ModifyBox>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useStore } from '@/store';
  import { ref, computed, watch } from 'vue';
  import UserItem from './UserListItem.vue';
  import ModifyBox from './ModifyBox.vue';

  const page = ref(1);
  const pagesize = ref(10);
  const showCreate = ref(false);
  const store = useStore();

  const userList = computed(() => {
    return store.state.users;
  });
  const totalPage = computed((): number => {
    const total = store.state.userTotal ? store.state.userTotal : 0;
    return Math.ceil(total / pagesize.value);
  });

  const refreshList = async () => {
    await store.dispatch('fetchUsers', {
      page: page.value,
      pagesize: pagesize.value,
    });
  };
  refreshList();
  watch(page, (now, old) => {
    refreshList();
  });
</script>
