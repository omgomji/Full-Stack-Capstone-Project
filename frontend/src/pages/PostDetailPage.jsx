import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function PostDetailPage() {
  const { id } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await api.get('/posts/' + id);
        if (!active) return;
        setPost(res.data.post);
        setError(null);
      } catch (err) {
        if (!active) return;
        const message = err.response && err.response.data ? err.response.data.message : 'Unable to load post';
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return function () { active = false; };
  }, [id]);

  if (!auth.can('posts:read')) {
    return <p style={{ color: '#dc2626' }}>You do not have permission to view posts.</p>;
  }

  if (loading) {
    return <p>Loading post...</p>;
  }

  if (error) {
    return (
      <div>
        <button onClick={function () { navigate('/posts'); }} style={backButtonStyle}>Back to posts</button>
        <p style={{ color: '#dc2626' }}>{error}</p>
      </div>
    );
  }

  if (!post) return null;

  const isPublished = post.status === 'published';
  const authorLabel = post.authorId ? String(post.authorId) : 'Unknown';

  return (
    <div style={{ maxWidth: '720px' }}>
      <button onClick={function () { navigate('/posts'); }} style={backButtonStyle}>Back to posts</button>
      <h2 style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>{post.title}</h2>
      <p style={{ color: '#64748b', marginTop: 0 }}>
        Status: <strong>{post.status}</strong>
        {isPublished && post.publishedAt ? ' · Published ' + new Date(post.publishedAt).toLocaleString() : ''}
      </p>
      <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(15,23,42,0.08)' }}>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{post.content}</div>
      </div>
  <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Author ID: {authorLabel}</p>
    </div>
  );
}

const backButtonStyle = {
  background: 'transparent',
  border: '1px solid #2563eb',
  color: '#2563eb',
  padding: '0.45rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default PostDetailPage;
