import axios, { AxiosInstance } from "axios"
import { App, inject, InjectionKey } from "vue"

export const apiv1 = axios.create({
	baseURL: import.meta.env.VITE_API_V1_BASE_URL,
})

export const keyApiv1: InjectionKey<AxiosInstance> = Symbol()

export function installApiv1(app: App) {
	app.provide(keyApiv1, apiv1)
	app.config.globalProperties.$apiv1 = apiv1
}

export function useApiv1(): AxiosInstance {
	const obj = inject(keyApiv1)
	if (obj === undefined) {
		throw new Error("Axios Instance Not Found")
	}
	return obj
}

export interface User {
	id: number,
	name: string,
	permissions: string[],
}

export async function login(api: AxiosInstance, account: string, password: string): Promise<[User, string]> {
	const resp = await api.post('/user/login', {
		account: account,
		password: password
	})
	const data = resp.data
	if (data.meta.code == 0) {
		const r = data.response
		return [{ id: r.id, name: r.name, permissions: r.permission.split(',') }, r.token]
	} else {
		throw new Error(data.meta.msg);
	}
}

export async function userInfo(api: AxiosInstance): Promise<User> {
	const resp = await api.get("/user/info")
	const data = resp.data
	if (data.meta.code == 0) {
		const r = data.response
		return { id: r.id, name: r.name, permissions: r.permission.split(',') }
	} else {
		throw new Error(data.meta.msg);
	}
}