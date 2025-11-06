import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function DashboardPage() {
  const auth = useAuth();
  const [insights, setInsights] = useState({ posts: 0, published: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    async function fetchData() {
      try {
        const postsRes = await api.get('/posts');
        const posts = postsRes.data.posts || [];
        const published = posts.filter(function (p) { return p.status === 'published'; }).length;
        let usersCount = 0;
        if (auth.can('users:read')) {
          const usersRes = await api.get('/users');
          usersCount = usersRes.data.users.length;
        }
        if (mounted) {
          setInsights({ posts: posts.length, published: published, users: usersCount });
          setError(null);
        }
      } catch (err) {
        if (mounted) setError('Failed to load dashboard data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return function () { mounted = false; };
  }, [auth]);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p style={{ color: '#dc2626' }}>{error}</p>;
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Welcome back, {auth.user.name}</h2>
      <p style={{ color: '#4b5563' }}>Your role grants {auth.user.role === 'admin' ? 'full system access.' : auth.user.role === 'editor' ? 'content authoring rights.' : 'read-only visibility.'}</p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <DashboardCard title="Total Posts" value={insights.posts} hint="Scoped based on your permissions" />
        <DashboardCard title="Published" value={insights.published} hint="Visible to viewers" />
        {auth.can('users:read') && <DashboardCard title="Users" value={insights.users} hint="Admin only statistic" />}
      </div>
    </div>
  );
}

function DashboardCard(props) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(15,23,42,0.1)', minWidth: '180px' }}>
      <h3 style={{ marginTop: 0 }}>{props.title}</h3>
      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{props.value}</div>
      <p style={{ color: '#6b7280', marginBottom: 0 }}>{props.hint}</p>
    </div>
  );
}

export default DashboardPage;
