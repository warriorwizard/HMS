export type NavItem = {
  label: string;
  href: string;
  requiredPermission?: string;
};

/**
 * Returns only the nav items the given permission set allows.
 * Items with no requiredPermission are always visible.
 */
export function filterNavByPermissions(items: NavItem[], permissions: readonly string[]): NavItem[] {
  const permSet = new Set(permissions);
  return items.filter((item) => !item.requiredPermission || permSet.has(item.requiredPermission));
}

/**
 * Returns true if the permission set satisfies the required permission.
 * A null/undefined requirement always passes.
 */
export function hasPermission(
  permissions: readonly string[],
  required: string | undefined
): boolean {
  if (!required) return true;
  return permissions.includes(required);
}
