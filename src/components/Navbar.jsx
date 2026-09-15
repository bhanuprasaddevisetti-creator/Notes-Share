import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Navbar({ session, profile }) {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header
      style={{
        borderBottom: '1.5px solid var(--line)',
        background: 'var(--paper-raised)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-head)',
            fontWeight: 700,
            fontSize: '1.3rem',
            color: 'var(--ink)',
            textDecoration: 'none',
          }}
        >
          NOTE-X
        </Link>

        {session ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <Link to="/browse" style={{ textDecoration: 'none', color: 'var(--ink)' }}>
              Browse
            </Link>
            <Link to="/upload">
              <button className="primary" style={{ padding: '0.45em 1em' }}>
                Upload notes
              </button>
            </Link>
            {profile?.is_admin && (
              <Link to="/admin" style={{ textDecoration: 'none', color: 'var(--ink)' }}>
                Admin
              </Link>
            )}
            <span className="hint-text" style={{ marginLeft: '0.3rem' }}>
              {profile?.full_name?.split(' ')[0] || 'You'}
              {profile?.verified && (
                <span className="tag verified" style={{ marginLeft: '0.4em' }}>
                  verified
                </span>
              )}
            </span>
            <button className="ghost" onClick={handleSignOut}>
              Sign out
            </button>
          </nav>
        ) : (
          <Link to="/auth">
            <button className="primary">Sign in</button>
          </Link>
        )}
      </div>
    </header>
  )
}
