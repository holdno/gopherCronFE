import { Meta, apiv1 } from './request';

export interface GetClientListRequest {
  oid: string;
  projectIDs?: number[];
}

export interface Node {
  clientIP: string;
  projectID: number;
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
      oid: args.oid,
      project_ids: args.projectIDs,
    },
  });

  const data: Node[] = [];
  if (resp.data.response && resp.data.response.length > 0) {
    resp.data.response.forEach((element: any, i: number) => {
      data.push({
        clientIP: element.client_ip,
        projectID: element.project_id,
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
  projectID: number;
}

export async function reloadNodeConfig(
  args: ReloadNodeConfigRequest,
): Promise<Meta> {
  const resp = await apiv1.post('/client/reload/config', {
    client_ip: args.clientIP,
    project_id: args.projectID,
  });
  return { code: resp.data.meta.code, message: resp.data.meta.msg };
}
