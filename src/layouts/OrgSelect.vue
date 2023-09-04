<template>
  <q-select
    ref="search"
    v-model="currentOrg"
    dense
    dark
    color="text-white"
    standout="bg-white text-black"
    emit-value
    map-options
    class="tw-ml-4"
    label="选择组织"
    :options="userOrgOptions"
    style="width: 300px"
    @filter="reloadOrgOptions"
  >
    <template #no-option>
      <q-item>
        <q-item-section>
          <div class="text-center">
            <q-spinner-pie color="grey-5" size="24px" />
          </div>
        </q-item-section>
      </q-item>
    </template>

    <template #option="scope">
      <q-item v-bind="scope.itemProps" class="tw-text-white">
        <q-item-section>
          <q-item-label class="" v-html="scope.opt.label" />
        </q-item-section>
        <q-item-section side :class="{ 'default-type': !scope.opt.type }">
          <q-btn
            outline
            dense
            no-caps
            text-color="grey-5"
            size="12px"
            class="tw-bg-white q-px-sm"
          >
            {{ scope.opt.type || '切换' }}
            <q-icon name="subdirectory_arrow_left" size="14px" />
          </q-btn>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts" setup>
  import { QSelect } from 'quasar';
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import { useStore } from '@/store/index';

  const store = useStore();

  // org 逻辑
  const userOrgOptions = ref<{ label: string; value: string }[]>([]);
  async function reloadOrgOptions(
    input: string,
    done: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void,
  ) {
    const tmp: { label: string; value: string }[] = [];
    store.state.Root.userOrgs?.forEach((v, k, a) => {
      tmp.push({
        label: v.title,
        value: v.id,
      });
    });
    userOrgOptions.value = tmp;

    done(() => {
      console.log('select done');
    });
  }

  reloadOrgOptions('', () => {});

  const currentOrg = computed({
    get: () => {
      return store.state.Root.currentOrg;
    },
    set: (val) => {
      if (!val) {
        return;
      }

      store.dispatch('switchOrg', val);
    },
  });

  onMounted(() => {
    if (store.getters.currentUser && !currentOrg.value) {
      const route = useRoute();
      console.log('set current org');
      currentOrg.value = route.params.orgid as string;
    }
  });
</script>
