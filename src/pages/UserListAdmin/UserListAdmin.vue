<template>
  <div class="tw-w-full tw-p-4">
    <div class="q-dark tw-w-full tw-rounded tw-overflow-hidden">
      <div class="tw-px-4 tw-py-4">
        <div class="tw-flex tw-items-center tw-justify-between">
          <p
            tabindex="0"
            class="focus:tw-outline-none tw-text-base sm:tw-text-lg md:tw-text-xl lg:tw-text-2xl tw-font-bold tw-leading-normal tw-text-primary"
          >
            用户管理
          </p>
          <div class="tw-mt-0">
            <q-btn
              flat
              class="tw-text-white"
              icon="add"
              @click="showCreate = true"
            ></q-btn>
          </div>
        </div>
      </div>
      <div class="q-dark tw-px-4 tw-pb-5 tw-min-h-50 tw-relative">
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
        <q-inner-loading size="md" :showing="loading"></q-inner-loading>
      </div>
      <div class="q-pa-lg flex flex-center">
        <q-pagination
          v-model="page"
          color="grey-4"
          active-color="black"
          :max="totalPage"
          :boundary-numbers="false"
        />
      </div>
      <ModifyBox v-model="showCreate" @modify="refreshList"></ModifyBox>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';

  import ModifyBox from './ModifyBox.vue';
  import UserItem from './UserListItem.vue';

  import { useStore } from '@/store/index';

  const props = defineProps({
    orgId: {
      type: String,
      required: true,
    },
  });

  const page = ref(1);
  const pagesize = ref(10);
  const showCreate = ref(false);
  const store = useStore();

  const userList = computed(() => {
    return store.state.Root.users;
  });
  const totalPage = computed((): number => {
    const total = store.state.Root.userTotal || 0;
    return Math.ceil(total / pagesize.value);
  });

  const loading = ref(false);
  const refreshList = async () => {
    loading.value = true;
    try {
      await store.dispatch('fetchUsers', {
        oid: props.orgId,
        page: page.value,
        pagesize: pagesize.value,
      });
    } catch (e) {
      console.log(e);
    }
    loading.value = false;
  };

  refreshList();
  watch(page, (now, old) => {
    refreshList();
  });
</script>
