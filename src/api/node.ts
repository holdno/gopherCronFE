import { apiv1, Meta } from './request';

export interface GetClientListRequest {
  projectIDs?: number[];
}

export interface Node {
  clientIP: string;
  version: string;
}

export interface GetClientListResponse {
  nodeList: Node[];
  meta: Meta;
}

export async function getClientList(
  args: GetClientListRequest,
): Promise<GetClientListResponse> {
  const resp = await apiv1.get('/client/list', {
    params: {
      project_ids: args.projectIDs,
    },
  });

  const data: Node[] = [];
  if (resp.data.response.length > 0) {
    resp.data.response.forEach((element: any, i: number) => {
      data.push({
        clientIP: element.client_ip,
        version: element.version,
      });
    });
  }
  return {
    nodeList: data,
    meta: { code: resp.data.meta.code, message: resp.data.meta.msg },
  };
}

export interface ReloadNodeConfigRequest {
  clientIP: string;
}

export async function reloadNodeConfig(
  args: ReloadNodeConfigRequest,
): Promise<Meta> {
  const resp = await apiv1.post('/client/reload/config', {
    client_ip: args.clientIP,
  });
  return { code: resp.data.meta.code, message: resp.data.meta.message };
}
