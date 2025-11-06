export const roleMatrix = {
  admin: [
    'users:create:any',
    'users:read:any',
    'users:update:any',
    'users:delete:any',
    'users:assign-role:any',
    'posts:create:any',
    'posts:read:any',
    'posts:update:any',
    'posts:delete:any',
    'audit:read:any',
    'dashboard:view:any'
  ],
  editor: [
    'posts:create:own',
    'posts:read:any',
    'posts:update:own',
    'posts:delete:own',
    'dashboard:view:any'
  ],
  viewer: [
    'posts:read:any',
    'dashboard:view:any'
  ]
};

export function hasPermission(role, action, scope) {
  if (!roleMatrix[role]) return false;
  const list = roleMatrix[role];
  const target = action + ':' + (scope || 'any');
  if (list.includes(target)) return true;
  if (scope === 'own') {
    if (list.includes(action + ':own')) return true;
    if (list.includes(action + ':any')) return true;
  }
  return false;
}
