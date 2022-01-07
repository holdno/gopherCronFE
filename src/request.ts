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

export interface RecentLogCount {
  success: Number;
  error: Number;
  date: String;
}

export async function recentLog(api: AxiosInstance): Promise<RecentLogCount[]> {
  const resp = await api.get('/log/recent');
  const data = resp.data;
  if (data.meta.code === 0) {
    const r = data.response;
    return r.map((v: any) => ({
      success: v.success_count,
      error: v.error_count,
      date: v.date,
    }));
  } else {
    throw new Error(data.meta.msg);
  }
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
  const resp = await api.post('/project/create', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
  const data = resp.data;
  if (data.meta.code !== 0) {
    throw new Error(data.meta.msg);
  }
}

export async function deleteProject(api: AxiosInstance, projectId: number) {
  const payload = JSON.stringify({
    project_id: projectId,
  });
  const resp = await api.post('/project/delete', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
  const data = resp.data;
  if (data.meta.code !== 0) {
    throw new Error(data.meta.msg);
  }
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
  if (data.meta.code === 0) {
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
  } else {
    throw new Error(data.meta.msg);
  }
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
  if (data.meta.code === 0) {
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
  } else {
    throw new Error(data.meta.msg);
  }
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
  const resp = await api.post('/workflow/create', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
  const data = resp.data;
  if (data.meta.code !== 0) {
    throw new Error(data.meta.msg);
  }
}

export async function updateWorkflow(api: AxiosInstance, workflow: Workflow) {
  const payload = JSON.stringify({
    id: workflow.id,
    title: workflow.title,
    remark: workflow.remark,
    cron: workflow.cronExpr,
    status: workflow.status,
  });
  const resp = await api.post('/workflow/update', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
  const data = resp.data;
  if (data.meta.code !== 0) {
    throw new Error(data.meta.msg);
  }
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
  if (data.meta.code === 0) {
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
  } else {
    throw new Error(data.meta.msg);
  }
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
  const resp = await api.post('/workflow/task/create', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
  const data = resp.data;
  if (data.meta.code !== 0) {
    throw new Error(data.meta.msg);
  }
}

export async function startWorkflow(api: AxiosInstance, workflowId: number) {
  const payload = JSON.stringify({
    workflow_id: workflowId,
  });
  const resp = await api.post('/workflow/start', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
  const data = resp.data;
  if (data.meta.code !== 0) {
    throw new Error(data.meta.msg);
  }
}

export async function killWorkflow(api: AxiosInstance, workflowId: number) {
  const payload = JSON.stringify({
    workflow_id: workflowId,
  });
  const resp = await api.post('/workflow/kill', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
  const data = resp.data;
  if (data.meta.code !== 0) {
    throw new Error(data.meta.msg);
  }
}
