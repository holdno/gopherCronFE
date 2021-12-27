import { createWebHistory, createRouter, RouteLocationNormalizedLoaded } from "vue-router"
import { store } from "./store"

const routes = [
	{
		path: '/',
		redirect: "summary",
		component: () => import('./layouts/LandingLayout.vue'),
		meta: { requiresAuth: true },
		children: [
			{
				name: 'summary',
				path: 'summary',
				component: () => import('./pages/SummaryPage.vue'),
			},
			{
				name: 'projects',
				path: 'project',
				component: () => import('./pages/ProjectList.vue'),
				children: [
					{
						name: 'project',
						path: ':projectId(\\d+)/task',
						component: () => import('./pages/TaskList.vue'),
						props: (route: RouteLocationNormalizedLoaded) => ({ projectId: Number(route.params.projectId) }),
						children: [
							{
								name: 'task',
								path: ':taskId',
								component: () => import('./pages/TaskDetail.vue'),
								props: (route: RouteLocationNormalizedLoaded) => ({ id: route.params.taskId }),
							}
						]
					},
				],
			},
			{
				name: 'taskflow',
				path: 'taskflow',
				component: () => import('./pages/TaskflowList.vue'),
			}
		]
	},
	{
		name: "login",
		path: "/login",
		component: () => import("./pages/Login.vue"),
	},
	{
		name: "logout",
		path: "/logout",
		redirect: "/login",
	},
]

const Router = createRouter({
	history: createWebHistory(),
	routes,
})

Router.beforeEach(async (to, from) => {
	await store.dispatch("checkLogin")

	if (to.meta.requiresAuth && !store.state.logined) {
		// 此路由需要授权，请检查是否已登录
		// 如果没有，则重定向到登录页面
		return {
			path: '/login',
			// 保存我们所在的位置，以便以后再来
			query: { redirect: to.fullPath },
		}
	}
})

export default Router