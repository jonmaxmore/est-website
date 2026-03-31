type CMSUser = {
  id?: number | string | null;
  role?: string | null;
} | null | undefined;

function hasRole(user: CMSUser, roles: string[]) {
  return typeof user?.role === 'string' && roles.includes(user.role);
}

export const allowPublicRead = () => true;

export function isAuthenticated({ req: { user } }: { req: { user?: CMSUser } }) {
  return Boolean(user);
}

export function isAdmin({ req: { user } }: { req: { user?: CMSUser } }) {
  return hasRole(user, ['admin']);
}

export function isAdminOrEditor({ req: { user } }: { req: { user?: CMSUser } }) {
  return hasRole(user, ['admin', 'editor']);
}

export function isAdminOrSelf({
  req: { user },
  id,
}: {
  req: { user?: CMSUser };
  id?: number | string;
}) {
  const userId = user?.id;
  return hasRole(user, ['admin']) || (userId != null && id != null && String(userId) === String(id));
}
