import { apiv1, User } from './request';

export interface CreateUserRequest {
  account: string;
  password: string;
  name: string;
  permission?: string[];
}

export async function createUser(args: CreateUserRequest) {
  const resp = await apiv1.post('/user/create', {
    name: args.name,
    account: args.account,
    password: args.password,
    permission: args.permission ? args.permission.join(',') : '',
  });
  return resp.data;
}

export interface ChangePasswordRequest {
  userID: number;
  password: string;
  newPassword?: string;
}

export async function changePassword(args: ChangePasswordRequest) {
  const resp = await apiv1.post('/user/change_password', {
    user_id: args.userID,
    password: args.password,
    new_password: args.newPassword,
  });
  return resp.data;
}

export interface GetUserListRequest {
  name?: String;
  account?: String;
  projectID?: Number;
  page: Number;
  pagesize: Number;
}

export interface GetUserListResponse {
  total: Number;
  list: User[];
}

export async function userList(
  args: GetUserListRequest,
): Promise<GetUserListResponse> {
  const resp = await apiv1.get('/user/list', {
    params: {
      name: args.name,
      account: args.account,
      project_id: args.projectID,
      page: args.page,
      pagesize: args.pagesize,
    },
  });
  const data = resp.data;
  const list = data.response.list ? data.response.list : [];
  const resList: User[] = [];
  list.forEach((element: any, i: number) => {
    resList.push({
      id: element.id,
      name: element.name,
      account: element.account,
      permissions: element.permission.split(','),
      createTime: element.create_time,
    });
  });
  return { total: data.response.total, list: resList };
}

export interface DeleteUserRequest {
  id: number;
}

export async function deleteUser(args: DeleteUserRequest) {
  const resp = await apiv1.post('/user/delete', {
    id: args.id,
  });
  return resp.data;
}
