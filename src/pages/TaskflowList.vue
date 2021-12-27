<template>
  <q-page padding>
    <p>Taskflow List</p>
    <TaskFlow :tasks="tasks" />
  </q-page>
</template>

<script setup lang="ts">
  import TaskFlow from '../components/TaskFlow.vue';
  import { Task } from '../types';

  const tasks: Task[] = [
    { id: 'A' },
    { id: 'B' },
    { id: 'C', deps: ['A', 'B'] },
    { id: 'D' },
    { id: 'E', deps: ['C', 'D'] },
    { id: 'F', deps: ['A', 'D'] },
  ];
</script>
