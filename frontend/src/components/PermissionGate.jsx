import { Children, cloneElement, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext.jsx';

function PermissionGate(props) {
  const auth = useAuth();
  const allowed = auth.can(props.action, props.scope);

  if (typeof props.children === 'function') {
    return props.children({ allowed: allowed });
  }

  if (isValidElement(props.children)) {
    const child = Children.only(props.children);
    if (allowed) return child;
    return cloneElement(child, {
      disabled: true,
      title: props.deniedMessage || 'Permission denied'
    });
  }

  return null;
}

PermissionGate.propTypes = {
  action: PropTypes.string.isRequired,
  scope: PropTypes.string,
  deniedMessage: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node])
};

export default PermissionGate;
