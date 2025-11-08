import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

function LoginPage() {
  const auth = useAuth();
  const notifications = useNotification();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await auth.login(form);
      notifications.notify('Login successful', 'success');
    } catch (err) {
      setError(err.response && err.response.data ? err.response.data.message : 'Unable to login');
      setSubmitting(false);
      notifications.notify('Login failed', 'error');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827' }}>
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', width: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', textAlign: 'center' }}>RBAC Console</h2>
        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={function (e) { setForm({ ...form, email: e.target.value }); }}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={function (e) { setForm({ ...form, password: e.target.value }); }}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        {error && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" disabled={submitting} style={{ width: '100%', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '4px' }}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
