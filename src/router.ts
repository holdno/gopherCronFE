const routes = [
	{
		path: '/',
		redirect: "summary",
		component: () => import('./layouts/Landing.vue'),
		meta: { requiresAuth: true },
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
	},
	{
		path: "/login",
		component: () => import("./pages/Login.vue"),
	},
	{
		path: "/logout",
		redirect: "/login",
	},
]

import { createWebHistory, createRouter } from "vue-router"
import { store } from "./store"

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