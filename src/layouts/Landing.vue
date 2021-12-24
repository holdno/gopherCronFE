<template>
	<q-layout
		view="hHh Lpr lff"
		style="height: 100%"
		class="shadow-2 rounded-borders tw-flex tw-flex-no-wrap"
	>
		<q-header elevated class="bg-black">
			<q-toolbar>
				<q-btn flat @click="drawer = !drawer" round dense icon="menu" />
				<q-toolbar-title>GopherCron</q-toolbar-title>
			</q-toolbar>
		</q-header>

		<q-drawer
			v-model="drawer"
			show-if-above
			:mini="miniState"
			@mouseover="miniState = false"
			@mouseout="miniState = true"
			:width="200"
			:breakpoint="500"
			bordered
			class="bg-grey-3"
		>
			<q-scroll-area class="fit">
				<q-list padding>
					<q-item clickable v-ripple to="summary">
						<q-item-section avatar>
							<q-icon name="timeline" />
						</q-item-section>

						<q-item-section>Overview</q-item-section>
					</q-item>

					<q-item clickable v-ripple to="projects">
						<q-item-section avatar>
							<q-icon name="view_list" />
						</q-item-section>

						<q-item-section>Projects</q-item-section>
					</q-item>

					<q-item clickable v-ripple to="taskflows">
						<q-item-section avatar>
							<q-icon name="mediation" />
						</q-item-section>

						<q-item-section>Taskflows</q-item-section>
					</q-item>

					<q-separator />

					<q-item clickable v-ripple to="logout">
						<q-item-section avatar>
							<q-icon name="logout" />
						</q-item-section>

						<q-item-section>Logout</q-item-section>
					</q-item>
				</q-list>
			</q-scroll-area>
		</q-drawer>

		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<script lang='ts'>
import { defineComponent, ref } from 'vue'
const Component = defineComponent({
	setup() {
		return {
			drawer: ref(false),
			miniState: ref(true)
		}
	}
})
export default Component
</script>