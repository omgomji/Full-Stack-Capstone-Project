import { useNotification } from '../context/NotificationContext.jsx';

function NotificationCenter() {
  const ctx = useNotification();
  if (!ctx || ctx.items.length === 0) return null;

  return (
    <div style={containerStyle}>
      {ctx.items.map(function (item) {
        return (
          <div key={item.id} style={itemStyle(item.type)}>
            <span>{item.message}</span>
            <button onClick={function () { ctx.dismiss(item.id); }} style={closeStyle} aria-label="Dismiss notification">×</button>
          </div>
        );
      })}
    </div>
  );
}

const containerStyle = {
  position: 'fixed',
  top: '16px',
  right: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  zIndex: 9999
};

function itemStyle(type) {
  var colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  };
  var bg = colors[type] || colors.info;
  return {
    minWidth: '240px',
    backgroundColor: bg,
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '6px',
    boxShadow: '0 10px 25px rgba(15,23,42,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px'
  };
}

const closeStyle = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  fontSize: '18px',
  lineHeight: '1',
  cursor: 'pointer'
};

export default NotificationCenter;
