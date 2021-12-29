import moment from 'moment-timezone';

export function formatTimestamp(timestamp: number) {
  const dt = moment(timestamp);
  return dt.format('YYYY-MM-DD HH:mm:ss');
}
