export interface WebHook {
  type: string;
  callBackUrl: string;
  projectId: number;
  createTime?: number;
}

export const hookOptions = [
  {
    value: 'task-result',
    label: '执行结束',
  },
  {
    value: 'task-failure',
    label: '执行失败',
  },
];

const hookMap = new Map<string, string>();
hookOptions.forEach((v, k, a) => {
  hookMap.set(v.value, v.label);
});

export function getHookType(typeStr: string): string | undefined {
  return hookMap.get(typeStr);
}
