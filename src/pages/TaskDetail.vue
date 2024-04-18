<template>
  <div class="tw-px-4 tw-pt-2 tw-w-full tw-h-full tw-flex tw-flex-col">
    <div class="tw-text-[#7e7e7e] tw-mb-4">
      <div
        class="tw-flex tw-items-center tw-justify-start tw-gap-4 tw-text-lg tw-mb-4"
      >
        <span>
          <q-icon name="folder" />
          {{ project?.title }}
        </span>
        <span>
          ID:
          {{ projectId }}
        </span>
      </div>
      <div v-if="project && project.remark.trim() !== ''" class="tw-pb-4">
        {{ project.remark }}
      </div>
      <div class="tw-flex tw-gap-2 tw-items-center">
        <q-icon name="hive" />
        在线节点:
        <span
          class="tw-font-extrabold"
          :class="{
            'tw-text-primary': projectClients && projectClients.length > 0,
            'tw-text-red-500': !projectClients || projectClients.length === 0,
          }"
          >{{ projectClients?.length || 0 }}</span
        >
        <span
          v-show="projectClients && projectClients.length > 0"
          class="tw-text-white tw-cursor-pointer"
          @click="showOnlineNodes"
          >查看节点</span
        >
      </div>
    </div>
    <q-tabs
      v-if="!isCreateMode"
      :model-value="tab"
      active-color="primary"
      align="left"
      class="lg:tw-hidden tw-display"
    >
      <q-route-tab
        name="detail"
        label="详情"
        :to="{ name: `${props.type}_task`, params: { taskId: props.id } }"
        replace
      />
      <q-route-tab
        name="logs"
        label="日志"
        :to="{ name: `${props.type}_task_logs`, params: { taskId: props.id } }"
        replace
      />
    </q-tabs>
    <div class="tw-flex tw-w-full tw-grow">
      <div class="tw-h-full tw-w-full tw-flex tw-flex-col">
        <q-scroll-area
          ref="scroll"
          class="tw-grow"
          :thumb-style="thumbStyle"
          :bar-style="barStyle"
        >
          <q-tab-panels
            :model-value="tab"
            animated
            :vertical="width >= 1024"
            class="tw-w-full tw-h-full tw-bg-[#121212] tw-p-0 lg:tw-pr-4"
          >
            <q-tab-panel name="detail" class="tw-px-0">
              <TaskDetail
                v-if="props.type === 'crontab'"
                :id="props.id"
                :project-id="props.projectId"
              />
              <WorkFlowTaskDetail
                v-else-if="props.type === 'workflow'"
                :id="props.id"
                :project-id="props.projectId"
              />
              <TemporaryTaskDetail
                v-if="props.type === 'temporary'"
                :id="Number(props.id)"
                :project-id="props.projectId"
              />
            </q-tab-panel>
            <q-tab-panel name="logs" class="tw-px-0">
              <TaskLogs
                :id="props.id"
                :project-id="props.projectId"
                @onpage="pageChange"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-scroll-area>
      </div>
      <div v-if="props.type != 'temporary'" class="tw-hidden lg:tw-block">
        <q-tabs
          v-if="!isCreateMode"
          :model-value="tab"
          active-color="primary"
          vertical
          switch-indicator
          align="left"
        >
          <q-route-tab
            name="detail"
            label="详情"
            :to="{ name: `${props.type}_task`, params: { taskId: props.id } }"
            replace
          />
          <q-route-tab
            name="logs"
            label="日志"
            :to="{
              name: `${props.type}_task_logs`,
              params: { taskId: props.id },
            }"
            replace
          />
        </q-tabs>
      </div>
    </div>
  </div>
  <q-dialog v-model="displayNodes">
    <q-card class="tw-w-full">
      <q-card-section>
        <div class="text-h6">节点列表</div>
        <div class="text-base">仅 v2.4.6 及以上版本支持权重变更</div>
      </q-card-section>

      <q-card-section
        class="tw-q-pt-none scroll tw-flex tw-items-center tw-justify-center tw-align-middle tw-gap-2 tw-flex-wrap"
        style="max-height: 60vh"
      >
        <template v-for="item in projectClients" :key="item.clientIP">
          <div class="md:tw-w-[48%] tw-w-full">
            <ClientNode
              :client-ip="item.clientIP"
              :weight="item.weight"
              :project-id="projectId"
              :version="item.version"
            ></ClientNode>
          </div>
        </template>
      </q-card-section>

      <q-card-actions align="right" class="text-teal">
        <q-btn v-close-popup="true" flat label="OK" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { QScrollArea } from 'quasar';
  import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useWindowSize } from 'vue-window-size';

  import ClientNode from '@/components/ClientNode.vue';
  import TaskDetail from '@/components/TaskDetail.vue';
  import TaskLogs from '@/components/TaskLogs.vue';
  import TemporaryTaskDetail from '@/components/TemporaryTaskDetail.vue';
  import WorkFlowTaskDetail from '@/components/WorkFlowTaskDetail.vue';
  import { useStore } from '@/store/index';
  import { barStyle, thumbStyle } from '@/utils/thumbStyle';

  const props = defineProps({
    id: {
      type: String,
      default: '',
    },
    projectId: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      default: 'crontab',
    },
  });

  // const $q = useQuasar();
  const displayNodes = ref(false);
  function showOnlineNodes() {
    displayNodes.value = true;
  }

  const store = useStore();
  const project = computed(() =>
    store.state.Project.projects.find((p) => p.id === props.projectId),
  );

  const route = useRoute();
  const scroll = ref<QScrollArea>();
  const pageChange = () => {
    nextTick(() => {
      scroll.value?.setScrollPosition('vertical', 0);
    });
  };

  const isCreateMode = computed(
    () => route.name && route.name.toString() === `create_${props.type}_task`,
  );
  const tab = computed(() => {
    if (isCreateMode.value) {
      return 'detail';
    }
    if (route.name) {
      const routeName = route.name.toString();
      if (routeName === `${props.type}_task_logs`) return 'logs';
      else if (routeName === `${props.type}_task`) return 'detail';
    }
    throw new Error(`Unknown route name ${route.name?.toString()}`);
  });

  const { width } = useWindowSize();

  async function loadOnlineNodes() {
    await store.dispatch('Project/fetchProjectClients', {
      projectId: props.projectId,
    });
  }
  onMounted(() => {
    loadOnlineNodes();
  });
  onUnmounted(() => {
    store.commit('Project/setProjectClients', { clients: [] });
  });
  const projectClients = computed(() =>
    store.state.Project.projectClients.get(props.projectId),
  );
</script>
