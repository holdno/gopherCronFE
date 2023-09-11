import { apiv1 } from './request';

export interface GetSummaryErrorLogsRequest {
  oid: string;
  page: number;
  pagesize: number;
}

export interface TaskLog {
  id: number;
  clientIp: string;
  command: string;
  endTime: number;
  taskName: string;
  projectName: string;
  projectId: number;
  result: string;
  startTime: number;
  taskId: string;
  tmpId: string;
}

export interface GetTemporaryTaskLogDetailRequest {
  tmpId: string;
  projectId: number;
  taskId: string;
}

export async function GetTemporaryTaskLogDetail(
  args: GetTemporaryTaskLogDetailRequest,
): Promise<TaskLog | null> {
  const resp = await apiv1.get('/log/detail', {
    params: {
      project_id: args.projectId,
      task_id: args.taskId,
      tmp_id: args.tmpId,
    },
  });

  const v = resp.data.response;
  if (!v) {
    return null;
  }
  return {
    id: v.id,
    taskId: v.task_id,
    projectId: v.project_id,
    projectName: v.project,
    taskName: v.name,
    result: v.result,
    startTime: v.start_time,
    endTime: v.end_time,
    command: v.command,
    clientIp: v.client_ip,
    tmpId: v.tmp_id,
  };
}

export interface GetSummaryErrorLogsResponse {
  list: TaskLog[];
  total: number;
}

export async function getSummaryErrorLogs(
  args: GetSummaryErrorLogsRequest,
): Promise<GetSummaryErrorLogsResponse> {
  const resp = await apiv1.get('/log/errors', {
    params: {
      oid: args.oid,
      page: args.page,
      pagesize: args.pagesize,
    },
  });

  const result = [] as Array<TaskLog>;
  if (resp.data.meta.code === 0 && resp.data.response.list) {
    resp.data.response.list.forEach((v: any, i: number) => {
      result.push({
        id: v.id,
        clientIp: v.client_ip,
        command: v.command,
        endTime: v.end_time,
        taskName: v.name,
        projectName: v.project,
        projectId: v.project_id,
        result: v.result,
        startTime: v.start_time,
        taskId: v.task_id,
        tmpId: v.tmp_id,
      });
    });
  }
  return { list: result, total: resp.data.response.total };
}
