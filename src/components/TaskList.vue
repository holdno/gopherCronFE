<template>
	<div class="q-pa-xs tw-max-w-sm">
		<q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
			<template v-slot:append>
				<q-icon name="search" />
			</template>
		</q-input>
		<q-list class="tw-w-full">
			<q-item
				class="tw-w-full"
				v-for="task in tasks"
				:key="task.id"
				:to="{ name: 'task', params: { taskId: task.id } }"
			>
				<q-card class="tw-w-full">
					<q-card-section class="text-center">
						<strong>{{ task.name }}</strong>
					</q-card-section>
					<q-separator />
					<q-card-section class="tw-flex tw-flex-center tw-flew-row">
						<div class="tw-basis-1/2">{{ task.cronExpr }}</div>
						<q-spinner-gears class="tw-basis-1/4" v-if="task.isRunning !== 0" />
						<q-icon class="tw-basis-1/4" name="done_all" v-if="task.isRunning === 0" />
					</q-card-section>
				</q-card>
			</q-item>
		</q-list>
	</div>
</template>

<script setup lang='ts'>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from '../store';
import { Task } from '../request';

const props = defineProps({
	projectId: {
		type: Number,
		required: true,
	},
})

const store = useStore()
watchEffect(() => {
	store.dispatch("fetchTasks", { ...props })
})

const filter = ref('')
const tasks = computed(
	() => store.state.tasks.filter(
		(t: Task) => (
			t.name.indexOf(filter.value) >= 0
			|| t.id.toString().indexOf(filter.value) >= 0
		)
	)
)
</script>