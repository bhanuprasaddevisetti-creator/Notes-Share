import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Profile({ session, profile }) {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="container" style={{ maxWidth: '480px', paddingTop: '2.5rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '1.9rem' }}>Your profile</h1>
      <p>This is the account you're currently logged in with.</p>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.4rem' }}>
          <span
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--mustard)',
              border: '1.5px solid var(--mustard-deep)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-head)',
              fontWeight: 700,
              fontSize: '1.4rem',
            }}
          >
            {profile?.full_name?.[0]?.toUpperCase() || '?'}
          </span>
          <div>
            <h3 style={{ margin: 0 }}>{profile?.full_name || 'Unnamed'}</h3>
            {profile?.verified ? (
              <span className="tag verified">verified</span>
            ) : (
              <span className="tag unverified">unverified</span>
            )}
          </div>
        </div>

        <div className="field">
          <label>Logged in as (email)</label>
          <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
            {session?.user?.email}
          </p>
        </div>

        <div className="field">
          <label>College</label>
          <p style={{ margin: 0 }}>{profile?.colleges?.name || '—'}</p>
        </div>

        <div className="field">
          <label>Year of study</label>
          <p style={{ margin: 0 }}>{profile?.year || '—'}</p>
        </div>

        <button onClick={handleSignOut} style={{ marginTop: '0.6rem' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
