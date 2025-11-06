import { useEffect, useState } from 'react';
import api from '../services/api.js';

function UserAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState(['viewer', 'editor', 'admin']);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || []);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    api.get('/users/roles')
      .then(function (res) {
        const available = res.data.roles || [];
        setRoles(available);
        if (available.length > 0) {
          setForm(function (current) {
            return { ...current, role: current.role || available[0] };
          });
        }
      })
      .catch(function () {
        setError(function (prev) { return prev || 'Failed to load roles'; });
      });
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    try {
  await api.post('/users', form);
  setForm({ name: '', email: '', password: '', role: roles[0] || 'viewer' });
      loadUsers();
    } catch (err) {
      setError(err.response && err.response.data ? err.response.data.message : 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(id, role) {
    try {
      await api.patch('/users/' + id + '/role', { role: role });
      loadUsers();
    } catch (err) {
      setError('Role update failed');
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>User Management</h2>
      <p style={{ color: '#4b5563' }}>Admins can provision accounts and adjust roles. Changes are audited automatically.</p>

      <form onSubmit={handleCreate} style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <input
          type="text"
          required
          placeholder="Name"
          value={form.name}
          onChange={function (e) { setForm({ ...form, name: e.target.value }); }}
          style={fieldStyle}
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={function (e) { setForm({ ...form, email: e.target.value }); }}
          style={fieldStyle}
        />
        <input
          type="password"
          required
          placeholder="Temporary password"
          value={form.password}
          onChange={function (e) { setForm({ ...form, password: e.target.value }); }}
          style={fieldStyle}
        />
        <select value={form.role} onChange={function (e) { setForm({ ...form, role: e.target.value }); }} style={fieldStyle}>
          {roles.map(function (role) { return <option key={role} value={role}>{role}</option>; })}
        </select>
        <button type="submit" disabled={saving} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem' }}>
          {saving ? 'Creating...' : 'Create User'}
        </button>
      </form>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading ? <p>Loading users...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
            <thead>
              <tr style={{ backgroundColor: '#e5e7eb' }}>
                <th style={cell}>Name</th>
                <th style={cell}>Email</th>
                <th style={cell}>Role</th>
                <th style={cell}>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map(function (user) {
                return (
                  <tr key={user._id || user.id}>
                    <td style={cell}>{user.name}</td>
                    <td style={cell}>{user.email}</td>
                    <td style={cell}>
                      <select value={user.role} onChange={function (e) { handleRoleChange(user._id || user.id, e.target.value); }} style={{ padding: '0.3rem' }}>
                        {roles.map(function (role) { return <option key={role} value={role}>{role}</option>; })}
                      </select>
                    </td>
                    <td style={cell}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const fieldStyle = { padding: '0.5rem', border: '1px solid #cbd5f5', borderRadius: '4px' };
const cell = { padding: '0.6rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' };

export default UserAdminPage;
