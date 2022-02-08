<template>
  <DialogProjectDeleteConfirm
    v-model="showDeleteConfirm"
    :project-id="props.projectId"
  />
  <DialogProjectForm v-model="showEditDialog" :project-id="props.projectId" />
  <DialogProjectUsersManage
    v-model="showUsersManageDialog"
    :project-id="props.projectId"
  />
  <q-btn-dropdown
    v-model="show"
    flat
    dropdown-icon="more_horiz"
    no-icon-animation
  >
    <q-list dense>
      <q-item
        v-close-popup
        clickable
        class="hover:tw-bg-primary hover:tw-text-black"
        @click.stop="showEditDialog = true"
      >
        <q-item-section>
          <q-item-label>编辑</q-item-label>
        </q-item-section>
      </q-item>
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

  import DialogProjectDeleteConfirm from './DialogProjectDeleteConfirm.vue';
  import DialogProjectForm from './DialogProjectForm.vue';
  import DialogProjectUsersManage from './DialogProjectUsersManage.vue';

  const show = ref(false);
  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
  });

  const showDeleteConfirm = ref(false);
  const showEditDialog = ref(false);
  const showUsersManageDialog = ref(false);
</script>
