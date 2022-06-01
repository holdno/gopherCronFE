import { Project, apiv1 } from './request';

export async function projectList(): Promise<Project[]> {
  const resp = await apiv1.get('/project/list');
  const data = resp.data;
  const r = data.response;
  return r.list.map((p: any) => ({
    id: p.project_id,
    remark: p.remark,
    taskCount: p.task_count,
    title: p.title,
    uid: p.uid,
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