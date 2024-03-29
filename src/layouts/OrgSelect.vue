<template>
  <dialog-org-form v-model="showCreateDialog"></dialog-org-form>
  <q-select
    ref="search"
    v-model="currentOrg"
    dense
    dark
    color="text-white"
    standout="bg-white text-black"
    emit-value
    map-options
    label="选择组织"
    :options="userOrgOptions"
    :behavior="behavior"
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

    <template #append>
      <q-icon name="add" @click.stop.prevent="showCreateDialog = true" />
    </template>

    <template #option="scope">
      <q-item v-bind="scope.itemProps" class="tw-text-white">
        <q-item-section>
          <q-item-label v-html="scope.opt.label" />
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
  import { PropType, computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import DialogOrgForm from '@/components/DialogOrgForm.vue';
  import { useStore } from '@/store/index';

  defineProps({
    behavior: {
      type: String as PropType<'default' | 'dialog'>,
      default: 'default',
    },
  });

  const store = useStore();

  // org 逻辑
  const userOrgOptions = ref<{ label: string; value: string }[]>([]);
  async function reloadOrgOptions(
    input: string,
    done: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void,
  ) {
    const tmp: { label: string; value: string }[] = [
      {
        label: '通用',
        value: 'baseorg',
      },
    ];
    store.state.Root.userOrgs?.forEach((v, k, a) => {
      if (v.id === 'baseorg') {
        return;
      }
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

      if (currentOrg.value) {
        store.dispatch('switchOrg', val);
      } else {
        store.commit('setCurrentOrg', val);
      }

      localStorage.setItem('gc_choosed_org', val);
    },
  });

  onMounted(() => {
    if (!currentOrg.value) {
      const route = useRoute();
      currentOrg.value = (route.params.orgId as string) || 'baseorg';
      store.commit('setCurrentOrg', currentOrg.value);
    }
  });

  // create logic
  const showCreateDialog = ref(false);
</script>
