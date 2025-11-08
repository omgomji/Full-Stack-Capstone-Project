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
    return props.fallback || (
      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 12px 30px rgba(15,23,42,0.1)' }}>
        <h2 style={{ marginTop: 0, color: '#ef4444' }}>Permission Denied</h2>
        <p style={{ color: '#4b5563' }}>Your role does not have access to this area.</p>
      </div>
    );
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
