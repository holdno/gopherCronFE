import { apiv1 } from './request';

export interface Org {
  id: string 
  title: string
}

export async function fetchUserOrgs(): Promise<Org[]> {
  const resp = await apiv1.get('/org/list');
  const data = resp.data;
  const r = data.response;
  if (!r) {
    return [];
  }
  return r
}