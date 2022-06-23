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
