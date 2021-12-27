<template>
	<q-form class="q-pa-md tw-w-full">
		<q-input :model-value="task ? task.id : ''" disable label="任务 ID" />
		<q-input :model-value="project ? project.title : ''" disable label="所属项目" />
		<q-input v-model="editable.name" label="任务名称 (如果修改则为创建任务,原任务不变)" />
		<q-input v-model="editable.cronExpr" label="调度计划 (*秒 *分 *时 *日 *月 *周 *年)" />
		<q-input v-model="editable.timeout" type="number" label="超时时间 (单位:秒 s 0则不限制)" />
		<q-input v-model="editable.command" type="textarea" label="执行指令" />
		<q-input v-model="editable.remark" type="textarea" label="任务备注" autogrow />
	</q-form>
</template>

<script setup lang='ts'>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from '../store';

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
})

const store = useStore()
const task = computed(
	() => store.state.tasks.find(
		(t) => t.id === props.id
	)
)
const project = computed(
	() => store.state.projects.find(
		(p) => p.id === task.value?.projectId
	)
)
const editable = ref(Object.assign({}, task.value))
watchEffect(() => {
	editable.value = Object.assign({}, task.value)
})
</script>