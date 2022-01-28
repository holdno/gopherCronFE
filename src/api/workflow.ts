import { apiv1, Workflow } from './request';

export async function fetchWorkflowDetail(
  workflowId: number,
): Promise<Workflow> {
  const resp = await apiv1.get('/workflow/detail', {
    params: {
      id: workflowId,
    },
  });
  const v = resp.data.response;
  return {
    id: v.id,
    title: v.title,
    remark: v.remark,
    status: v.status,
    state: v.state ? { status: v.state.status } : null,
    cronExpr: v.cron,
    createTime: v.create_time,
  };
}
