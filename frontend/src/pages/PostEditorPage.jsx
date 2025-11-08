import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

function PostEditorPage(props) {
  const navigate = useNavigate();
  const params = useParams();
  const auth = useAuth();
  const notifications = useNotification();
  const isEdit = props.mode === 'edit';
  const [form, setForm] = useState({ title: '', content: '', status: 'draft' });
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [ownerId, setOwnerId] = useState(null);

  const scope = useMemo(function () {
    if (!isEdit) return 'own';
    if (!ownerId) return 'any';
    return ownerId === auth.user.id ? 'own' : 'any';
  }, [isEdit, ownerId, auth.user.id]);

  useEffect(function () {
    if (!isEdit) {
      if (!auth.can('posts:create', 'own')) {
        setError('You do not have permission to create posts.');
      }
      return;
    }
    async function loadPost() {
      try {
        const res = await api.get('/posts/' + params.id);
        setForm({
          title: res.data.post.title,
          content: res.data.post.content,
          status: res.data.post.status
        });
        setOwnerId(res.data.post.authorId);
        setError(null);
      } catch (err) {
        setError('Unable to load post.');
        if (err.response && err.response.status === 403) {
          notifications.notify('Permission denied while loading this post', 'error');
        }
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [isEdit, params.id, auth, notifications]);

  const canPerform = auth.can(isEdit ? 'posts:update' : 'posts:create', scope);

  useEffect(function () {
    if (!canPerform) {
      notifications.notify('Permission denied for this action', 'error');
    }
  }, [canPerform, notifications]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!canPerform) {
    return <p style={{ color: '#dc2626' }}>Access denied for this action.</p>;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = isEdit
        ? await api.put('/posts/' + params.id, form)
        : await api.post('/posts', form);

      const post = response.data ? response.data.post : null;
      if (post && post.status === 'published') {
        notifications.notify('Post published successfully', 'success');
      } else {
        notifications.notify('Post saved successfully', 'success');
      }
      navigate('/posts');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        notifications.notify('Permission denied: unable to save this post', 'error');
      }
      setError(err.response && err.response.data ? err.response.data.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{isEdit ? 'Edit Post' : 'Create Post'}</h2>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>
          <span style={{ display: 'block', marginBottom: '0.25rem' }}>Title</span>
          <input
            type="text"
            value={form.title}
            onChange={function (e) { setForm({ ...form, title: e.target.value }); }}
            required
            style={{ padding: '0.5rem', width: '100%' }}
          />
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: '0.25rem' }}>Content</span>
          <textarea
            value={form.content}
            onChange={function (e) { setForm({ ...form, content: e.target.value }); }}
            required
            rows={8}
            style={{ padding: '0.5rem', width: '100%' }}
          />
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: '0.25rem' }}>Status</span>
          <select
            value={form.status}
            onChange={function (e) { setForm({ ...form, status: e.target.value }); }}
            style={{ padding: '0.5rem', width: '200px' }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <div>
          <button type="submit" disabled={saving} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={function () { navigate('/posts'); }} style={{ marginLeft: '0.75rem', background: 'transparent', border: '1px solid #64748b', padding: '0.6rem 1.2rem', borderRadius: '4px' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostEditorPage;
