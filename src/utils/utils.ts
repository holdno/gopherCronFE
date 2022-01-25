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
