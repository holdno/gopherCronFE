import { User, WorkFlow, apiv1 } from './request';

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

export async function killWorkFlow(workflowId: number) {
  const payload = JSON.stringify({
    workflow_id: workflowId,
  });
  return await apiv1.post('/workflow/kill', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function deleteWorkFlow(workflowId: number) {
  const payload = JSON.stringify({
    // workflow_id: workflowId,
    id: workflowId,
  });
  return await apiv1.post('/workflow/delete', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function fetchWorkFlowUsers(workflowId: number): Promise<User[]> {
  const resp = await apiv1.get('/workflow/manage/users', {
    params: {
      workflow_id: workflowId,
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

export async function removeWorkFlowUser(workflowId: number, userId: number) {
  const payload = JSON.stringify({
    workflow_id: workflowId,
    user_id: userId,
  });
  return await apiv1.post('/workflow/manage/remove_user', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function addWorkFlowUser(workflowId: number, userAccount: string) {
  const payload = JSON.stringify({
    workflow_id: workflowId,
    user_account: userAccount,
  });
  return await apiv1.post('/workflow/manage/add_user', payload, {
    headers: {
      'content-type': 'application/json',
    },
  });
}
