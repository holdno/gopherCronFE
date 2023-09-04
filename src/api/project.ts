import { Project, apiv1 } from './request';


export async function projectList(orgId: string): Promise<Project[]> {
  const resp = await apiv1.get('/project/list', {
    params: {
      oid: orgId,
    },
  });
  const data = resp.data;
  const r = data.response;
  return r.list.map((p: any) => ({
    id: p.project_id,
    remark: p.remark,
    taskCount: p.task_count,
    title: p.title,
    uid: p.uid,
    role: p.role,
  }));
}

export async function fetchProjectClients(
  projectId: number,
): Promise<string[]> {
  const resp = await apiv1.get('/crontab/client_list', {
    params: {
      project_id: projectId,
    },
  });
  const data = resp.data;
  const r = data.response;
  return r.list;
}

export async function getProjectToken(projectId: number): Promise<string> {
  const resp = await apiv1.get('/project/token', {
    params: {
      project_id: projectId,
    },
  });
  const data = resp.data;
  const r = data.response;
  return r;
}