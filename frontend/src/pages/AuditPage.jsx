import { useEffect, useState } from 'react';
import api from '../services/api.js';

function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get('/audit');
        if (mounted) {
          setLogs(res.data.logs || []);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError('Failed to load audit logs');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return function () { mounted = false; };
  }, []);

  if (loading) {
    return <p>Loading logs...</p>;
  }
  if (error) {
    return <p style={{ color: '#dc2626' }}>{error}</p>;
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Audit Trail</h2>
      <p style={{ color: '#4b5563' }}>Showing most recent events with correlation IDs for traceability.</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          <thead>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <th style={cell}>When</th>
              <th style={cell}>Action</th>
              <th style={cell}>User</th>
              <th style={cell}>Target</th>
              <th style={cell}>Correlation</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(function (log) {
              return (
                <tr key={log._id}>
                  <td style={cell}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td style={cell}>{log.action}</td>
                  <td style={cell}>{log.userId}</td>
                  <td style={cell}>{log.targetType} {log.targetId || ''}</td>
                  <td style={cell}>{log.correlationId || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cell = { padding: '0.6rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: '0.9rem' };

export default AuditPage;
