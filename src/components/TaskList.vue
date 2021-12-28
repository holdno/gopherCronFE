<template>
  <div class="q-pa-xs">
    <q-input
      v-model="filter"
      borderless
      dense
      debounce="300"
      placeholder="Search"
    >
      <template #append>
        <q-icon name="search" />
      </template>
    </q-input>
    <q-list class="tw-w-full">
      <q-item
        v-for="task in tasks"
        :key="task.id"
        class="tw-w-full"
        :to="{ name: 'task', params: { taskId: task.id } }"
      >
        <q-card class="tw-w-full">
          <q-card-section class="text-center">
            <strong>{{ task.name }}</strong>
          </q-card-section>
          <q-separator />
          <q-card-section class="tw-flex tw-justify-around">
            <div>
              {{ task.cronExpr }}
            </div>
            <q-spinner-gears v-if="task.isRunning !== 0" />
            <q-icon v-if="task.isRunning === 0" name="done_all" />
          </q-card-section>
        </q-card>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watchEffect } from 'vue';
  import { useStore } from '../store';
  import { Task } from '../request';

  const props = defineProps({
    projectId: {
      type: Number,
      required: true,
    },
  });

  const store = useStore();
  watchEffect(() => {
    store.dispatch('fetchTasks', { ...props });
  });

  const filter = ref('');
  const tasks = computed(() =>
    store.state.tasks.filter(
      (t: Task) =>
        t.name.indexOf(filter.value) >= 0 ||
        t.id.toString().indexOf(filter.value) >= 0,
    ),
  );
</script>
