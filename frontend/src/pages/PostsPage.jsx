import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PermissionGate from '../components/PermissionGate.jsx';

function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = useAuth();
  const navigate = useNavigate();

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await api.get('/posts');
      setPosts(res.data.posts || []);
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete('/posts/' + id);
      loadPosts();
    } catch (err) {
      setError('Delete failed: ' + (err.response && err.response.data ? err.response.data.message : 'unknown error'));
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Posts</h2>
        <PermissionGate action="posts:create" scope="own" deniedMessage="Editors only">
          {function ({ allowed }) {
            return (
              <button
                onClick={function () { navigate('/posts/new'); }}
                disabled={!allowed}
                style={{ backgroundColor: allowed ? '#2563eb' : '#9ca3af', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}
              >
                New Post
              </button>
            );
          }}
        </PermissionGate>
      </div>
      {loading && <p>Loading posts...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {!loading && posts.length === 0 && <p>No posts available.</p>}
      {posts.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
            <thead>
              <tr style={{ backgroundColor: '#e5e7eb' }}>
                <th style={cellStyle}>Title</th>
                <th style={cellStyle}>Status</th>
                <th style={cellStyle}>Author</th>
                <th style={cellStyle}>Updated</th>
                <th style={cellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(function (post) {
                return (
                  <tr key={post._id}>
                    <td style={cellStyle}>{post.title}</td>
                    <td style={cellStyle}><StatusBadge status={post.status} /></td>
                    <td style={cellStyle}>{String(post.authorId) === auth.user.id ? 'You' : post.authorId}</td>
                    <td style={cellStyle}>{new Date(post.updatedAt).toLocaleString()}</td>
                    <td style={cellStyle}>
                      <PermissionGate action="posts:read" scope={String(post.authorId) === auth.user.id ? 'own' : 'any'} deniedMessage="Not permitted">
                        {function ({ allowed }) {
                          return (
                            <Link
                              style={{ marginRight: '0.5rem', color: allowed ? '#2563eb' : '#9ca3af', pointerEvents: allowed ? 'auto' : 'none' }}
                              to={allowed ? '/posts/' + post._id + '/view' : '#'}
                            >
                              View
                            </Link>
                          );
                        }}
                      </PermissionGate>
                      <PermissionGate action="posts:update" scope={String(post.authorId) === auth.user.id ? 'own' : 'any'} deniedMessage="Not permitted">
                        {function ({ allowed }) {
                          return (
                            <Link style={{ marginRight: '0.5rem', color: allowed ? '#2563eb' : '#9ca3af', pointerEvents: allowed ? 'auto' : 'none' }} to={allowed ? '/posts/' + post._id : '#'}>
                              Edit
                            </Link>
                          );
                        }}
                      </PermissionGate>
                      <PermissionGate action="posts:delete" scope={String(post.authorId) === auth.user.id ? 'own' : 'any'} deniedMessage="Not permitted">
                        {function ({ allowed }) {
                          return (
                            <button
                              onClick={function () { handleDelete(post._id); }}
                              disabled={!allowed}
                              style={{ background: 'transparent', border: 'none', color: allowed ? '#dc2626' : '#9ca3af' }}
                            >
                              Delete
                            </button>
                          );
                        }}
                      </PermissionGate>
                    </td>
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

function StatusBadge(props) {
  const color = props.status === 'published' ? '#10b981' : '#f59e0b';
  return <span style={{ backgroundColor: color, color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>{props.status}</span>;
}

const cellStyle = { padding: '0.6rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' };

export default PostsPage;
