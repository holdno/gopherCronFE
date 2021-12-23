const routes = [
	{
		path: '/',
		redirect: "summary",
		component: () => import('./layouts/Landing.vue'),
		children: [
			{
				path: 'summary',
				component: () => import('./pages/Summary.vue'),
			},
			{
				path: 'projects',
				component: () => import('./pages/ProjectList.vue'),
			},
			{
				path: 'taskflows',
				component: () => import('./pages/TaskflowList.vue'),
			}
		]
	}
]

import { createWebHistory, createRouter } from "vue-router"

export default createRouter({
	history: createWebHistory(),
	routes,
})