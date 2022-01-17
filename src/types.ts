import { WorkFlowTask, WorkflowTaskState } from '@/api/request';
export interface KahnTask {
  name: string;
  id: string;
  deps?: string[];
  origin: WorkFlowTask;
  state?: WorkflowTaskState;
}

export function cloneTask(t: KahnTask): KahnTask {
  const rv = Object.assign({}, t);
  if (rv.deps) rv.deps = Object.assign([], rv.deps);
  return rv;
}
