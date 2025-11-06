import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext.jsx';

function RoleGuard(props) {
  const auth = useAuth();
  if (!auth.user) return null;
  let allowed = false;
  if (props.roles && props.roles.length > 0) {
    allowed = props.roles.includes(auth.user.role);
  }
  if (!allowed && props.permission) {
    allowed = auth.can(props.permission, props.scope);
  }
  if (!allowed) {
    return props.fallback || null;
  }
  return props.children;
}

RoleGuard.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
  permission: PropTypes.string,
  scope: PropTypes.string,
  fallback: PropTypes.node,
  children: PropTypes.node
};

export default RoleGuard;
