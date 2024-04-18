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

export async function reGenProjectToken(projectId: number): Promise<string> {
  const resp = await apiv1.post('/project/re_gen_token', {
    project_id: projectId,
  });
  return resp.data.response;
}

export interface ClientMeta {
  clientIP: string;
  weight: number;
  version: string;
  region: string;
}

export async function fetchProjectClients(
  projectId: number,
): Promise<ClientMeta[]> {
  const resp = await apiv1.get('/crontab/client/list', {
    params: {
      project_id: projectId,
    },
  });
  const data = resp.data;
  const r = data.response;

  if (!r.list) {
    return [];
  }

  return r.list.map((p: any) => ({
    clientIP: p.client_ip,
    weight: p.weight,
    version: p.version,
    region: p.region,
  }));
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

export async function changeNodeWeight(
  projectId: number,
  clientIP: string,
  weight: number,
) {
  await apiv1.post('/client/weight', {
    project_id: projectId,
    client_ip: clientIP,
    weight: weight,
  });
}
