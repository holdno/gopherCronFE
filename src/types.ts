import { Task } from './request';

export interface KahnTask {
  name: string;
  id: string;
  deps?: string[];
  origin: Task;
}

export function cloneTask(t: KahnTask): KahnTask {
  const rv = Object.assign({}, t);
  if (rv.deps) rv.deps = Object.assign([], rv.deps);
  return rv;
}
