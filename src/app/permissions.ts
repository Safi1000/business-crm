import { useAuthStore } from '@/app/stores/auth';
import type { Feature } from '@/config/nav';

/**
 * Super Admin and Super Super Admin have implicit access to everything.
 * Everyone else needs the specific feature granted in their permissions.
 * An undefined feature (e.g. the Dashboard) is always accessible.
 */
export function hasFeatureAccess(role: string | undefined, permissions: string[] | undefined, feature?: Feature): boolean {
  if (role === 'Super Admin' || role === 'Super Super Admin') return true;
  if (!feature) return true;
  return (permissions ?? []).includes(feature);
}

/** Returns a predicate `(feature?) => boolean` bound to the signed-in user. */
export function useFeatureAccess() {
  const role = useAuthStore((s) => s.user?.role);
  const permissions = useAuthStore((s) => s.user?.permissions);
  return (feature?: Feature) => hasFeatureAccess(role, permissions, feature);
}
