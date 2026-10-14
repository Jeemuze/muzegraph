export function hasPermission(user: any, permission: string): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!user.permissions || user.permissions.length === 0) return false;
  return user.permissions.includes(permission);
}
