import moment from 'moment-timezone';

export function formatTimestamp(
  timestamp: number,
  fmt: string = 'YYYY-MM-DD HH:mm:ss',
) {
  const dt = moment(timestamp);
  return dt.format(fmt);
}

export function afterTimeStr(
  i: number,
  fmt: string = 'YYYY-MM-DD HH:mm:ss',
): string {
  return moment().add(i, 'seconds').format(fmt);
}
