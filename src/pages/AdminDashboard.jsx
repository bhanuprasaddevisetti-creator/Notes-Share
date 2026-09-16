import { useEffect, useState } from 'react'
import { getAdminStats, formatBytes, setUserBanned, deleteUser } from '../lib/admin'
import { deleteNote } from '../lib/notes'

const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024 // 1GB, Supabase free tier

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNotes, setShowNotes] = useState(false)
  const [showColleges, setShowColleges] = useState(false)
  const [openMenuFor, setOpenMenuFor] = useState(null)

  function refresh() {
    setLoading(true)
    getAdminStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleBanToggle(user) {
    const action = user.banned ? 'unban' : 'ban'
    if (!confirm(`${action === 'ban' ? 'Ban' : 'Unban'} ${user.email}?`)) return
    await setUserBanned(user.id, !user.banned)
    setOpenMenuFor(null)
    refresh()
  }

  async function handleDeleteUser(user) {
    if (!confirm(`Permanently remove ${user.email} from NOTE-X? This deletes their profile and notes.`)) return
    await deleteUser(user.id)
    setOpenMenuFor(null)
    refresh()
  }

  async function handleDeleteNote(note) {
    if (!confirm(`Delete "${note.title}"?`)) return
    await deleteNote(note.id)
    refresh()
  }

  if (loading) return <div className="container" style={{ paddingTop: '2.5rem' }}>Loading stats…</div>

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '2.5rem' }}>
        <p className="error-text">{error}</p>
      </div>
    )
  }

  const storagePct = Math.min(100, (stats.storage_bytes / STORAGE_LIMIT_BYTES) * 100)

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '1.9rem' }}>Admin dashboard</h1>
      <p>A snapshot of who's using NOTE-X and how close you are to the free-tier limits.</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.6rem',
        }}
      >
        <StatCard label="Total members" value={stats.total_users} />
        <StatCard label="Verified" value={stats.verified_users} accent="var(--sage)" />
        <StatCard label="Unverified" value={stats.unverified_users} accent="var(--rust)" />
        <StatCard
          label="Notes uploaded"
          value={stats.total_notes}
          onClick={() => setShowNotes((s) => !s)}
          hint={showNotes ? 'Click to hide' : 'Click to view all'}
        />
        <StatCard
          label="Colleges"
          value={stats.total_colleges}
          onClick={() => setShowColleges((s) => !s)}
          hint={showColleges ? 'Click to hide' : 'Click to view all'}
        />
      </div>

      <div className="card" style={{ marginBottom: '1.6rem' }}>
        <h3>Storage used</h3>
        <p style={{ margin: '0 0 0.6em 0' }}>
          {formatBytes(stats.storage_bytes)} of 1 GB free-tier limit
        </p>
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
        {storagePct > 85 && (
          <p className="error-text" style={{ marginTop: '0.5em' }}>
            You're close to the free storage limit — consider upgrading Supabase or trimming old files.
          </p>
        )}
      </div>

      {showNotes && (
        <div className="card" style={{ marginBottom: '1.6rem' }}>
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
                    <th style={{ padding: '0.4em 0.6em' }}>Score</th>
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
                      <td style={{ padding: '0.4em 0.6em', fontFamily: 'var(--font-mono)' }}>{n.score}</td>
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
      )}

      {showColleges && (
        <div className="card" style={{ marginBottom: '1.6rem' }}>
          <h3>All colleges</h3>
          {!stats.all_colleges || stats.all_colleges.length === 0 ? (
            <p className="hint-text">No colleges yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1.5px solid var(--line)' }}>
                  <th style={{ padding: '0.4em 0.6em 0.4em 0' }}>College</th>
                  <th style={{ padding: '0.4em 0.6em' }}>Verified domain</th>
                  <th style={{ padding: '0.4em 0 0.4em 0.6em' }}>Members</th>
                </tr>
              </thead>
              <tbody>
                {stats.all_colleges.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '0.4em 0.6em 0.4em 0' }}>{c.name}</td>
                    <td style={{ padding: '0.4em 0.6em', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {c.domain || 'not set yet'}
                    </td>
                    <td style={{ padding: '0.4em 0 0.4em 0.6em' }}>{c.member_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="card">
        <h3>Members by college</h3>
        {stats.users_by_college.length === 0 ? (
          <p className="hint-text">No colleges yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1.5px solid var(--line)' }}>
                <th style={{ padding: '0.4em 0' }}>College</th>
                <th style={{ padding: '0.4em 0' }}>Members</th>
              </tr>
            </thead>
            <tbody>
              {stats.users_by_college.map((row) => (
                <tr key={row.college_name} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.4em 0' }}>{row.college_name}</td>
                  <td style={{ padding: '0.4em 0', fontFamily: 'var(--font-mono)' }}>{row.user_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: '1.6rem' }}>
        <h3>All users</h3>
        {!stats.all_users || stats.all_users.length === 0 ? (
          <p className="hint-text">No signups yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1.5px solid var(--line)' }}>
                  <th style={{ padding: '0.4em 0.6em 0.4em 0' }}>Email</th>
                  <th style={{ padding: '0.4em 0.6em' }}>Name</th>
                  <th style={{ padding: '0.4em 0.6em' }}>College</th>
                  <th style={{ padding: '0.4em 0.6em' }}>Year</th>
                  <th style={{ padding: '0.4em 0.6em' }}>Status</th>
                  <th style={{ padding: '0.4em 0 0.4em 0.6em' }}></th>
                </tr>
              </thead>
              <tbody>
                {stats.all_users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '0.4em 0.6em 0.4em 0', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '0.4em 0.6em' }}>{u.full_name || '—'}</td>
                    <td style={{ padding: '0.4em 0.6em' }}>{u.college_name || '—'}</td>
                    <td style={{ padding: '0.4em 0.6em' }}>{u.year || '—'}</td>
                    <td style={{ padding: '0.4em 0.6em', display: 'flex', gap: '0.3em', flexWrap: 'wrap' }}>
                      <span className={`tag ${u.verified ? 'verified' : 'unverified'}`}>
                        {u.verified ? 'verified' : 'unverified'}
                      </span>
                      {u.banned && (
                        <span className="tag" style={{ color: 'var(--rust)', borderColor: 'var(--rust)' }}>
                          banned
                        </span>
                      )}
                      {u.is_admin && (
                        <span className="tag" style={{ color: 'var(--mustard-deep)', borderColor: 'var(--mustard-deep)' }}>
                          admin
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.4em 0 0.4em 0.6em', position: 'relative' }}>
                      {!u.is_admin && (
                        <>
                          <button
                            className="ghost"
                            onClick={() => setOpenMenuFor(openMenuFor === u.id ? null : u.id)}
                          >
                            •••
                          </button>
                          {openMenuFor === u.id && (
                            <div
                              className="card"
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                zIndex: 10,
                                padding: '0.4rem',
                                minWidth: '140px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.2rem',
                              }}
                            >
                              <button
                                className="ghost"
                                style={{ textAlign: 'left', textDecoration: 'none' }}
                                onClick={() => handleBanToggle(u)}
                              >
                                {u.banned ? 'Unban user' : 'Ban user'}
                              </button>
                              <button
                                className="ghost"
                                style={{ textAlign: 'left', textDecoration: 'none', color: 'var(--rust)' }}
                                onClick={() => handleDeleteUser(u)}
                              >
                                Delete user
                              </button>
                            </div>
                          )}
                        </>
                      )}
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

function StatCard({ label, value, accent, onClick, hint }) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <p className="hint-text" style={{ margin: '0 0 0.3em 0' }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-head)',
          fontSize: '2rem',
          fontWeight: 600,
          color: accent || 'var(--ink)',
          margin: 0,
        }}
      >
        {value}
      </p>
      {hint && <p className="hint-text" style={{ margin: '0.3em 0 0 0', fontSize: '0.78rem' }}>{hint}</p>}
    </div>
  )
}
