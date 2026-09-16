import { useEffect, useState } from 'react'
import { getSubAdminStats, formatBytes } from '../lib/admin'
import { deleteNote } from '../lib/notes'

const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024 // 1GB, Supabase free tier

export default function SubAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  function refresh() {
    setLoading(true)
    getSubAdminStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleDeleteNote(note) {
    if (!confirm(`Delete "${note.title}"?`)) return
    await deleteNote(note.id)
    refresh()
  }

  if (loading) return <div className="container" style={{ paddingTop: '2.5rem' }}>Loading…</div>
  if (error) return <div className="container" style={{ paddingTop: '2.5rem' }}><p className="error-text">{error}</p></div>

  const storagePct = Math.min(100, (stats.storage_bytes / STORAGE_LIMIT_BYTES) * 100)

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '1.9rem' }}>Moderation dashboard</h1>
      <p>You're a sub-admin — you can review notes and see overall usage.</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.6rem',
        }}
      >
        <div className="card">
          <p className="hint-text" style={{ margin: '0 0 0.3em 0' }}>Total members</p>
          <p style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 600, margin: 0 }}>
            {stats.total_users}
          </p>
        </div>
        <div className="card">
          <p className="hint-text" style={{ margin: '0 0 0.3em 0' }}>Notes uploaded</p>
          <p style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 600, margin: 0 }}>
            {stats.total_notes}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.6rem' }}>
        <h3>Storage used</h3>
        <p style={{ margin: '0 0 0.6em 0' }}>{formatBytes(stats.storage_bytes)} of 1 GB free-tier limit</p>
        <div
          style={{
            height: '10px',
            width: '100%',
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${storagePct}%`,
              background: storagePct > 85 ? 'var(--rust)' : 'var(--mustard)',
            }}
          />
        </div>
      </div>

      <div className="card">
        <h3>All notes</h3>
        {!stats.all_notes || stats.all_notes.length === 0 ? (
          <p className="hint-text">No notes uploaded yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1.5px solid var(--line)' }}>
                  <th style={{ padding: '0.4em 0.6em 0.4em 0' }}>Title</th>
                  <th style={{ padding: '0.4em 0.6em' }}>Subject</th>
                  <th style={{ padding: '0.4em 0.6em' }}>College</th>
                  <th style={{ padding: '0.4em 0.6em' }}>Uploader</th>
                  <th style={{ padding: '0.4em 0 0.4em 0.6em' }}></th>
                </tr>
              </thead>
              <tbody>
                {stats.all_notes.map((n) => (
                  <tr key={n.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '0.4em 0.6em 0.4em 0' }}>{n.title}</td>
                    <td style={{ padding: '0.4em 0.6em' }}>{n.subject}</td>
                    <td style={{ padding: '0.4em 0.6em' }}>{n.college_name || '—'}</td>
                    <td style={{ padding: '0.4em 0.6em' }}>{n.uploader_name || '—'}</td>
                    <td style={{ padding: '0.4em 0 0.4em 0.6em' }}>
                      <button className="ghost" style={{ color: 'var(--rust)' }} onClick={() => handleDeleteNote(n)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
