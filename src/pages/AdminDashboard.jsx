import { useEffect, useState } from 'react'
import { getAdminStats, formatBytes } from '../lib/admin'

const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024 // 1GB, Supabase free tier

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

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
      <p>A snapshot of who's using Shelf and how close you are to the free-tier limits.</p>

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
        <StatCard label="Notes uploaded" value={stats.total_notes} />
        <StatCard label="Colleges" value={stats.total_colleges} />
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
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className="card">
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
    </div>
  )
}
