var matrix = {
  admin: {
    permissions: [
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
    ]
  },
  editor: {
    permissions: [
  'posts:create:own',
  'posts:read:any',
  'posts:update:own',
  'posts:delete:own',
  'dashboard:view:any'
    ]
  },
  viewer: {
    permissions: [
  'posts:read:any',
  'dashboard:view:any'
    ]
  }
};

function has(role, action, scope) {
  var roleDef = matrix[role];
  if (!roleDef) return false;
  var needle = action + ':' + (scope || 'any');
  if (roleDef.permissions.indexOf(needle) !== -1) return true;
  if (scope === 'own') {
    needle = action + ':own';
    if (roleDef.permissions.indexOf(needle) !== -1) return true;
  }
  return false;
}

module.exports = {
  matrix: matrix,
  roles: Object.keys(matrix),
  has: has
};
