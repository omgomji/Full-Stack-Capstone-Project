import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RoleGuard from './RoleGuard.jsx';

function Layout() {
  const auth = useAuth();
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#111827', color: '#fff', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>RBAC Capstone</strong>
        </div>
        <div>
          <span style={{ marginRight: '1rem' }}>{auth.user ? auth.user.name + ' (' + auth.user.role + ')' : ''}</span>
          <button onClick={auth.logout} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '0.4rem 0.9rem', borderRadius: '4px' }}>Logout</button>
        </div>
      </header>
      <div style={{ flex: 1, display: 'flex' }}>
        <nav style={{ width: '200px', backgroundColor: '#1f2937', color: '#e5e7eb', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link style={linkStyle(isActive('/'))} to="/">Dashboard</Link>
          <Link style={linkStyle(isActive('/posts'))} to="/posts">Posts</Link>
          <RoleGuard roles={['admin']}>
            <Link style={linkStyle(isActive('/users'))} to="/users">User Admin</Link>
            <Link style={linkStyle(isActive('/audit'))} to="/audit">Audit Logs</Link>
          </RoleGuard>
        </nav>
        <main style={{ flex: 1, padding: '1.5rem', backgroundColor: '#f3f4f6' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function linkStyle(active) {
  return {
    color: active ? '#38bdf8' : '#e5e7eb',
    textDecoration: 'none',
    padding: '0.4rem 0.2rem'
  };
}

export default Layout;
