export interface Task {
  name: string;
  id: string;
  deps?: string[];
}

export function cloneTask(t: Task): Task {
  const rv = Object.assign({}, t);
  if (rv.deps) rv.deps = Object.assign([], rv.deps);
  return rv;
}
