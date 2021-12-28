import axios, { AxiosInstance } from 'axios';
import { App, inject, InjectionKey } from 'vue';

export const apiv1 = axios.create({
  baseURL: import.meta.env.VITE_API_V1_BASE_URL,
});

export const keyApiv1: InjectionKey<AxiosInstance> = Symbol(
  'ApiV1 Axio Instance',
);

export function installApiv1(app: App) {
  app.provide(keyApiv1, apiv1);
  app.config.globalProperties.$apiv1 = apiv1;
}

export function useApiv1(): AxiosInstance {
  const obj = inject(keyApiv1);
  if (obj === undefined) {
    throw new Error('Axios Instance Not Found');
  }
  return obj;
}

export interface User {
  id: number;
  name: string;
  permissions: string[];
}

export async function login(
  api: AxiosInstance,
  account: string,
  password: string,
): Promise<[User, string]> {
  const resp = await api.post('/user/login', {
    account: account,
    password: password,
  });
  const data = resp.data;
  if (data.meta.code === 0) {
    const r = data.response;
    return [
      { id: r.id, name: r.name, permissions: r.permission.split(',') },
      r.token,
    ];
  } else {
    throw new Error(data.meta.msg);
  }
}

export async function userInfo(api: AxiosInstance): Promise<User> {
  const resp = await api.get('/user/info');
  const data = resp.data;
  if (data.meta.code === 0) {
    const r = data.response;
    return { id: r.id, name: r.name, permissions: r.permission.split(',') };
  } else {
    throw new Error(data.meta.msg);
  }
}

export interface Project {
  id: number;
  remark: string;
  taskCount: number;
  title: string;
  uid: number;
}

export async function projectList(api: AxiosInstance): Promise<Project[]> {
  const resp = await api.get('/project/list');
  const data = resp.data;
  if (data.meta.code === 0) {
    const r = data.response;
    return r.list.map((p: any) => ({
      id: p.project_id,
      remark: p.remark,
      taskCount: p.task_count,
      title: p.title,
      uid: p.uid,
    }));
  } else {
    throw new Error(data.meta.msg);
  }
}

export interface Task {
  id: string;
  name: string;
  projectId: number;
  command: string;
  cronExpr: string;
  remark: string;
  timeout: number;
  createTime: number;
  status: number;
  isRunning: number;
  noseize: number;
  exclusion: number;
  clientIp: string;
  tmpId: string;
}

export async function taskList(
  api: AxiosInstance,
  projectId: number,
): Promise<Task[]> {
  const resp = await api.get('/crontab/list', {
    params: {
      project_id: projectId,
    },
  });
  const data = resp.data;
  if (data.meta.code === 0) {
    const r = data.response;
    return r.list.map((v: any) => ({
      id: v.task_id,
      name: v.name,
      projectId: v.project_id,
      command: v.command,
      cronExpr: v.cron,
      remark: v.remark,
      timeout: v.timeout,
      createTime: v.create_time,
      status: v.status,
      isRunning: v.is_running,
      noseize: v.noseize,
      exclusion: v.exclusion,
      clientIp: v.client_ip,
      tmpId: v.tmp_id,
    }));
  } else {
    throw new Error(data.meta.msg);
  }
}

export async function saveTask(api: AxiosInstance, task: Task) {
  const payload = JSON.stringify({
    project_id: task.projectId,
    task_id: task.id,
    name: task.name,
    command: task.command,
    cron: task.cronExpr,
    remark: task.remark,
    timeout: task.timeout,
    status: task.status,
    noseize: task.noseize,
    exclusion: task.exclusion,
  });
  const resp = await api.post('/crontab/save', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
  const data = resp.data;
  if (data.meta.code !== 0) {
    throw new Error(data.meta.msg);
  } else {
    const v = data.response;
    return {
      id: v.task_id,
      name: v.name,
      projectId: v.project_id,
      command: v.command,
      cronExpr: v.cron,
      remark: v.remark,
      timout: v.timout,
      createTime: v.create_time,
      status: v.status,
      isRunning: v.is_running,
      noseize: v.noseize,
      exclusion: v.exclusion,
      clientIp: v.client_ip,
      tmpId: v.tmp_id,
    };
  }
}
