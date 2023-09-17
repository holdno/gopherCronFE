import { apiv1 } from './request';

import { WebHook } from '@/types/webhook';

export interface CreateWebHookRequest {
  callBackUrl: string;
  types: string;
  projectId: number;
}

export async function createWebhook(args: CreateWebHookRequest) {
  const resp = await apiv1.post('/webhook/create', {
    project_id: args.projectId,
    call_back_url: args.callBackUrl,
    types: args.types,
  });
  return resp.data;
}

export async function deleteWebhook(pid: number, types: string) {
  const resp = await apiv1.post('/webhook/delete', {
    project_id: pid,
    types: types,
  });
  return resp.data;
}

export async function getWebhookList(pid: number): Promise<WebHook[]> {
  const resp = await apiv1.get('/webhook/list', {
    params: {
      project_id: pid,
    },
  });
  const data = resp.data;
  const list = data.response.list ? data.response.list : [];
  const resList: WebHook[] = [];
  list.forEach((element: any, i: number) => {
    resList.push({
      projectId: element.project_id,
      types: element.type,
      callBackUrl: element.callback_url,
      createTime: element.create_time,
    });
  });
  return resList;
}
