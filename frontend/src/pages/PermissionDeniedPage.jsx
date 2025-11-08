import PropTypes from 'prop-types';
import { useNotification } from '../context/NotificationContext.jsx';
import { useEffect } from 'react';

function PermissionDeniedPage(props) {
  const notifications = useNotification();

  useEffect(function () {
    notifications.notify('Permission denied: ' + props.message, 'error');
  }, [notifications, props.message]);

  return (
    <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 12px 30px rgba(15,23,42,0.1)', maxWidth: '480px' }}>
      <h2 style={{ marginTop: 0, color: '#ef4444' }}>Permission Denied</h2>
      <p style={{ color: '#4b5563' }}>{props.message || 'You are not allowed to view this resource.'}</p>
    </div>
  );
}

PermissionDeniedPage.propTypes = {
  message: PropTypes.string
};

export default PermissionDeniedPage;
