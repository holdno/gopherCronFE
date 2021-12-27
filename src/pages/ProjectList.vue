<template>
	<div class="q-pa-md tw-flex tw-flex-row tw-w-full tw-max-h-screen">
		<div class="tw-basis-1/6 tw-h-full">
			<ProjectList />
		</div>
		<router-view />
	</div>
</template>

<script setup lang='ts'>
import { useStore } from '../store';
import ProjectList from '../components/ProjectList.vue'
import { onBeforeMount } from 'vue';

const store = useStore()
onBeforeMount(
	() =>
		store.commit("setTasks", { tasks: [] })
)
</script>