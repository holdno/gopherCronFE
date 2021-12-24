import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'
import Cookies from 'js-cookie'

import { login, User, userInfo } from './request'
import { AxiosInstance } from 'axios'
// 为 store state 声明类型
export interface State {
	logined: boolean,
	user?: User,
	token?: string,
	apiv1?: AxiosInstance,
}

// 定义 injection key
export const key: InjectionKey<Store<State>> = Symbol()

// 创建一个新的 store 实例
export const COOKIE_TOKEN = "access-token"
export const store = createStore<State>({
	devtools: import.meta.env.DEV,
	strict: import.meta.env.DEV,
	state() {
		return {
			logined: false
		}
	},
	getters: {
		apiv1(state): AxiosInstance {
			const api = state.apiv1
			if (api === undefined) {
				throw new Error("Api V1 instance not found");
			}
			return api
		}
	},
	mutations: {
		setApi(state, { apiv1 }) {
			state.apiv1 = apiv1;
		},
		authed(state, { user, token }) {
			state.user = user
			state.token = token
			state.logined = true
			Cookies.set(COOKIE_TOKEN, token, { expires: 7 })
			const api = state.apiv1;
			if (api)
				api.defaults.headers.common[COOKIE_TOKEN] = token
		},
		unauthed(state) {
			state.user = undefined
			state.token = undefined
			state.logined = false
			Cookies.remove(COOKIE_TOKEN)
			const api = state.apiv1;
			if (api)
				delete api.defaults.headers.common[COOKIE_TOKEN]
		}
	},
	actions: {
		async checkLogin({ commit }) {
			const token = Cookies.get(COOKIE_TOKEN)
			if (token === undefined) {
				commit("unauthed")
				return
			}
			try {
				const api = this.getters.apiv1;
				api.defaults.headers.common[COOKIE_TOKEN] = token
				const user = await userInfo(api)
				commit("authed", { user, token })
			} catch {
				commit("unauthed")
			}
		},
		async login({ commit }, { username, password }) {
			const api = this.getters.apiv1;
			const [user, token] = await login(api, username, password)
			commit("authed", { user, token })
		}
	}
})

// 定义自己的 `useStore` 组合式函数
export function useStore() {
	return baseUseStore(key)
}

