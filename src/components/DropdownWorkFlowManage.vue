<template>
  <DialogWorkFlowDeleteConfirm
    v-model="showDeleteConfirm"
    :workflow-id="props.workflowId"
  />
  <DialogWorkFlowUsersManage
    v-model="showUsersManageDialog"
    :workflow-id="props.workflowId"
  />
  <q-btn-dropdown
    v-model="show"
    dense
    flat
    dropdown-icon="more_horiz"
    no-icon-animation
    @click.stop.prevent
  >
    <q-list dense>
      <q-item
        v-close-popup
        clickable
        class="hover:tw-bg-primary hover:tw-text-black"
        @click.stop="showUsersManageDialog = true"
      >
        <q-item-section>
          <q-item-label>人员管理</q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        v-close-popup
        clickable
        class="hover:tw-bg-primary hover:tw-text-black"
        @click.stop="showDeleteConfirm = true"
      >
        <q-item-section>
          <q-item-label>删除</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  import DialogWorkFlowDeleteConfirm from './DialogWorkFlowDeleteConfirm.vue';
  import DialogWorkFlowUsersManage from './DialogWorkFlowUsersManage.vue';

  const show = ref(false);
  const props = defineProps({
    workflowId: {
      type: Number,
      required: true,
    },
  });

  const showDeleteConfirm = ref(false);
  const showUsersManageDialog = ref(false);
</script>
