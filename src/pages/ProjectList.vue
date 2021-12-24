<template>
	<q-page padding>
		<q-table title="项目列表" :rows="projects" :columns="columns" row-key="id" grid />
	</q-page>
</template>

<script setup lang='ts'>
import { computed, onMounted } from 'vue';
import { useStore } from '../store';

const store = useStore()
onMounted(() => store.dispatch("fetchProjects"))

const projects = computed(() => store.state.projects)
const columns = [
	{
		name: "id",
		field: "id",
		required: true,
		label: "ID",
		sortable: true,
	},
	{
		name: "title",
		field: "title",
		required: true,
		label: "项目名",
		sortable: true,
	},
	{
		name: "taskCount",
		field: "taskCount",
		required: true,
		label: "任务数",
		sortable: true,
	}
]
</script>