export function isManagerPermission(permission: string): boolean {
  if (!permission) {
    return false;
  }
  return (
    permission.indexOf('manager') !== -1 || permission.indexOf('admin') !== -1
  );
}

export function isAdminPermission(permission: string): boolean {
  return permission.indexOf('admin') !== -1;
}

export const roleOptions = [
  {
    value: 'admin',
    label: '管理员',
  },
  {
    value: 'manager',
    label: '可编辑',
  },
  {
    value: 'user',
    label: '仅查看',
  },
];

const roleMap = new Map<string, string>();
roleOptions.forEach((v, k, a) => {
  roleMap.set(v.value, v.label);
});

export function getUserPermission(roleStr: string): string | undefined {
  return roleMap.get(roleStr);
}
