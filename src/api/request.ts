import axios, { AxiosError, AxiosInstance } from 'axios';
import { App, inject, InjectionKey } from 'vue';
import { Store } from 'vuex';
import { State, ErrHandled } from '@/store';

export const apiv1 = axios.create({
  baseURL: import.meta.env.VITE_API_V1_BASE_URL,
});

export const keyApiv1: InjectionKey<AxiosInstance> = Symbol(
  'ApiV1 Axio Instance',
);

export interface Meta {
  code: number;
  message: string;
}

export function installApiv1(app: App, { store }: { store: Store<State> }) {
  app.provide(keyApiv1, apiv1);
  app.config.globalProperties.$apiv1 = apiv1;
  apiv1.interceptors.response.use(
    function (response) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      const data = response.data;
      if (data.meta.code !== 0) {
        const e = new Error(data.meta.msg);
        store.commit('error', { error: e });
        throw ErrHandled;
      }
      return response;
    },
    function (error: AxiosError) {
      let e = new Error(error.message);
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      if (!error.response) {
        e = new Error('网络错误，请稍后再试');
      } else {
        switch (error.response.status) {
          case 401:
            store.commit('unauthed');
            break;
          default:
        }
        try {
          e = new Error(error.response.data.meta.msg || '请求失败，请稍后再试');
        } catch (_) {
          e = new Error(error.message);
        }
      }
      store.commit('error', { error: e });
      throw ErrHandled;
    },
  );
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
  account: string;
  permissions: string[];
  createTime: number;
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
  const r = data.response;
  return [
    {
      id: r.id,
      name: r.name,
      account: r.account,
      permissions: r.permission.split(','),
      createTime: r.create_time,
    },
    r.token,
  ];
}

export async function userInfo(api: AxiosInstance): Promise<User> {
  const resp = await api.get('/user/info');
  const data = resp.data;
  const r = data.response;
  return {
    id: r.id,
    name: r.name,
    account: r.account,
    permissions: r.permission.split(','),
    createTime: r.createTime,
  };
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
  const r = data.response;
  return r.list.map((p: any) => ({
    id: p.project_id,
    remark: p.remark,
    taskCount: p.task_count,
    title: p.title,
    uid: p.uid,
  }));
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

export async function fetchTasks(
  api: AxiosInstance,
  projectId: number,
): Promise<Task[]> {
  const resp = await api.get('/crontab/list', {
    params: {
      project_id: projectId,
    },
  });
  const data = resp.data;
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

export async function startTask(
  api: AxiosInstance,
  projectId: number,
  taskId: string,
) {
  const payload = JSON.stringify({
    project_id: projectId,
    task_id: taskId,
  });
  return await api.post('/crontab/execute', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function deleteTask(
  api: AxiosInstance,
  projectId: number,
  taskId: string,
) {
  const payload = JSON.stringify({
    project_id: projectId,
    task_id: taskId,
  });
  return await api.post('/crontab/delete', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export interface RecentLogCount {
  success: Number;
  error: Number;
  date: String;
}

export async function recentLog(api: AxiosInstance): Promise<RecentLogCount[]> {
  const resp = await api.get('/log/recent');
  const data = resp.data;
  const r = data.response;
  return r.map((v: any) => ({
    success: v.success_count,
    error: v.error_count,
    date: v.date,
  }));
}

export async function createProject(
  api: AxiosInstance,
  title: string,
  remark: string,
) {
  const payload = JSON.stringify({
    title: title,
    remark: remark,
  });
  return await api.post('/project/create', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function updateProject(
  api: AxiosInstance,
  projectId: number,
  title: string,
  remark: string,
) {
  const payload = JSON.stringify({
    project_id: projectId,
    title: title,
    remark: remark,
  });
  return await api.post('/project/update', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function deleteProject(api: AxiosInstance, projectId: number) {
  const payload = JSON.stringify({
    project_id: projectId,
  });
  return await api.post('/project/delete', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function fetchProjectUsers(api: AxiosInstance, projectId: number) {
  const resp = await api.get('/project/users', {
    params: {
      project_id: projectId,
    },
  });
  return resp.data.response.list.map((v: any) => ({
    id: v.id,
    name: v.name,
    account: v.account,
    permissions: v.permission.split(','),
    createTime: v.create_time,
  }));
}

export async function removeProjectUser(
  api: AxiosInstance,
  projectId: number,
  userId: number,
) {
  const payload = JSON.stringify({
    project_id: projectId,
    user_id: userId,
  });
  return await api.post('/project/remove_user', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function addProjectUser(
  api: AxiosInstance,
  projectId: number,
  userAccount: string,
) {
  const payload = JSON.stringify({
    project_id: projectId,
    user_account: userAccount,
  });
  return await api.post('/project/add_user', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export interface TaskLog {
  id: number;
  taskId: string;
  projectId: number;
  project: string;
  name: string;
  result: string;
  startTime: number;
  endTime: number;
  command: string;
  withError: number;
  clientIp: string;
  tmpId: string;
}

export async function fetchLogs(
  api: AxiosInstance,
  projectId: number,
  taskId: string,
  page: number,
  pageSize: number,
): Promise<[TaskLog[], number]> {
  const resp = await api.get('/log/list', {
    params: {
      project_id: projectId,
      task_id: taskId,
      page: page,
      pagesize: pageSize,
    },
  });
  const data = resp.data;
  const r = data.response;
  return [
    r.list.map((v: any) => ({
      id: v.id,
      taskId: v.task_id,
      projectId: v.project_id,
      project: v.project,
      name: v.name,
      result: v.result,
      startTime: v.start_time,
      endTime: v.end_time,
      command: v.command,
      withError: v.with_error,
      clientIp: v.client_ip,
      tmpId: v.tmp_id,
    })),
    r.total,
  ];
}

export interface Workflow {
  id: number;
  title: string;
  remark: string;
  status: number;
  state: Object;
  createTime: number;
  cronExpr: string;
}

export async function fetchWorkflows(
  api: AxiosInstance,
  page: number,
  pageSize: number,
): Promise<[Workflow[], number]> {
  const resp = await api.get('/workflow/list', {
    params: {
      page: page,
      pagesize: pageSize,
    },
  });
  const data = resp.data;
  const r = data.response;
  return [
    r.list.map((v: any) => ({
      id: v.id,
      title: v.title,
      remark: v.remark,
      status: v.status,
      state: v.state,
      createTime: v.create_time,
      cronExpr: v.cron,
    })),
    r.total,
  ];
}

export async function createWorkflow(
  api: AxiosInstance,
  title: string,
  remark: string,
  cronExpr: string,
) {
  const payload = JSON.stringify({
    title: title,
    remark: remark,
    cron: cronExpr,
  });
  return await api.post('/workflow/create', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function updateWorkflow(api: AxiosInstance, workflow: Workflow) {
  const payload = JSON.stringify({
    id: workflow.id,
    title: workflow.title,
    remark: workflow.remark,
    cron: workflow.cronExpr,
    status: workflow.status,
  });
  return await api.post('/workflow/update', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export interface WorkFlowEdge {
  id: number;
  projectId: number;
  taskId: string;
  workflowId: number;
  createTime: number;

  dependencyProjectId: number;
  dependencyTaskId: string;
}

export interface ScheduleRecord {
  tmpId: string;
  status: string;
  result: string;
  eventTime: number;
}

export interface WorkflowTaskState {
  workflowId: number;
  projectId: number;
  taskId: string;
  currentStatus: string;
  scheduleCount: number;
  scheduleRecords: ScheduleRecord[];
  startTime: number;
}

export async function fetchWorkflowEdges(
  api: AxiosInstance,
  workflowId: number,
): Promise<[WorkFlowEdge[], WorkflowTaskState[]]> {
  const resp = await api.get('/workflow/task/list', {
    params: {
      workflow_id: workflowId,
    },
  });
  const data = resp.data;
  if (!data.response) return [[], []];
  const edges = [];
  const stateMap = new Map<string, WorkflowTaskState>();
  for (const { task: v, state: s } of data.response) {
    edges.push({
      id: v.id,
      projectId: v.project_id,
      taskId: v.task_id,
      workflowId: v.workflowId,
      createTime: v.create_time,

      dependencyProjectId: v.dependency_project_id,
      dependencyTaskId: v.dependency_task_id,
    });
    if (!s) continue;
    const key = `${s.project_id}_${s.task_id}`;
    if (stateMap.has(key)) continue;
    stateMap.set(key, {
      workflowId: s.workflow_id,
      projectId: s.project_id,
      taskId: s.task_id,
      currentStatus: s.current_status,
      scheduleCount: s.schedule_count,
      scheduleRecords: s.schedule_records.map((r: any) => ({
        tmpId: r.tmp_id,
        status: r.status,
        result: r.result,
        eventTime: r.event_time,
      })),
      startTime: s.start_time,
    });
  }
  return [edges, Array.from(stateMap.values())];
}

export async function updateWorkflowEdges(
  api: AxiosInstance,
  workflowId: number,
  edges: WorkFlowEdge[],
) {
  /* eslint-disable camelcase */
  interface Task {
    task_id: string;
    project_id: number;
  }
  const tasks = new Map<string, Task>();
  const taskDeps = new Map<string, Task[]>();
  for (const edge of edges) {
    const key = `${edge.projectId}_${edge.taskId}`;
    if (!tasks.has(key)) {
      tasks.set(key, { task_id: edge.taskId, project_id: edge.projectId });
    }
    if (edge.dependencyProjectId === 0 || edge.dependencyTaskId === '') {
      continue;
    }
    const deps = taskDeps.get(key);
    const task = {
      task_id: edge.dependencyTaskId,
      project_id: edge.dependencyProjectId,
    };
    if (deps === undefined) {
      taskDeps.set(key, [task]);
    } else {
      taskDeps.set(key, [...deps, task]);
    }
  }
  const payload = JSON.stringify({
    workflow_id: workflowId,
    tasks: Array.from(tasks.keys()).map((k) => ({
      task: tasks.get(k),
      dependencies: taskDeps.get(k) || [],
    })),
  });
  return await api.post('/workflow/task/schedule/create', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function startWorkflow(api: AxiosInstance, workflowId: number) {
  const payload = JSON.stringify({
    workflow_id: workflowId,
  });
  return await api.post('/workflow/start', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function killWorkflow(api: AxiosInstance, workflowId: number) {
  const payload = JSON.stringify({
    workflow_id: workflowId,
  });
  return await api.post('/workflow/kill', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function deleteWorkflow(api: AxiosInstance, workflowId: number) {
  const payload = JSON.stringify({
    // workflow_id: workflowId,
    id: workflowId,
  });
  return await api.post('/workflow/delete', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export interface WorkFlowLog {
  id: number;
  workflowId: number;
  createTime: number;
  startTime: number;
  endTime: number;
  result: string;
}

export async function fetchWorkFlowLogs(
  api: AxiosInstance,
  workflowId: number,
  page: number,
  pageSize: number,
): Promise<[WorkFlowLog[], number]> {
  const resp = await api.get('/workflow/log/list', {
    params: {
      workflow_id: workflowId,
      page: page,
      pagesize: pageSize,
    },
  });
  const data = resp.data;
  const r = data.response;
  return [
    r.list.map((v: any) => ({
      id: v.id,
      workflowId: v.workflow_id,
      createTime: v.create_time,
      startTime: v.start_time,
      endTime: v.end_time,
      result: v.result,
    })),
    r.total,
  ];
}

export async function fetchProjectClients(
  api: AxiosInstance,
  projectId: number,
): Promise<string[]> {
  const resp = await api.get('/crontab/client_list', {
    params: {
      project_id: projectId,
    },
  });
  const data = resp.data;
  const r = data.response;
  return r.list;
}

export interface WorkFlowTask {
  id: string;
  name: string;
  projectId: number;
  workflowId: number;
  command: string;
  remark: string;
  timeout: number;
  createTime: number;
  noseize: number;
}

export async function fetchWorkFlowTasks(
  api: AxiosInstance,
  projectId: number,
): Promise<WorkFlowTask[]> {
  const resp = await api.get('/project/workflow/task/list', {
    params: {
      project_id: projectId,
    },
  });
  const data = resp.data;
  const r = data.response;
  return r.map((v: any) => ({
    id: v.task_id,
    name: v.task_name,
    projectId: v.project_id,
    workflowId: v.workflow_id,
    command: v.command,
    remark: v.remark,
    timeout: v.timeout,
    createTime: v.create_time,
    noseize: v.noseize,
  }));
}

export async function createWorkFlowTask(
  api: AxiosInstance,
  projectId: number,
  name: string,
  command: string,
  remark: string,
  timeout: number,
) {
  const payload = JSON.stringify({
    project_id: projectId,
    task_name: name,
    command: command,
    remark: remark,
    timeout: timeout,
  });
  return await api.post('/project/workflow/task/create', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function deleteWorkFlowTask(
  api: AxiosInstance,
  projectId: number,
  taskId: string,
) {
  const payload = JSON.stringify({
    project_id: projectId,
    task_id: taskId,
  });
  return await api.post('/project/workflow/task/delete', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function saveWorkFlowTask(api: AxiosInstance, task: WorkFlowTask) {
  const payload = JSON.stringify({
    project_id: task.projectId,
    task_id: task.id,
    task_name: task.name,
    command: task.command,
    remark: task.remark,
    timeout: task.timeout,
  });
  return await api.post('/project/workflow/task/update', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}
