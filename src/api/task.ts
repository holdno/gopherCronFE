import { Task, apiv1 } from './request';

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

export interface KillTaskRequest {
  projectID: number;
  taskID: string;
}

export async function killTask(args: KillTaskRequest) {
  const resp = await apiv1.post('/crontab/kill', {
    project_id: args.projectID,
    task_id: args.taskID,
  });
  return resp.data;
}
