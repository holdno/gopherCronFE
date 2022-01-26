import { apiv1 } from './request';

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
