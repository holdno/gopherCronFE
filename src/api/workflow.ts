import { WorkFlow, apiv1 } from './request';

export async function fetchWorkFlows(
  page: number,
  pageSize: number,
): Promise<[WorkFlow[], number]> {
  const resp = await apiv1.get('/workflow/list', {
    params: {
      page: page,
      pagesize: pageSize,
    },
  });
  const data = resp.data;
  const r = data.response;
  return [
    r.list?.map((v: any) => ({
      id: v.id,
      title: v.title,
      remark: v.remark,
      status: v.status,
      state: v.state,
      createTime: v.create_time,
      cronExpr: v.cron,
    })) || [],
    r.total,
  ];
}

export async function fetchWorkFlowDetail(
  workflowId: number,
): Promise<WorkFlow> {
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
