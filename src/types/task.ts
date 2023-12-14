export function DefaultTaskValue() {
  return {
    id: '',
    name: '',
    projectId: 0,
    command: '',
    cronExpr: '0 0 0 * * * *',
    remark: '',
    timeout: 300,
    createTime: 0,
    status: 0,
    isRunning: 0,
    noseize: 0,
    exclusion: 0,
    clientIp: '',
    tmpId: '',
  };
}

export const TASK_STATUS = {
  STARTING: 'starting',
  RUNNING: 'running',
  DONE: 'done',
  FAILED: 'fail',
  isFinished: (status: string): boolean => {
    return status === TASK_STATUS.DONE || status === TASK_STATUS.FAILED;
  },
  isRunning: (status: string): boolean => {
    return status === TASK_STATUS.STARTING || status === TASK_STATUS.RUNNING;
  },
};
