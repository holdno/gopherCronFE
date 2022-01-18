import { apiv1 } from './request';

export async function getServiceVersion(): Promise<string> {
  const resp = await apiv1.get('/version');
  if (resp.data.meta.code === 0) {
    return resp.data.response;
  }
  return '';
}
