<template>
  <DialogProjectDeleteConfirm
    v-model="showDeleteConfirm"
    :project-id="props.projectId"
  />
  <DialogProjectForm
    v-model="showEditDialog"
    :project-id="props.projectId"
    :org-id="orgId"
  />
  <DialogProjectUsersManage
    v-model="showUsersManageDialog"
    :project-id="props.projectId"
  />
  <DialogProjectWebhookManage
    v-model="showWebhookManageDialog"
    :project-id="props.projectId"
  />
  <DialogProjectUsersManage></DialogProjectUsersManage>
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
        @click.stop="showWebhookManageDialog = true"
      >
        <q-item-section>
          <q-item-label>Webhook</q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        v-close-popup
        clickable
        class="hover:tw-bg-primary hover:tw-text-black"
        @click.stop="showProjectToken"
      >
        <q-item-section>
          <q-item-label>项目token</q-item-label>
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

  <q-dialog v-model="showProjectTokenDialog">
    <q-card class="tw-w-[400px] tw-max-w-full">
      <q-card-section>
        <div class="text-h6">项目 Token</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-skeleton v-if="showProjectTokenLoading" type="rect" />
        <q-input v-else v-model="projectToken" dark borderless :readonly="true">
          <template v-slot:append>
            <q-icon
              name="file_copy"
              class="tw-cursor-pointer"
              @click="copyToken"
            />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-if="!showReGenButton"
          v-close-popup
          flat
          label="重置"
          color="warning"
          @click="showReGenButton = true"
        />
        <q-btn
          v-if="showReGenButton"
          flat
          label="我确定重置"
          color="red"
          :loading="reGenLoading"
          @click="requestReGenProjectToken"
        />
        <q-btn v-close-popup flat label="关闭" color="primary" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
  import { copyToClipboard } from 'quasar';
  import { ref } from 'vue';

  import DialogProjectDeleteConfirm from './DialogProjectDeleteConfirm.vue';
  import DialogProjectForm from './DialogProjectForm.vue';
  import DialogProjectUsersManage from './DialogProjectUsersManage.vue';
  import DialogProjectWebhookManage from './DialogProjectWebhookManage.vue';

  import { getProjectToken, reGenProjectToken } from '@/api/project';
  import { useStore } from '@/store/index';

  const show = ref(false);
  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
    orgId: {
      type: String,
      required: true,
    },
  });

  const store = useStore();

  const showDeleteConfirm = ref(false);
  const showEditDialog = ref(false);
  const showUsersManageDialog = ref(false);
  const showWebhookManageDialog = ref(false);

  const showProjectTokenDialog = ref(false);
  const showProjectTokenLoading = ref(false);
  const projectToken = ref('');
  const showReGenButton = ref(false);
  async function showProjectToken() {
    showReGenButton.value = false;
    projectToken.value = '';
    showProjectTokenDialog.value = true;
    showProjectTokenLoading.value = true;
    try {
      const token = await getProjectToken(props.projectId);
      projectToken.value = token;
    } catch (e: any) {
      console.error(e);
    }
    showProjectTokenLoading.value = false;
  }

  function copyToken() {
    copyToClipboard(projectToken.value).then(() => {
      store.commit('success', {
        message: 'token已复制',
      });
    });
  }

  // 重新生成项目token的逻辑
  const reGenLoading = ref(false);
  async function requestReGenProjectToken() {
    reGenLoading.value = true;
    try {
      projectToken.value = await reGenProjectToken(props.projectId);
    } catch (e: any) {
      console.error(e);
    }
    reGenLoading.value = false;
    showReGenButton.value = false;
  }
</script>
