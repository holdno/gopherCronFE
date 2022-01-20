import { apiv1 } from './request';

export interface GetSummaryErrorLogsRequest {
  page: number;
  pagesize: number;
}

export interface TaskLog {
  id: number;
  clientIP: string;
  command: string;
  endTime: number;
  taskName: string;
  projectName: string;
  projectID: number;
  result: string;
  startTime: number;
  taskID: string;
  tmpID: string;
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
      page: args.page,
      pagesize: args.pagesize,
    },
  });

  const result = [] as Array<TaskLog>;
  if (resp.data.meta.code === 0) {
    resp.data.response.list.forEach((v: any, i: number) => {
      result.push({
        id: v.id,
        clientIP: v.client_ip,
        command: v.command,
        endTime: v.end_time,
        taskName: v.name,
        projectName: v.project,
        projectID: v.project_id,
        result: v.result,
        startTime: v.start_time,
        taskID: v.task_id,
        tmpID: v.tmp_id,
      });
    });
  }
  return { list: result, total: resp.data.response.total };
}
