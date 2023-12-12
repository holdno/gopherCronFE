export function generateAvatarName(name: string) {
  if (name === '') {
    return 'EM';
  }
  if (name.length > 3) {
    return name.substring(name.length - 2).toUpperCase();
  } else if (name.length < 3) {
    return name.substring(0, 1).toUpperCase();
  } else {
    return name.substring(1, 3).toUpperCase();
  }
}

export function getQueryVariable(variable: string): string {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return '';
}

export function compareArrays(a: [], b: []): boolean {
  if (typeof a !== typeof b) return false;
  if ((!a && b) || (a && !b)) return false;
  return (
    a.length === b.length && a.every((element, index) => element === b[index])
  );
}
