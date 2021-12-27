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
				v-for="project in projects"
				:key="project.id"
				:to="{ name: 'project', params: { projectId: project.id } }"
			>
				<div class="tw-w-full">
					<q-card>
						<q-card-section class="text-center">
							<strong>{{ project.title }}</strong>
						</q-card-section>
					</q-card>
				</div>
			</q-item>
		</q-list>
	</div>
</template>

<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue';
import { Project } from '../request';
import { useStore } from '../store';

const store = useStore()
onMounted(() => store.dispatch("fetchProjects"))

const filter = ref("")
const projects = computed(
	() => store.state.projects.filter(
		(p: Project) => (
			p.title.indexOf(filter.value) >= 0
			|| p.id.toString().indexOf(filter.value) >= 0
		)
	)
)

</script>