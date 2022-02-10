import { WorkFlowTask, apiv1 } from './request';

export async function fetchTasks(projectId: number): Promise<WorkFlowTask[]> {
  const resp = await apiv1.get('/project/workflow/task/list', {
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
