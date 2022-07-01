import { Task, TemporaryTask, apiv1 } from './request';

export async function fetchTasks(projectId: number): Promise<Task[]> {
  const resp = await apiv1.get('/crontab/list', {
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

export async function fetchTemporaryTasks(
  projectId: number,
): Promise<TemporaryTask[]> {
  const resp = await apiv1.get('/temporary_task/list', {
    params: {
      project_id: projectId,
    },
  });
  const data = resp.data;
  const r = data.response;
  if (!r) {
    return [];
  }
  return r.map((v: any) => ({
    command: v.command,
    createTime: v.create_time,
    id: v.id,
    projectId: v.project_id,
    scheduleStatus: v.schedule_status,
    scheduleTime: v.schedule_time,
    taskId: v.task_id,
    userId: v.user_id,
    userName: v.user_name,
    tmpId: v.tmp_id,
    isRunning: v.is_running,
    timeout: v.timeout,
    remark: v.remark,
  }));
}

export interface KillTaskRequest {
  projectId: number;
  taskId: string;
}

export async function killTask(args: KillTaskRequest) {
  const resp = await apiv1.post('/crontab/kill', {
    project_id: args.projectId,
    task_id: args.taskId,
  });
  return resp.data;
}

export interface CreateTemporaryTaskRequest {
  projectId: number;
  taskId: string;
  command: string;
  noseize: number;
  remark: string;
  scheduleTime: number;
  timeout: number;
}

export interface CreateTemporaryTaskResponse {
  code: number;
  message: string;
}

export async function CreateTemporaryTask(
  args: CreateTemporaryTaskRequest,
): Promise<CreateTemporaryTaskResponse> {
  const resp = await apiv1.post('/temporary_task/create', {
    project_id: args.projectId,
    task_id: args.taskId,
    command: args.command,
    noseize: args.noseize,
    remark: args.remark,
    schedule_time: args.scheduleTime,
    timeout: args.timeout,
  });
  return resp.data.meta;
}
