import { apiv1 } from './request';

export interface Org {
  id: string;
  title: string;
  remark: string;
}

export async function fetchUserOrgs(): Promise<Org[]> {
  const resp = await apiv1.get('/org/list');
  const data = resp.data;
  const r = data.response;
  if (!r) {
    return [];
  }
  return r;
}

export async function createOrg(org: Org) {
  return await apiv1.post('/org/create', org, {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function updateOrg(org: Org) {
  return await apiv1.post('/org/update', org, {
    headers: {
      'content-type': 'application/json',
    },
  });
}
